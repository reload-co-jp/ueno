import Anthropic from "@anthropic-ai/sdk"
import type { Category } from "@/lib/types"

// README「9. 記事生成」準拠テンプレート
const TEMPLATES: Partial<Record<Category, string>> = {
  new_opening: `【上野】○○が○月○日にオープン！

概要

店舗情報
- 店名
- 住所
- 営業時間
- オープン日
- アクセス`,
  event: `【上野】○○開催！○月○日から○○で

概要

イベント情報
- 開催期間
- 場所
- 料金
- アクセス`,
  exhibition: `【上野】○○開催！○月○日から○○で

概要

イベント情報
- 開催期間
- 場所
- 料金
- アクセス`,
}

let client: Anthropic | null = null
const getClient = () => {
  if (!client) client = new Anthropic()
  return client
}

export interface ArticleInput {
  category: Category
  title: string
  summary: string
  area: string
  store: string | null
  place: string | null
  address: string | null
  openingDate: string | null
  startDate: string | null
  endDate: string | null
  fee: string | null
  officialUrl: string | null
}

export const generateArticleBody = async (input: ArticleInput): Promise<string> => {
  const template = TEMPLATES[input.category]

  const message = await getClient().messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: `上野地域メディアの記事執筆担当。与えられた事実情報のみをもとに記事本文を書く。
事実の誇張・推測での穴埋めは禁止。不明な項目は箇条書きから省く。
${template ? `以下のテンプレート構成に従う:\n${template}` : "見出し・概要・箇条書き情報を含む簡潔な記事構成にする。"}`,
    messages: [
      {
        role: "user",
        content: `タイトル: ${input.title}
カテゴリ: ${input.category}
エリア: ${input.area}
概要: ${input.summary}
店舗名: ${input.store ?? "不明"}
施設名: ${input.place ?? "不明"}
住所: ${input.address ?? "不明"}
オープン日: ${input.openingDate ?? "不明"}
開催期間: ${input.startDate ?? "不明"} 〜 ${input.endDate ?? "不明"}
料金: ${input.fee ?? "不明"}
公式URL: ${input.officialUrl ?? "不明"}

上記事実のみを用いて記事本文を書け。`,
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === "text")
  return textBlock?.type === "text" ? textBlock.text.trim() : input.summary
}
