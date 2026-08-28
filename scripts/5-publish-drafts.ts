// README「3. 情報収集フロー」 確認 → 公開
// 実行: pnpm publish-drafts
// 人手確認済みの data/drafts/articles.json を data/news.json にマージし、公開する。
// マージ後、data/drafts/articles.json は空配列にリセットする。
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { news } from "@/lib/data"
import type { NewsArticle } from "@/lib/types"
import { downloadAndSaveImage, isLocalImage } from "./lib/save-image"

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

  // 記事idは連番の文字列("1", "2", ...)。ドラフト時点のid(draft-...)は
  // dedupe用の一時idにすぎないため、公開時に既存news.jsonの最大番号+1から振り直す。
  const numericIds = news.map((n) => Number(n.id)).filter((n) => Number.isInteger(n))
  let nextId = (numericIds.length > 0 ? Math.max(...numericIds) : 0) + 1

  const toPublish: NewsArticle[] = []

  for (const draft of drafts) {
    delete draft.matchNotes
    delete draft.extracted

    // 外部URLのままの画像は自前保存に差し替える。他サイトへのホットリンクを避けるため。
    if (draft.imageUrl && !isLocalImage("articles", draft.imageUrl)) {
      draft.imageUrl = await downloadAndSaveImage("articles", draft.imageUrl)
    }

    draft.id = String(nextId++)
    toPublish.push(draft as NewsArticle)
  }

  const merged = [...news, ...toPublish]
  await writeFile(NEWS_PATH, JSON.stringify(merged, null, 2), "utf-8")
  await writeFile(DRAFTS_PATH, "[]\n", "utf-8")

  console.log(`${toPublish.length}件公開 -> data/news.json`)
}

main()
