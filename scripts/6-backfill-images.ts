// 既存記事(data/news.json, data/drafts/articles.json)の画像を後付け・自前保存する1回限りのバックフィル。
// 対象: imageUrlが無い記事、および外部URLのままローカル保存されていない記事(旧データ移行用)。
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

// ページから画像候補を出現順に取得し、サイズ検証を通った最初の1件を保存する。
const fetchAndSaveImage = async (cache: Map<string, string | null>, pageUrl: string) => {
  if (cache.has(pageUrl)) return cache.get(pageUrl)!

  let localPath: string | null = null
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.5" },
    })
    if (res.ok) {
      const html = await res.text()
      const candidates = extractImageCandidates(html, pageUrl)
      for (const candidateUrl of candidates) {
        const validated = await fetchAndValidateImage(candidateUrl)
        if (validated) {
          localPath = await saveImageToPublic(candidateUrl, validated.buffer, validated.ext)
          break
        }
      }
    }
  } catch (err) {
    console.log(`  取得失敗: ${pageUrl} (${err instanceof Error ? err.message : String(err)})`)
  }
  cache.set(pageUrl, localPath)
  await sleep(REQUEST_INTERVAL_MS)
  return localPath
}

const backfill = async (filePath: string, cache: Map<string, string | null>, force: boolean) => {
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
  const cache = new Map<string, string | null>()
  console.log("=== data/news.json ===")
  await backfill(NEWS_PATH, cache, force)
  console.log("=== data/drafts/articles.json ===")
  await backfill(DRAFTS_PATH, cache, force)
  console.log("完了")
}

main()
