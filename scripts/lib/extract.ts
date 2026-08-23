import Anthropic from "@anthropic-ai/sdk"
import * as cheerio from "cheerio"
import type { Category } from "@/lib/types"

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
}

const MAX_CHARS = 12000

// HTML本文からノイズ(script/style/nav等)を除いたテキストを抽出
export const htmlToText = (html: string): string => {
  const $ = cheerio.load(html)
  $("script, style, noscript, nav, footer, header").remove()
  const text = $("body").text().replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim()
  return text.slice(0, MAX_CHARS)
}

const SYSTEM_PROMPT = `あなたは上野エリア地域メディアの情報整理担当。
Webページ本文から、店舗の新規オープン・閉店・セール・キャンペーン・POP UP・展示会・イベント・施設ニュース・地域ニュースに該当する項目を抽出する。

ルール:
- 該当項目が複数あれば全て配列で返す。該当項目が無ければ空配列 [] を返す。
- categoryは次のいずれか: event, new_opening, closing, renewal, sale, campaign, popup, new_product, exhibition, facility_news, local_news
- 本文に明記されていない項目はnullにする。推測で埋めない。
- areaは「上野」に関連する情報のみを対象にする。無関係な地域の情報は含めない。
- JSON配列以外の文字列は一切出力しない。`

let client: Anthropic | null = null
const getClient = () => {
  if (!client) client = new Anthropic()
  return client
}

export const extractFromHtml = async (
  sourceName: string,
  url: string,
  html: string
): Promise<ExtractedItem[]> => {
  const text = htmlToText(html)
  if (!text) return []

  const message = await getClient().messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `情報源: ${sourceName}\nURL: ${url}\n\n本文:\n${text}`,
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === "text")
  if (!textBlock || textBlock.type !== "text") return []

  try {
    const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : textBlock.text)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error(`抽出結果のJSONパース失敗 (${sourceName}):`, err)
    return []
  }
}
