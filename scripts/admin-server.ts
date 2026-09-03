// ローカル専用 admin ツール。spots.json / news.json をブラウザから編集する。
// 起動: pnpm admin (http://localhost:4321)
// 本番には含めない。next export の out/ には一切関与しない。
import http from "node:http"
import { readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import dns from "node:dns/promises"
import net from "node:net"
import { imageSize } from "image-size"
import { saveImageToPublic } from "./lib/save-image"
import { USER_AGENT } from "./lib/fetch-raw"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const DATA_DIR = path.join(ROOT, "data")
const SPOTS_PATH = path.join(DATA_DIR, "spots.json")
const NEWS_PATH = path.join(DATA_DIR, "news.json")
const STORES_PATH = path.join(DATA_DIR, "stores.json")
const PUBLIC_DIR = path.join(__dirname, "admin")
const IMAGES_DIR = path.join(ROOT, "public")
const PORT = Number(process.env.ADMIN_PORT ?? 4321)

type Json = Record<string, unknown>

const readJson = async (file: string): Promise<Json[]> =>
  JSON.parse(await readFile(file, "utf-8"))

const writeJson = async (file: string, data: Json[]) =>
  writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf-8")

const sendJson = (res: http.ServerResponse, status: number, body: unknown) => {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
  })
  res.end(payload)
}

const readBody = (req: http.IncomingMessage): Promise<Json> =>
  new Promise((resolve, reject) => {
    let raw = ""
    req.on("data", (chunk) => (raw += chunk))
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on("error", reject)
  })

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
}

const serveFrom = async (res: http.ServerResponse, baseDir: string, rel: string) => {
  const filePath = path.join(baseDir, rel)
  if (!filePath.startsWith(baseDir) || !existsSync(filePath)) {
    res.writeHead(404)
    res.end("Not found")
    return
  }
  const ext = path.extname(filePath)
  const body = await readFile(filePath)
  res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" })
  res.end(body)
}

// spots/news の imageUrl は "/images/..." (public/images 配下) を指す
const serveStatic = async (res: http.ServerResponse, urlPath: string) => {
  if (urlPath.startsWith("/images/")) {
    await serveFrom(res, IMAGES_DIR, urlPath)
    return
  }
  const rel = urlPath === "/" ? "/index.html" : urlPath
  await serveFrom(res, PUBLIC_DIR, rel)
}

// SSRF対策: ユーザー指定URLの取得先が内部/プライベートアドレスを指していないか検証する。
// (リダイレクト先も1ホップごとに再検証する)
const isPrivateIp = (ip: string): boolean => {
  const type = net.isIP(ip)
  if (type === 4) {
    const [a, b] = ip.split(".").map(Number)
    if (a === 10 || a === 127 || a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    return false
  }
  if (type === 6) {
    const norm = ip.toLowerCase()
    if (norm === "::1" || norm === "::") return true
    if (/^f[cd]/.test(norm)) return true // fc00::/7 unique-local
    if (/^fe[89ab]/.test(norm)) return true // fe80::/10 link-local
    const v4Mapped = norm.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (v4Mapped) return isPrivateIp(v4Mapped[1])
    return false
  }
  return true // 解決できないアドレス種別は拒否
}

const assertPublicHost = async (hostname: string) => {
  const addrs = await dns.lookup(hostname, { all: true })
  if (!addrs.length) throw new Error("DNS解決失敗")
  for (const a of addrs) {
    if (isPrivateIp(a.address)) throw new Error(`内部アドレスへのアクセスは禁止: ${hostname}`)
  }
}

const IMAGE_MIN_SIZE = 200
const IMAGE_EXT_BY_TYPE: Record<string, string> = { jpg: "jpg", jpeg: "jpg", png: "png", gif: "gif", webp: "webp" }
const MAX_REDIRECTS = 5

// 手動リダイレクト追従で各ホップごとにSSRFチェックする画像取得。
// downloadAndSaveImage (lib/save-image.ts) はリダイレクトを自動追従し内部向け再検証を行わないため
// 外部URLを直接受け取るこのエンドポイント専用に、ここで検証込みの取得を行う。
const safeFetchImage = async (startUrl: string): Promise<{ buffer: Buffer; ext: string }> => {
  let current = startUrl
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const u = new URL(current)
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("http(s) のみ許可")
    await assertPublicHost(u.hostname)

    const res = await fetch(current, {
      redirect: "manual",
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.5" },
    })

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location")
      if (!location) throw new Error("リダイレクト先不明")
      current = new URL(location, current).toString()
      continue
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const buffer = Buffer.from(await res.arrayBuffer())
    const dimensions = imageSize(new Uint8Array(buffer))
    const ext = IMAGE_EXT_BY_TYPE[dimensions.type ?? ""]
    if (!ext) throw new Error("非対応の画像形式")
    if (dimensions.width < IMAGE_MIN_SIZE || dimensions.height < IMAGE_MIN_SIZE)
      throw new Error(`画像が小さすぎる (${IMAGE_MIN_SIZE}px未満)`)
    return { buffer, ext }
  }
  throw new Error("リダイレクトが多すぎる")
}

// 次の連番id(news用。既存の数値id最大+1)
const nextNewsId = (items: Json[]): string => {
  const max = items.reduce((m, item) => {
    const n = Number(item.id)
    return Number.isFinite(n) && n > m ? n : m
  }, 0)
  return String(max + 1)
}

type Resource = {
  path: string
  file: string
  idIsClientProvided: boolean
}

const RESOURCES: Resource[] = [
  { path: "/api/spots", file: SPOTS_PATH, idIsClientProvided: true },
  { path: "/api/news", file: NEWS_PATH, idIsClientProvided: false },
]

const handleResource = async (
  res: http.ServerResponse,
  req: http.IncomingMessage,
  resource: Resource,
  id: string | null
) => {
  const items = await readJson(resource.file)

  if (req.method === "GET" && !id) {
    sendJson(res, 200, items)
    return
  }

  if (req.method === "POST" && !id) {
    const body = await readBody(req)
    if (resource.idIsClientProvided) {
      const newId = String(body.id ?? "").trim()
      if (!newId) return sendJson(res, 400, { error: "id は必須" })
      if (items.some((i) => i.id === newId))
        return sendJson(res, 400, { error: `id "${newId}" は既に存在` })
      body.id = newId
    } else {
      body.id = nextNewsId(items)
    }
    items.push(body)
    await writeJson(resource.file, items)
    sendJson(res, 201, body)
    return
  }

  if (req.method === "PUT" && id) {
    const idx = items.findIndex((i) => i.id === id)
    if (idx === -1) return sendJson(res, 404, { error: "not found" })
    const body = await readBody(req)
    items[idx] = { ...body, id }
    await writeJson(resource.file, items)
    sendJson(res, 200, items[idx])
    return
  }

  if (req.method === "DELETE" && id) {
    const idx = items.findIndex((i) => i.id === id)
    if (idx === -1) return sendJson(res, 404, { error: "not found" })
    items.splice(idx, 1)
    await writeJson(resource.file, items)
    sendJson(res, 200, { ok: true })
    return
  }

  sendJson(res, 405, { error: "method not allowed" })
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`)

    if (url.pathname === "/api/image" && req.method === "POST") {
      const body = await readBody(req)
      const imageUrl = String(body.url ?? "").trim()
      const dir = body.dir === "articles" ? "articles" : "spots"
      if (!/^https?:\/\//.test(imageUrl)) {
        sendJson(res, 400, { error: "http(s) の URL を指定" })
        return
      }
      try {
        const { buffer, ext } = await safeFetchImage(imageUrl)
        const saved = await saveImageToPublic(dir, imageUrl, buffer, ext)
        sendJson(res, 200, { imageUrl: saved })
      } catch (err) {
        sendJson(res, 422, { error: err instanceof Error ? err.message : "取得失敗" })
      }
      return
    }

    if (url.pathname === "/api/stores" && req.method === "GET") {
      const stores = await readJson(STORES_PATH)
      sendJson(
        res,
        200,
        stores.map((s) => ({ id: s.id, name: s.name }))
      )
      return
    }

    if (url.pathname === "/api/areas" && req.method === "GET") {
      const [spots, news, stores] = await Promise.all([
        readJson(SPOTS_PATH),
        readJson(NEWS_PATH),
        readJson(STORES_PATH),
      ])
      const areas = new Set<string>()
      ;[...spots, ...news, ...stores].forEach((i) => {
        if (typeof i.area === "string") areas.add(i.area)
      })
      sendJson(res, 200, [...areas].sort())
      return
    }

    for (const resource of RESOURCES) {
      if (url.pathname === resource.path) {
        await handleResource(res, req, resource, null)
        return
      }
      if (url.pathname.startsWith(resource.path + "/")) {
        const id = decodeURIComponent(url.pathname.slice(resource.path.length + 1))
        await handleResource(res, req, resource, id)
        return
      }
    }

    if (url.pathname.startsWith("/api/")) {
      sendJson(res, 404, { error: "unknown endpoint" })
      return
    }

    await serveStatic(res, url.pathname)
  } catch (err) {
    console.error(err)
    sendJson(res, 500, { error: String(err instanceof Error ? err.message : err) })
  }
})

// ローカル専用ツールのためループバックのみで待受(外部ネットワークからの到達を遮断)
server.listen(PORT, "127.0.0.1", () => {
  console.log(`admin tool: http://localhost:${PORT}`)
})
