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

// LLM抽出の生出力用。image_indexは画像候補配列(ExtractImageCandidates)のインデックス。
interface LlmExtractedItem extends Omit<ExtractedItem, "image_url"> {
  image_index: number | null
}

const MAX_CHARS = 12000

// HTML本文からノイズ(script/style/nav等)を除いたテキストを抽出
export const htmlToText = (html: string): string => {
  const $ = cheerio.load(html)
  $("script, style, noscript, nav, footer, header").remove()
  const text = $("body").text().replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim()
  return text.slice(0, MAX_CHARS)
}

// HTML属性ベースの粗い足切り閾値。誤除外を避けるため緩めに取る。
// 実サイズでの確定判定は save-image.ts の MIN_SIZE(こちらより厳しい)で行う。
const MIN_ATTR_SIZE = 100

// アイコン/ロゴ/バナー等、記事画像として不適切とみなすファイル名パターン。
const EXCLUDED_NAME_PATTERN =
  /icon|logo|common|[-_]nav|banner|sprite|avatar|thumb|placeholder|noimage|no[-_]?image|blank|spacer|pixel|button|btn/i

// lazy-load実装でsrcの代わりに使われがちな属性(ライブラリにより異なる)
const LAZY_SRC_ATTRS = ["data-src", "data-original", "data-lazy-src", "data-lazy", "data-echo"]

// srcset(候補の並び)から最大幅の画像URLを選ぶ。パース不能ならnull。
const pickLargestFromSrcset = (srcset: string): string | null => {
  const candidates = srcset
    .split(",")
    .map((entry) => entry.trim().split(/\s+/))
    .filter((parts) => parts[0])
    .map(([url, descriptor]) => ({
      url,
      width: descriptor && descriptor.endsWith("w") ? Number.parseInt(descriptor, 10) : 0,
    }))
  if (candidates.length === 0) return null
  return candidates.reduce((a, b) => (b.width > a.width ? b : a)).url
}

// 記事本文領域内の画像候補を出現順に列挙する。
// アイコン/ロゴ等の小画像を除外するため、width/height指定があり小さすぎるものは除外。
const extractBodyImageCandidates = ($: cheerio.CheerioAPI, pageUrl: string): string[] => {
  const els = $(
    "article img, main img, .entry-content img, .post-content img, .content img"
  ).toArray()

  const urls: string[] = []
  for (const el of els) {
    const $el = $(el)
    const width = Number.parseInt($el.attr("width") ?? "", 10)
    const height = Number.parseInt($el.attr("height") ?? "", 10)
    if (
      (Number.isFinite(width) && width < MIN_ATTR_SIZE) ||
      (Number.isFinite(height) && height < MIN_ATTR_SIZE)
    ) {
      continue
    }
    const srcset = $el.attr("srcset") || $el.attr("data-srcset")
    const lazySrc = LAZY_SRC_ATTRS.map((attr) => $el.attr(attr)).find(Boolean)
    const raw = (srcset && pickLargestFromSrcset(srcset)) || lazySrc || $el.attr("src")
    if (!raw) continue
    if (/\.svg(\?|$)/i.test(raw) || EXCLUDED_NAME_PATTERN.test(raw)) continue
    try {
      const url = new URL(raw, pageUrl).toString()
      if (!urls.includes(url)) urls.push(url)
    } catch {
      continue
    }
  }
  return urls
}

// ページの画像候補一覧を取得する。まず記事本文内の画像を出現順に列挙し、
// 1件も無ければOGP画像(og:image、無ければtwitter:image)にフォールバックする。
// LLMにURLを生成させると幻覚のおそれがあるため、HTMLから直接読む。
export const extractImageCandidates = (html: string, pageUrl: string): string[] => {
  const $ = cheerio.load(html)

  const bodyImages = extractBodyImageCandidates($, pageUrl)
  if (bodyImages.length > 0) return bodyImages

  const raw =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    null
  if (!raw) return []
  try {
    return [new URL(raw, pageUrl).toString()]
  } catch {
    return []
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
          image_index: { type: ["integer", "null"] },
        },
        required: ["category", "title", "area", "summary"],
      },
    },
  },
  required: ["items"],
}

const buildPrompt = (source: Source, text: string, imageCandidates: string[]): string => {
  // 画像候補が複数ある(1ページに複数記事が載っている等)場合のみ、
  // 各項目にどの画像が対応するかLLMに選ばせる。候補が0〜1件ならimage_indexは無視される。
  const imageSection =
    imageCandidates.length > 1
      ? `\n画像候補(出現順、0始まりのインデックス):\n${imageCandidates.map((url, i) => `${i}: ${url}`).join("\n")}\n`
      : ""

  return `あなたは上野エリア地域メディアの情報整理担当。
以下のWebページ本文から、店舗の新規オープン・閉店・セール・キャンペーン・POP UP・展示会・イベント・施設ニュース・地域ニュースに該当する項目を抽出する。

ルール:
- 該当項目が複数あれば全て配列で返す。該当項目が無ければ空配列 [] を返す。
- categoryは次のいずれか: event, new_opening, closing, renewal, sale, campaign, popup, new_product, exhibition, facility_news, local_news
- 本文に明記されていない項目はnullにする。推測で埋めない。
- areaは「上野」に関連する情報のみを対象にする。無関係な地域の情報は含めない。
${imageCandidates.length > 1 ? "- 各項目のimage_indexには、その項目の内容に最も対応する画像候補のインデックスを入れる。対応する画像が無ければnullにする。" : ""}
情報源: ${source.name}
URL: ${source.url}
${imageSection}
本文:
${text}`
}

export const extractFromHtml = async (
  source: Source,
  html: string,
  pageUrl: string
): Promise<ExtractedItem[]> => {
  const text = htmlToText(html)
  if (!text) return []

  const imageCandidates = extractImageCandidates(html, pageUrl)
  const result = await runClaudeJson<{ items: LlmExtractedItem[] }>(
    buildPrompt(source, text, imageCandidates),
    EXTRACT_SCHEMA
  )

  return (result?.items ?? []).map((item): ExtractedItem => {
    const { image_index, ...rest } = item
    const imageUrl =
      imageCandidates.length <= 1
        ? (imageCandidates[0] ?? null)
        : (imageCandidates[image_index ?? -1] ?? imageCandidates[0] ?? null)
    return { ...rest, image_url: imageUrl }
  })
}
