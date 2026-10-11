import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import type { Source } from "./sources"

// スクレイピング対象への配慮
// - User-Agent明示、連続アクセス時は必ずインターバルを空ける (see scripts/1-scrape.ts)
// - 各サイトのrobots.txt / 利用規約の許諾範囲内でのみ収集する
export const USER_AGENT = "UenoNaviBot/1.0 (+https://example.com/about; contact: yamamoto@reload.co.jp)"

export interface RawRecord {
  sourceId: string
  sourceName: string
  url: string
  fetchedAt: string
  status: number | "error"
  html: string
  error?: string
}

const RAW_DIR = path.join(process.cwd(), "data", "raw")

export const fetchRaw = async (source: Source): Promise<RawRecord> => {
  const fetchedAt = new Date().toISOString()
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.5" },
    })
    const html = await res.text()
    return {
      sourceId: source.id,
      sourceName: source.name,
      url: source.url,
      fetchedAt,
      status: res.status,
      html,
    }
  } catch (err) {
    return {
      sourceId: source.id,
      sourceName: source.name,
      url: source.url,
      fetchedAt,
      status: "error",
      html: "",
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// 詳細ページ個別fetch用(一覧ページに画像が無いサイトで、記事詳細ページから画像を拾う場合等)。
// 保存はせず、取得失敗時は空文字列を返す。
export const fetchHtml = async (url: string): Promise<string> => {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.5" },
    })
    return await res.text()
  } catch {
    return ""
  }
}

export const saveRaw = async (record: RawRecord) => {
  const dir = path.join(RAW_DIR, record.sourceId)
  await mkdir(dir, { recursive: true })
  const filename = `${record.fetchedAt.replace(/[:.]/g, "-")}.json`
  const filePath = path.join(dir, filename)
  await writeFile(filePath, JSON.stringify(record, null, 2), "utf-8")
  return filePath
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Googleニュース RSSの記事URL(news.google.com/rss/articles/<id>)はHTTPリダイレクトせずJSで遷移するため、
// そのままfetchするとGoogleのページ(og:image=Googleロゴ)が返る。記事ページの署名を取得し、
// batchexecute API(garturlreq)で元記事URLにデコードする。非公開APIのため失敗時はnullを返す。
export const resolveGoogleNewsUrl = async (url: string): Promise<string | null> => {
  const id = url.match(/news\.google\.com\/(?:rss\/)?articles\/([^/?#]+)/)?.[1]
  if (!id) return null
  try {
    const html = await fetchHtml(`https://news.google.com/articles/${id}`)
    const sg = html.match(/data-n-a-sg="([^"]+)"/)?.[1]
    const ts = html.match(/data-n-a-ts="([^"]+)"/)?.[1]
    if (!sg || !ts) return null
    const payload = `["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0],"${id}",${ts},"${sg}"]`
    const res = await fetch("https://news.google.com/_/DotsSplashUi/data/batchexecute", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", "User-Agent": USER_AGENT },
      body: `f.req=${encodeURIComponent(JSON.stringify([[["Fbv4je", payload, null, "generic"]]]))}`,
    })
    const text = await res.text()
    const decoded = JSON.parse(JSON.parse(text.split("\n\n")[1])[0][2])[1]
    return typeof decoded === "string" && decoded.startsWith("http") ? decoded : null
  } catch {
    return null
  }
}
