// 既存記事(data/news.json, data/drafts/articles.json)にOGP画像を後付けする1回限りのバックフィル。
// 実行: pnpm backfill-images
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { extractImageUrl } from "./lib/extract"
import { sleep } from "./lib/fetch-raw"
import type { NewsArticle } from "@/lib/types"

const REQUEST_INTERVAL_MS = 2000 // 対象サイトへの負荷配慮
const USER_AGENT = "UenoNaviBot/1.0 (+https://example.com/about; contact: yamamoto@reload.co.jp)"

const NEWS_PATH = path.join(process.cwd(), "data", "news.json")
const DRAFTS_PATH = path.join(process.cwd(), "data", "drafts", "articles.json")

const fetchImageUrl = async (cache: Map<string, string | null>, url: string) => {
  if (cache.has(url)) return cache.get(url)!
  let imageUrl: string | null = null
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.5" },
    })
    if (res.ok) {
      const html = await res.text()
      imageUrl = extractImageUrl(html, url)
    }
  } catch (err) {
    console.log(`  取得失敗: ${url} (${err instanceof Error ? err.message : String(err)})`)
  }
  cache.set(url, imageUrl)
  await sleep(REQUEST_INTERVAL_MS)
  return imageUrl
}

const backfill = async (filePath: string, cache: Map<string, string | null>) => {
  const raw = await readFile(filePath, "utf-8")
  const articles: (NewsArticle & { imageUrl?: string | null; source?: string })[] =
    JSON.parse(raw)

  for (const [i, article] of articles.entries()) {
    if (article.imageUrl) continue
    // dedupeスクリプトの旧版で生成されたdraftは sources ではなく単数の source を持つ
    const url = article.sources?.[0] ?? article.source
    if (!url) continue
    process.stdout.write(`[${i + 1}/${articles.length}] ${article.title} ... `)
    const imageUrl = await fetchImageUrl(cache, url)
    article.imageUrl = imageUrl
    console.log(imageUrl ? "画像あり" : "画像なし")
  }

  await writeFile(filePath, JSON.stringify(articles, null, 2), "utf-8")
}

const main = async () => {
  const cache = new Map<string, string | null>()
  console.log("=== data/news.json ===")
  await backfill(NEWS_PATH, cache)
  console.log("=== data/drafts/articles.json ===")
  await backfill(DRAFTS_PATH, cache)
  console.log("完了")
}

main()
