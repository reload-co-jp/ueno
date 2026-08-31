// 既存スポット(data/spots.json)の画像を後付け・自前保存する1回限りのバックフィル。
// 対象: imageUrlが無いスポット。officialUrlのページから画像候補を抽出して1件保存する。
// 実行: pnpm backfill-spot-images [--force]
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { extractImageCandidates } from "./lib/extract"
import { fetchAndValidateImage, isLocalImage, saveImageToPublic } from "./lib/save-image"
import { sleep, USER_AGENT } from "./lib/fetch-raw"
import type { Spot } from "@/lib/types"

const REQUEST_INTERVAL_MS = 2000 // 対象サイトへの負荷配慮
const IMAGE_DIR = "spots"

const SPOTS_PATH = path.join(process.cwd(), "data", "spots.json")

// ページから画像候補を出現順に取得し、サイズ検証を通った最初の1件を保存する。
const fetchAndSaveImage = async (pageUrl: string) => {
  let candidates: string[] = []
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.5" },
    })
    if (res.ok) {
      const html = await res.text()
      candidates = extractImageCandidates(html, pageUrl)
    }
  } catch (err) {
    console.log(`  取得失敗: ${pageUrl} (${err instanceof Error ? err.message : String(err)})`)
  }

  let localPath: string | null = null
  for (const candidateUrl of candidates) {
    const validated = await fetchAndValidateImage(candidateUrl)
    if (validated) {
      localPath = await saveImageToPublic(IMAGE_DIR, candidateUrl, validated.buffer, validated.ext)
      break
    }
  }
  await sleep(REQUEST_INTERVAL_MS)
  return localPath
}

const main = async () => {
  const force = process.argv.includes("--force")

  const raw = await readFile(SPOTS_PATH, "utf-8")
  const spotItems: Spot[] = JSON.parse(raw)

  console.log("=== data/spots.json ===")
  for (const [i, spot] of spotItems.entries()) {
    const alreadyLocal = isLocalImage(IMAGE_DIR, spot.imageUrl ?? null)
    if (alreadyLocal && !force) continue
    if (!spot.officialUrl) continue
    process.stdout.write(`[${i + 1}/${spotItems.length}] ${spot.name} ... `)

    const localPath = await fetchAndSaveImage(spot.officialUrl)
    spot.imageUrl = localPath
    console.log(localPath ? "画像あり" : "画像なし")
  }

  await writeFile(SPOTS_PATH, JSON.stringify(spotItems, null, 2) + "\n", "utf-8")
  console.log("完了")
}

main()
