// 既存記事(data/news.json, data/drafts/articles.json)の画像を後付け・自前保存する1回限りのバックフィル。
// 対象: imageUrlが無い記事、および外部URLのままローカル保存されていない記事(旧データ移行用)。
// 同一sources[0](一覧ページ等)を複数記事が共有する場合、画像候補を出現順に1件ずつ割り当てる
// (全記事が同じ画像になるのを避けるための簡易対応。意味的な対応関係の精度は保証しない)。
// 実行: pnpm backfill-images [--force]
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { extractImageCandidates } from "./lib/extract"
import { fetchAndValidateImage, isLocalArticleImage, saveImageToPublic } from "./lib/save-image"
import { sleep, USER_AGENT } from "./lib/fetch-raw"
import type { NewsArticle } from "@/lib/types"

const REQUEST_INTERVAL_MS = 2000 // 対象サイトへの負荷配慮

const NEWS_PATH = path.join(process.cwd(), "data", "news.json")
const DRAFTS_PATH = path.join(process.cwd(), "data", "drafts", "articles.json")

// 同一pageUrlを複数記事が共有する場合(一覧ページ等)に、画像候補を使い回さず
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
      localPath = await saveImageToPublic(candidateUrl, validated.buffer, validated.ext)
      break
    }
  }
  await sleep(REQUEST_INTERVAL_MS)
  return localPath
}

const backfill = async (filePath: string, cache: Map<string, PageEntry>, force: boolean) => {
  const raw = await readFile(filePath, "utf-8")
  const articles: (NewsArticle & { imageUrl?: string | null })[] = JSON.parse(raw)

  for (const [i, article] of articles.entries()) {
    const alreadyLocal = isLocalArticleImage(article.imageUrl ?? null)
    if (alreadyLocal && !force) continue
    const url = article.sources[0]
    if (!url) continue
    process.stdout.write(`[${i + 1}/${articles.length}] ${article.title} ... `)
    const localPath = await fetchAndSaveImage(cache, url)
    article.imageUrl = localPath
    console.log(localPath ? "画像あり" : "画像なし")
  }

  await writeFile(filePath, JSON.stringify(articles, null, 2), "utf-8")
}

const main = async () => {
  const force = process.argv.includes("--force")
  const cache = new Map<string, PageEntry>()
  console.log("=== data/news.json ===")
  await backfill(NEWS_PATH, cache, force)
  console.log("=== data/drafts/articles.json ===")
  await backfill(DRAFTS_PATH, cache, force)
  console.log("完了")
}

main()
