// 公開済み記事(data/news.json)のうち本文が短いものを、sourcesのページ本文を根拠に加筆する。
// 実行: pnpm enrich-articles [最小文字数=300] [開始ID(中断再開用)]
// 1件ごとに保存するため中断・再実行可。新事実が得られない記事はそのまま残す。
// 実行後 pnpm translate で翻訳を更新し、差分を人手で確認すること。
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fetchHtml, resolveGoogleNewsUrl, sleep } from "./lib/fetch-raw"
import { htmlToText } from "./lib/extract"
import { runClaudeText } from "./lib/claude-cli"

const NEWS_PATH = path.join(process.cwd(), "data", "news.json")
const MIN_LENGTH = Number(process.argv[2] ?? 300)
const START_ID = process.argv[3]
const FETCH_INTERVAL_MS = 2000
const NO_UPDATE = "NO_UPDATE"

interface Article {
  id: string
  title: string
  category: string
  summary: string
  body: string
  sources: string[]
}

const fetchSourceText = async (url: string) => {
  const resolved = url.includes("news.google.com") ? await resolveGoogleNewsUrl(url) : url
  if (!resolved) return ""
  const html = await fetchHtml(resolved)
  await sleep(FETCH_INTERVAL_MS)
  return html ? htmlToText(html) : ""
}

const enrichBody = async (article: Article, sourceTexts: string[]) => {
  const prompt = `上野地域メディアの記事執筆担当として、既存記事の本文を加筆する。
参考資料(情報源ページの本文)から、この記事の対象に該当する事実だけを使う。一覧ページの場合、無関係な項目は無視する。
事実の誇張・推測での穴埋めは禁止。参考資料に記事対象の新しい事実が無ければ「${NO_UPDATE}」とだけ出力する。
既存本文の構成(見出し・概要・箇条書き情報)と文体を保ち、日時・場所・料金・内容・アクセス等の具体情報を補う。
本文以外の前置き・説明は出力しない。

タイトル: ${article.title}
カテゴリ: ${article.category}
概要: ${article.summary}

既存本文:
${article.body}

参考資料:
${sourceTexts.map((t, i) => `--- 資料${i + 1} ---\n${t}`).join("\n")}`

  const result = (await runClaudeText(prompt))?.trim()
  // CLI失敗(利用上限等)を「新情報なし」と区別し、以降の記事を誤スキップしないよう中断する
  if (result == null) {
    console.error(`中断。再開: pnpm enrich-articles ${MIN_LENGTH} ${article.id}`)
    process.exit(1)
  }
  return result && !result.includes(NO_UPDATE) && result.length > article.body.length ? result : null
}

const main = async () => {
  const articles: Article[] = JSON.parse(await readFile(NEWS_PATH, "utf-8"))
  const start = START_ID ? articles.findIndex((a) => a.id === START_ID) : 0
  const targets = articles.slice(Math.max(start, 0)).filter((a) => a.body.length < MIN_LENGTH)
  console.log(`対象: ${targets.length}件 (本文${MIN_LENGTH}字未満)`)

  for (const [i, article] of targets.entries()) {
    process.stdout.write(`[${i + 1}/${targets.length}] ${article.id} ${article.title} ... `)
    const texts = (await Promise.all(article.sources.map(fetchSourceText))).filter(Boolean)
    const body = texts.length ? await enrichBody(article, texts) : null
    if (!body) {
      console.log(texts.length ? "新情報なし" : "取得失敗")
      continue
    }
    console.log(`${article.body.length} → ${body.length}字`)
    article.body = body
    await writeFile(NEWS_PATH, JSON.stringify(articles, null, 2), "utf-8")
  }
}

main()
