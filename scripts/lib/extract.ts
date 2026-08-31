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
  // 一覧ページ(source.detailLinkPattern設定時)における、この項目の詳細ページURL。
  // 一覧ページURLでなくこちらをsourcesに採用する(scripts/3-dedupe-and-link.ts参照)。
  detail_url: string | null
}

// LLM抽出の生出力用。image_indexは画像候補配列(extractImageCandidates)、
// detail_url_indexは詳細リンク候補配列(extractDetailLinkCandidates)のインデックス。
interface LlmExtractedItem extends Omit<ExtractedItem, "image_url" | "detail_url"> {
  image_index: number | null
  detail_url_index: number | null
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
// "thumb"は除外しない: サムネイル=記事固有の縮小画像であるサイトが多く(例: ecute.jp)、
// 誤って正当な記事画像まで除外してしまう。実サイズでの足切りは MIN_ATTR_SIZE / save-image.ts に任せる。
const EXCLUDED_NAME_PATTERN =
  /icon|logo|common|[-_]nav|banner|sprite|avatar|placeholder|noimage|no[-_]?image|blank|spacer|pixel|button|btn/i

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

// リサイズ用クエリパラメータでオリジナルより縮小されたサムネイルを配信するCDN。
// 該当ドメインはクエリを除去し、元画像URLに正規化する(例: PR TIMESのFastly配信サムネは
// width=295&height=195等が付き、表示100x66→実質195px程度しかなくMIN_SIZE足切りに掛かる)。
const THUMBNAIL_CDN_HOSTS = ["fastly.net"]

const normalizeImageUrl = (url: URL): URL => {
  if (THUMBNAIL_CDN_HOSTS.some((host) => url.hostname.endsWith(host))) {
    url.search = ""
  }
  return url
}

// 記事本文領域内の画像候補を出現順に列挙する。
// アイコン/ロゴ等の小画像を除外するため、width/height指定が両方とも小さすぎるものは除外。
// (幅か高さの片方だけが小さいのは横長/縦長サムネイルでも起こりうるため、AND条件にして
//  PR TIMES一覧ページのような横長サムネ(width=100 height=66等)を誤って除外しない)
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
      (Number.isFinite(width) ? width : Infinity) < MIN_ATTR_SIZE &&
      (Number.isFinite(height) ? height : Infinity) < MIN_ATTR_SIZE
    ) {
      continue
    }
    const srcset = $el.attr("srcset") || $el.attr("data-srcset")
    const lazySrc = LAZY_SRC_ATTRS.map((attr) => $el.attr(attr)).find(Boolean)
    const raw = (srcset && pickLargestFromSrcset(srcset)) || lazySrc || $el.attr("src")
    if (!raw) continue
    if (/\.svg(\?|$)/i.test(raw) || EXCLUDED_NAME_PATTERN.test(raw)) continue
    try {
      const url = normalizeImageUrl(new URL(raw, pageUrl)).toString()
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

// 一覧ページ内の個別記事詳細へのリンクを出現順に列挙する(source.detailLinkPattern設定時のみ使用)。
export const extractDetailLinkCandidates = (
  html: string,
  pageUrl: string,
  pattern: string
): string[] => {
  const $ = cheerio.load(html)
  const urls: string[] = []
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")
    if (!href || !href.includes(pattern)) return
    try {
      const url = new URL(href, pageUrl).toString()
      if (!urls.includes(url)) urls.push(url)
    } catch {
      // skip malformed href
    }
  })
  return urls
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
          detail_url_index: { type: ["integer", "null"] },
        },
        required: ["category", "title", "area", "summary"],
      },
    },
  },
  required: ["items"],
}

const buildPrompt = (
  source: Source,
  text: string,
  imageCandidates: string[],
  detailLinkCandidates: string[]
): string => {
  // 画像候補がある場合、各項目にどの画像が対応するかLLMに選ばせる。
  // 候補が1件でも、1ページに複数記事が載るサイト(自治体イベント一覧等)では
  // その画像が特定の1項目にしか対応しないことがあるため、候補0件の時のみ省略する。
  const imageSection =
    imageCandidates.length > 0
      ? `\n画像候補(出現順、0始まりのインデックス):\n${imageCandidates.map((url, i) => `${i}: ${url}`).join("\n")}\n`
      : ""
  const detailLinkSection =
    detailLinkCandidates.length > 0
      ? `\n詳細ページリンク候補(出現順、0始まりのインデックス):\n${detailLinkCandidates.map((url, i) => `${i}: ${url}`).join("\n")}\n`
      : ""

  return `あなたは上野エリア地域メディアの情報整理担当。
以下のWebページ本文から、店舗の新規オープン・閉店・セール・キャンペーン・POP UP・展示会・イベント・施設ニュース・地域ニュースに該当する項目を抽出する。

ルール:
- 該当項目が複数あれば全て配列で返す。該当項目が無ければ空配列 [] を返す。
- categoryは次のいずれか: event, new_opening, closing, renewal, sale, campaign, popup, new_product, exhibition, facility_news, local_news
- 本文に明記されていない項目はnullにする。推測で埋めない。
- areaは「上野」に関連する情報のみを対象にする。無関係な地域の情報は含めない。
${imageCandidates.length > 0 ? "- 各項目のimage_indexには、その項目の内容に最も対応する画像候補のインデックスを入れる。1ページに複数項目がある場合、画像候補は特定の1項目にのみ対応することがある。対応する画像が無ければnullにする(他項目の画像を代用しない)。" : ""}
${detailLinkCandidates.length > 0 ? "- 各項目のdetail_url_indexには、その項目の詳細ページに対応するリンク候補のインデックスを入れる。対応するリンクが無ければnullにする。" : ""}
情報源: ${source.name}
URL: ${source.url}
${imageSection}${detailLinkSection}
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
  const detailLinkCandidates = source.detailLinkPattern
    ? extractDetailLinkCandidates(html, pageUrl, source.detailLinkPattern)
    : []
  const result = await runClaudeJson<{ items: LlmExtractedItem[] }>(
    buildPrompt(source, text, imageCandidates, detailLinkCandidates),
    EXTRACT_SCHEMA
  )

  // 候補0件ならimage_url/detail_urlは常にnull。候補が1件でも、1ページに複数項目がある場合は
  // その画像/リンクが特定の1項目にしか対応しないことがあるため、LLMのindex判定に従う
  // (フォールバックで候補[0]を使い回さない。使い回すと無関係項目に誤った画像/リンクが付く)。
  const items = result?.items ?? []
  return items.map((item): ExtractedItem => {
    const { image_index, detail_url_index, ...rest } = item
    const imageUrl =
      items.length <= 1 && imageCandidates.length <= 1
        ? (imageCandidates[0] ?? null)
        : (imageCandidates[image_index ?? -1] ?? null)
    const detailUrl =
      items.length <= 1 && detailLinkCandidates.length <= 1
        ? (detailLinkCandidates[0] ?? null)
        : (detailLinkCandidates[detail_url_index ?? -1] ?? null)
    return { ...rest, image_url: imageUrl, detail_url: detailUrl }
  })
}
