// 英語・簡体字版ページ用に、公開済み記事・施設・店舗の表示テキストを翻訳して data/i18n/{en,zh-cn}.json に保存する。
// 翻訳元(日本語フィールド)のハッシュを保持し、未翻訳・内容変更のあったものだけを翻訳する(差分翻訳)。
// 実行: pnpm translate [--limit=<件数>] [--locale=en|zh-cn]
import { createHash } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { news, spots, stores } from "@/lib/data"
import {
  ARTICLE_TRANSLATABLE_FIELDS,
  SPOT_TRANSLATABLE_FIELDS,
  STORE_TRANSLATABLE_FIELDS,
  type Translations,
} from "@/lib/types"
import { runClaudeJson } from "./lib/claude-cli"

const LOCALES = {
  en: "English",
  "zh-cn": "Simplified Chinese (简体中文)",
} as const
type TranslatedLocale = keyof typeof LOCALES

// claude CLIの同時実行数(サブスクリプションのレート制限に配慮)
const CONCURRENCY = 4
// 途中停止しても翻訳済み分を失わないよう、この件数ごとに保存する
const SAVE_EVERY = 10

const filePath = (locale: TranslatedLocale) => path.join(process.cwd(), "data", "i18n", `${locale}.json`)

const hashOf = (fields: Record<string, string>) =>
  createHash("sha1").update(JSON.stringify(fields)).digest("hex").slice(0, 16)

// 値のあるフィールドのみ(空のフィールドは翻訳不要)
const pickFields = <F extends string>(item: object, keys: readonly F[]) =>
  Object.fromEntries(
    keys.flatMap((k) => {
      const v = (item as Record<string, unknown>)[k]
      return typeof v === "string" && v.trim() ? [[k, v]] : []
    })
  ) as Partial<Record<F, string>>

const buildPrompt = (locale: TranslatedLocale, fields: Record<string, string>) => `
You translate content for a local news site about Ueno, Tokyo, from Japanese into ${LOCALES[locale]}.
Translate every value of the JSON object below and return an object with exactly the same keys.

Rules:
- Use official ${locale === "en" ? "English" : "Chinese"} names for facilities, museums, stations and companies when they exist (e.g. 東京国立博物館 → ${locale === "en" ? "Tokyo National Museum" : "东京国立博物馆"}). Otherwise romanize (English) or use the standard Chinese reading.
- Keep Markdown structure (headings, lists, tables, links) and all URLs, numbers, dates, times and prices exactly as in the source.
- Addresses: ${locale === "en" ? 'use Western order, e.g. "5-20 Uenokoen, Taito-ku, Tokyo"' : "use Chinese characters in Japanese order, e.g. 东京都台东区上野公园5-20"}.
- Write natural, concise ${LOCALES[locale]} for readers visiting Tokyo. Do not add or omit information.

${JSON.stringify(fields, null, 2)}
`

const translateFields = async <F extends string>(
  locale: TranslatedLocale,
  fields: Partial<Record<F, string>>
): Promise<Partial<Record<F, string>> | null> => {
  const keys = Object.keys(fields)
  const schema = {
    type: "object",
    properties: Object.fromEntries(keys.map((k) => [k, { type: "string" }])),
    required: keys,
    additionalProperties: false,
  }
  return runClaudeJson<Partial<Record<F, string>>>(buildPrompt(locale, fields as Record<string, string>), schema)
}

interface Job {
  kind: keyof Translations
  id: string
  label: string
  fields: Record<string, string>
  hash: string
}

const collectJobs = (translations: Translations): Job[] => {
  const sources: { kind: keyof Translations; items: { id: string }[]; keys: readonly string[] }[] = [
    { kind: "spots", items: spots, keys: SPOT_TRANSLATABLE_FIELDS },
    { kind: "stores", items: stores, keys: STORE_TRANSLATABLE_FIELDS },
    { kind: "news", items: news, keys: ARTICLE_TRANSLATABLE_FIELDS },
  ]
  return sources.flatMap(({ kind, items, keys }) =>
    items.flatMap((item) => {
      const fields = pickFields(item, keys) as Record<string, string>
      const hash = hashOf(fields)
      if (translations[kind][item.id]?.hash === hash) return []
      return [{ kind, id: item.id, label: fields.title ?? fields.name ?? item.id, fields, hash }]
    })
  )
}

const translateLocale = async (locale: TranslatedLocale, limit: number) => {
  const translations: Translations = JSON.parse(await readFile(filePath(locale), "utf-8"))
  const jobs = collectJobs(translations).slice(0, limit)
  console.log(`[${locale}] 翻訳対象 ${jobs.length}件`)

  const save = () => writeFile(filePath(locale), `${JSON.stringify(translations, null, 2)}\n`)
  let done = 0
  let failed = 0
  let next = 0
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++]
      const result = await translateFields(locale, job.fields)
      done++
      if (result) {
        translations[job.kind][job.id] = { hash: job.hash, fields: result }
      } else {
        failed++
      }
      console.log(`[${locale}] ${done}/${jobs.length} ${result ? "OK" : "失敗"} ${job.kind}:${job.id} ${job.label}`)
      if (done % SAVE_EVERY === 0) await save()
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  // 削除済みの記事・施設・店舗の翻訳は残さない
  const liveIds = { news: new Set(news.map((n) => n.id)), spots: new Set(spots.map((s) => s.id)), stores: new Set(stores.map((s) => s.id)) }
  for (const kind of Object.keys(liveIds) as (keyof Translations)[]) {
    for (const id of Object.keys(translations[kind])) {
      if (!liveIds[kind].has(id)) delete translations[kind][id]
    }
  }
  await save()
  console.log(`[${locale}] 完了: 成功 ${done - failed}件 / 失敗 ${failed}件`)
}

const main = async () => {
  const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1]
  const limit = Number(arg("limit") ?? Infinity)
  const localeArg = arg("locale")
  const locales = (Object.keys(LOCALES) as TranslatedLocale[]).filter((l) => !localeArg || l === localeArg)
  for (const locale of locales) await translateLocale(locale, limit)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
