// README「3. 情報収集フロー」 分類 → 重複チェック → Entityと紐付け
// 実行: pnpm dedupe
// data/extracted配下の抽出結果を既存Entity(stores/spots)と突き合わせ、
// 新規Entity候補・記事ドラフトを data/drafts/ に出力する。人手確認は後段(README「確認」)で行う。
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { existsSync } from "node:fs"
import { news, spots, stores } from "@/lib/data"
import type { Category } from "@/lib/types"
import { isSameArticle, llmJudgeDuplicate, matchEntity, normalizeName } from "./lib/dedupe"
import type { ExtractedItem } from "./lib/extract"

const EXTRACTED_DIR = path.join(process.cwd(), "data", "extracted")
const DRAFTS_DIR = path.join(process.cwd(), "data", "drafts")

interface ExtractedFile {
  sourceId: string
  sourceName: string
  url: string
  fetchedAt: string
  items: ExtractedItem[]
}

interface ArticleDraft {
  id: string
  title: string
  category: Category
  publishedAt: string
  summary: string
  body: string
  // 同一内容が複数の情報源に載っている場合、1記事にマージして全URLを保持する
  sources: string[]
  area: string
  relatedStoreIds: string[]
  relatedSpotIds: string[]
  relatedEventIds: string[]
  imageUrl: string | null
  // ドラフト用メタ情報。公開前の確認材料。
  matchNotes: string[]
  // 記事本文生成(pnpm generate-articles)で使う元の抽出データ(マージ元のうち最初の1件)
  extracted: ExtractedItem
}

interface NewEntityCandidate {
  name: string
  kind: "store" | "spot"
  source: string
  reason: string
}

const slug = (text: string) =>
  text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const resolveEntity = async (
  itemName: string,
  itemUrl: string | null,
  itemAddress: string | null,
  pool: typeof stores | typeof spots,
  kind: "store" | "spot",
  context: string
): Promise<{ id: string | null; note: string; isNew: boolean }> => {
  const matches = matchEntity(itemName, itemUrl, itemAddress, pool)
  if (matches.length === 0) return { id: null, note: "", isNew: true }

  const top = matches[0]
  if (top.level === "exact" || top.level === "likely") {
    return { id: top.entity.id, note: `既存${kind}に一致(${top.reason})`, isNew: false }
  }
  if (top.level === "ambiguous") {
    const isDup = await llmJudgeDuplicate(itemName, context, top.entity.name, top.entity.name)
    if (isDup) return { id: top.entity.id, note: `LLM判定で既存${kind}と同一と判定`, isNew: false }
  }
  return { id: null, note: "", isNew: true }
}

const main = async () => {
  if (!existsSync(EXTRACTED_DIR)) {
    console.error("抽出データが無い。先に pnpm extract を実行。")
    process.exit(1)
  }
  await mkdir(DRAFTS_DIR, { recursive: true })

  const articleDrafts: ArticleDraft[] = []
  const newEntityCandidates: NewEntityCandidate[] = []
  const seenDraftIds = new Set<string>()
  let skippedExisting = 0

  const sourceIds = (await readdir(EXTRACTED_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
  for (const sourceId of sourceIds) {
    const dir = path.join(EXTRACTED_DIR, sourceId)
    const files = (await readdir(dir)).filter((f) => f.endsWith(".json"))

    for (const file of files) {
      const data: ExtractedFile = JSON.parse(await readFile(path.join(dir, file), "utf-8"))

      for (const [idx, item] of data.items.entries()) {
        // 同一ソースを日をまたいで複数回収集すると同じ項目が再度抽出されうる(会期中の展覧会等)。
        // LLM抽出は非決定的でタイトル文字列が完全一致しない場合もあるため、
        // 正規化した「ソース+タイトル」で重複判定する(idxはユニークid生成にのみ使う)。
        // ここでのidはdedupe段階限定の一時id。公開記事idは連番で、公開時(5-publish-drafts.ts)に振り直す。
        const draftId = `draft-${sourceId}-${slug(item.title).slice(0, 40)}-${idx}`
        const dedupeKey = `${sourceId}:${normalizeName(item.title)}`
        if (seenDraftIds.has(dedupeKey)) continue
        seenDraftIds.add(dedupeKey)

        // 公開済み記事(news.json)と同一内容なら本文生成(pnpm generate-articles)前に除外し、
        // LLM呼び出し=トークン消費を避ける
        if (news.some((n) => isSameArticle(n.title, item.title))) {
          skippedExisting++
          continue
        }

        const matchNotes: string[] = []
        const relatedStoreIds: string[] = []
        const relatedSpotIds: string[] = []

        if (item.store) {
          const result = await resolveEntity(
            item.store,
            item.official_url,
            item.address,
            stores,
            "store",
            item.summary
          )
          if (result.id) relatedStoreIds.push(result.id)
          if (result.note) matchNotes.push(result.note)
          if (result.isNew) {
            newEntityCandidates.push({
              name: item.store,
              kind: "store",
              source: data.url,
              reason: matchNotes.at(-1) ?? "既存Entityに該当なし(新規候補)",
            })
          }
        }

        if (item.place) {
          const result = await resolveEntity(
            item.place,
            item.official_url,
            item.address,
            spots,
            "spot",
            item.summary
          )
          if (result.id) relatedSpotIds.push(result.id)
          if (result.note) matchNotes.push(result.note)
        }

        // 別ソースが同一内容を報じているケースは、新規記事にせず既存ドラフトへ統合する
        // (README「6. Entity管理」「7. 重複管理」の考え方を記事にも適用)
        const mergeTarget = articleDrafts.find(
          (d) => d.category === item.category && !d.sources.includes(data.url) && isSameArticle(d.title, item.title)
        )
        if (mergeTarget) {
          if (!mergeTarget.sources.includes(data.url)) mergeTarget.sources.push(data.url)
          for (const id of relatedStoreIds) {
            if (!mergeTarget.relatedStoreIds.includes(id)) mergeTarget.relatedStoreIds.push(id)
          }
          for (const id of relatedSpotIds) {
            if (!mergeTarget.relatedSpotIds.includes(id)) mergeTarget.relatedSpotIds.push(id)
          }
          // より情報量の多い方をsummaryとして採用する
          if (item.summary.length > mergeTarget.summary.length) {
            mergeTarget.summary = item.summary
            mergeTarget.body = item.summary
          }
          if (!mergeTarget.imageUrl && item.image_url) {
            mergeTarget.imageUrl = item.image_url
          }
          mergeTarget.matchNotes.push(...matchNotes, `複数ソースに統合: ${data.url}`)
          continue
        }

        const draft: ArticleDraft = {
          id: draftId,
          title: item.title,
          category: item.category,
          publishedAt: data.fetchedAt,
          summary: item.summary,
          body: item.summary,
          sources: [data.url],
          area: item.area || "上野",
          relatedStoreIds,
          relatedSpotIds,
          relatedEventIds: [],
          imageUrl: item.image_url,
          matchNotes,
          extracted: item,
        }
        articleDrafts.push(draft)
      }
    }
  }

  await writeFile(
    path.join(DRAFTS_DIR, "articles.json"),
    JSON.stringify(articleDrafts, null, 2),
    "utf-8"
  )
  await writeFile(
    path.join(DRAFTS_DIR, "new-entities.json"),
    JSON.stringify(newEntityCandidates, null, 2),
    "utf-8"
  )

  console.log(`公開済み記事と重複のため除外 ${skippedExisting}件`)
  console.log(`記事ドラフト ${articleDrafts.length}件 -> data/drafts/articles.json`)
  console.log(`新規Entity候補 ${newEntityCandidates.length}件 -> data/drafts/new-entities.json`)
  console.log("人手確認後、記事生成(pnpm generate-articles)または手動でnews.json/stores.jsonへ反映する。")
}

main()
