// README「3. 情報収集フロー」 確認 → 公開
// 実行: pnpm publish-drafts
// 人手確認済みの data/drafts/articles.json を data/news.json にマージし、公開する。
// マージ後、data/drafts/articles.json は空配列にリセットする。
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { news } from "@/lib/data"
import type { NewsArticle } from "@/lib/types"
import { downloadAndSaveImage, isLocalArticleImage } from "./lib/save-image"

const DRAFTS_PATH = path.join(process.cwd(), "data", "drafts", "articles.json")
const NEWS_PATH = path.join(process.cwd(), "data", "news.json")

const main = async () => {
  const raw = await readFile(DRAFTS_PATH, "utf-8")
  const drafts = JSON.parse(raw) as Array<
    Omit<NewsArticle, never> & { matchNotes?: string[]; extracted?: unknown }
  >

  if (drafts.length === 0) {
    console.log("公開待ちのドラフトは無い。")
    return
  }

  const existingIds = new Set(news.map((n) => n.id))
  const toPublish: NewsArticle[] = []
  const skipped: string[] = []

  for (const draft of drafts) {
    if (existingIds.has(draft.id)) {
      skipped.push(draft.id)
      continue
    }
    delete draft.matchNotes
    delete draft.extracted

    // 外部URLのままの画像は自前保存に差し替える。他サイトへのホットリンクを避けるため。
    if (draft.imageUrl && !isLocalArticleImage(draft.imageUrl)) {
      draft.imageUrl = await downloadAndSaveImage(draft.imageUrl)
    }

    existingIds.add(draft.id) // 同一バッチ内のドラフト重複も弾く
    toPublish.push(draft as NewsArticle)
  }

  const merged = [...news, ...toPublish]
  await writeFile(NEWS_PATH, JSON.stringify(merged, null, 2), "utf-8")
  await writeFile(DRAFTS_PATH, "[]\n", "utf-8")

  console.log(`${toPublish.length}件公開 -> data/news.json`)
  if (skipped.length) console.log(`${skipped.length}件は既存id重複でスキップ`)
}

main()
