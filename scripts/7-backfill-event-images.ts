// 既存イベント(data/events.json)の画像を後付け・自前保存する1回限りのバックフィル。
// 対象: imageUrlが無いイベント、および外部URLのままローカル保存されていない記事(旧データ移行用)。
// 同一sourceを複数イベントが共有する場合、画像候補を出現順に1件ずつ割り当てる
// (全イベントが同じ画像になるのを避けるための簡易対応。意味的な対応関係の精度は保証しない)。
// 実行: pnpm backfill-event-images [--force]
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { extractImageCandidates } from "./lib/extract"
import { findOfficialUrl } from "./lib/find-official-page"
import { fetchAndValidateImage, isLocalImage, saveImageToPublic } from "./lib/save-image"
import { sleep, USER_AGENT } from "./lib/fetch-raw"
import type { EventItem } from "@/lib/types"

const REQUEST_INTERVAL_MS = 2000 // 対象サイトへの負荷配慮
const IMAGE_DIR = "events"

const EVENTS_PATH = path.join(process.cwd(), "data", "events.json")

// 同一pageUrlを複数イベントが共有する場合(一覧ページ等)に、画像候補を使い回さず
// 出現順に1件ずつ割り当てるための消費状況。
interface PageEntry {
  candidates: string[]
  nextIndex: number // 次に試す候補のインデックス
}

// ページから画像候補を出現順に取得し、そのページでまだ使っていない候補から
// サイズ検証を通った最初の1件を保存する。同一pageUrlの2件目以降は次の候補から探す。
const fetchAndSaveImage = async (pageCache: Map<string, PageEntry>, pageUrl: string) => {
  let entry = pageCache.get(pageUrl)
  if (!entry) {
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
    entry = { candidates, nextIndex: 0 }
    pageCache.set(pageUrl, entry)
  }

  let localPath: string | null = null
  while (entry.nextIndex < entry.candidates.length) {
    const candidateUrl = entry.candidates[entry.nextIndex]
    entry.nextIndex++
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
  const cache = new Map<string, PageEntry>()

  const raw = await readFile(EVENTS_PATH, "utf-8")
  const eventItems: EventItem[] = JSON.parse(raw)

  console.log("=== data/events.json ===")
  for (const [i, event] of eventItems.entries()) {
    const alreadyLocal = isLocalImage(IMAGE_DIR, event.imageUrl ?? null)
    if (alreadyLocal && !force) continue
    const url = event.officialUrl || event.source
    if (!url) continue
    process.stdout.write(`[${i + 1}/${eventItems.length}] ${event.name} ... `)

    // officialUrl===source: 一覧ページ(kensetsu.metro.tokyo.lg.jp等)に詳細ページ・画像が
    // 無く、抽出時に詳細URLを特定できなかったイベント。イベント名でWeb検索し主催団体側の
    // 公式詳細ページを探してから、そのページで画像取得を試みる。
    let targetUrl = url
    if (event.officialUrl === event.source) {
      const found = await findOfficialUrl(event.name, event.organizer || null, event.area)
      if (found) {
        event.officialUrl = found
        targetUrl = found
      }
    }

    const localPath = await fetchAndSaveImage(cache, targetUrl)
    event.imageUrl = localPath
    console.log(localPath ? "画像あり" : "画像なし")
  }

  await writeFile(EVENTS_PATH, JSON.stringify(eventItems, null, 2) + "\n", "utf-8")
  console.log("完了")
}

main()
