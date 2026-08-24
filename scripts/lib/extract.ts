import * as cheerio from "cheerio"
import type { Category } from "@/lib/types"
import type { Source } from "./sources"
import { runClaudeJson } from "./claude-cli"

// README「8. LLMによる情報抽出」準拠
export interface ExtractedItem {
  category: Category
  title: string
  area: string
  store: string | null
  place: string | null
  event_name: string | null
  address: string | null
  opening_date: string | null
  start_date: string | null
  end_date: string | null
  fee: string | null
  organizer: string | null
  official_url: string | null
  summary: string
  image_url: string | null
}

const MAX_CHARS = 12000

// HTML本文からノイズ(script/style/nav等)を除いたテキストを抽出
export const htmlToText = (html: string): string => {
  const $ = cheerio.load(html)
  $("script, style, noscript, nav, footer, header").remove()
  const text = $("body").text().replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim()
  return text.slice(0, MAX_CHARS)
}

// 記事本文領域内の最初の画像をメイン画像として取得。
// アイコン/ロゴ等の小画像を除外するため、width/height指定があり小さすぎるものは除外。
const extractMainImageUrl = ($: cheerio.CheerioAPI, pageUrl: string): string | null => {
  const MIN_SIZE = 100
  const candidates = $(
    "article img, main img, .entry-content img, .post-content img, .content img"
  ).toArray()

  for (const el of candidates) {
    const $el = $(el)
    const width = Number.parseInt($el.attr("width") ?? "", 10)
    const height = Number.parseInt($el.attr("height") ?? "", 10)
    if ((Number.isFinite(width) && width < MIN_SIZE) || (Number.isFinite(height) && height < MIN_SIZE)) {
      continue
    }
    const raw = $el.attr("src") || $el.attr("data-src")
    if (!raw) continue
    if (/\.svg(\?|$)/i.test(raw) || /icon|logo|[-_]nav/i.test(raw)) continue
    try {
      return new URL(raw, pageUrl).toString()
    } catch {
      continue
    }
  }
  return null
}

// ページの画像URL取得。まず記事本文内のメイン画像を探し、
// 見つからなければOGP画像(og:image、無ければtwitter:image)にフォールバックする。
// LLMにURLを生成させると幻覚のおそれがあるため、HTMLから直接読む。
export const extractImageUrl = (html: string, pageUrl: string): string | null => {
  const $ = cheerio.load(html)

  const mainImage = extractMainImageUrl($, pageUrl)
  if (mainImage) return mainImage

  const raw =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    null
  if (!raw) return null
  try {
    return new URL(raw, pageUrl).toString()
  } catch {
    return null
  }
}

const CATEGORY_VALUES: Category[] = [
  "event",
  "new_opening",
  "closing",
  "renewal",
  "sale",
  "campaign",
  "popup",
  "new_product",
  "exhibition",
  "facility_news",
  "local_news",
]

const EXTRACT_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: CATEGORY_VALUES },
          title: { type: "string" },
          area: { type: "string" },
          store: { type: ["string", "null"] },
          place: { type: ["string", "null"] },
          event_name: { type: ["string", "null"] },
          address: { type: ["string", "null"] },
          opening_date: { type: ["string", "null"] },
          start_date: { type: ["string", "null"] },
          end_date: { type: ["string", "null"] },
          fee: { type: ["string", "null"] },
          organizer: { type: ["string", "null"] },
          official_url: { type: ["string", "null"] },
          summary: { type: "string" },
        },
        required: ["category", "title", "area", "summary"],
      },
    },
  },
  required: ["items"],
}

const buildPrompt = (source: Source, text: string): string => `あなたは上野エリア地域メディアの情報整理担当。
以下のWebページ本文から、店舗の新規オープン・閉店・セール・キャンペーン・POP UP・展示会・イベント・施設ニュース・地域ニュースに該当する項目を抽出する。

ルール:
- 該当項目が複数あれば全て配列で返す。該当項目が無ければ空配列 [] を返す。
- categoryは次のいずれか: event, new_opening, closing, renewal, sale, campaign, popup, new_product, exhibition, facility_news, local_news
- 本文に明記されていない項目はnullにする。推測で埋めない。
- areaは「上野」に関連する情報のみを対象にする。無関係な地域の情報は含めない。

情報源: ${source.name}
URL: ${source.url}

本文:
${text}`

export const extractFromHtml = async (
  source: Source,
  html: string,
  pageUrl: string
): Promise<ExtractedItem[]> => {
  const text = htmlToText(html)
  if (!text) return []

  const result = await runClaudeJson<{ items: ExtractedItem[] }>(
    buildPrompt(source, text),
    EXTRACT_SCHEMA
  )
  const imageUrl = extractImageUrl(html, pageUrl)
  return (result?.items ?? []).map((item) => ({ ...item, image_url: imageUrl }))
}
