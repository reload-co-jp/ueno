// README「3. 情報収集フロー」 店舗・施設・スポットと紐付け → 記事生成
// 実行: pnpm generate-articles
// data/drafts/articles.json の各ドラフトについて本文を生成し、上書き保存する。
// 公開前に人手で内容を確認すること(README「確認 → 公開」)。
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { existsSync } from "node:fs"
import { generateArticleBody } from "./lib/generate-article"
import type { ExtractedItem } from "./lib/extract"
import type { Category } from "@/lib/types"

const DRAFTS_PATH = path.join(process.cwd(), "data", "drafts", "articles.json")

interface ArticleDraft {
  id: string
  title: string
  category: Category
  publishedAt: string
  summary: string
  body: string
  sources: string[]
  area: string
  relatedStoreIds: string[]
  relatedSpotIds: string[]
  relatedEventIds: string[]
  imageUrl: string | null
  matchNotes: string[]
  extracted: ExtractedItem
}

const main = async () => {
  if (!existsSync(DRAFTS_PATH)) {
    console.error("data/drafts/articles.json が無い。先に pnpm dedupe-and-link を実行。")
    process.exit(1)
  }

  const drafts: ArticleDraft[] = JSON.parse(await readFile(DRAFTS_PATH, "utf-8"))

  for (const [i, draft] of drafts.entries()) {
    process.stdout.write(`[${i + 1}/${drafts.length}] ${draft.title} ... `)
    const body = await generateArticleBody({
      category: draft.category,
      title: draft.title,
      summary: draft.summary,
      area: draft.area,
      store: draft.extracted.store,
      place: draft.extracted.place,
      address: draft.extracted.address,
      openingDate: draft.extracted.opening_date,
      startDate: draft.extracted.start_date,
      endDate: draft.extracted.end_date,
      fee: draft.extracted.fee,
      officialUrl: draft.extracted.official_url,
    })
    draft.body = body
    console.log("完了")
  }

  await writeFile(DRAFTS_PATH, JSON.stringify(drafts, null, 2), "utf-8")
  console.log(`本文生成完了。data/drafts/articles.json を確認のうえ pnpm publish-drafts で公開する。`)
}

main()
