// README「4. 情報カテゴリ」準拠
export type Category =
  | "event"
  | "new_opening"
  | "closing"
  | "renewal"
  | "sale"
  | "campaign"
  | "popup"
  | "new_product"
  | "exhibition"
  | "facility_news"
  | "local_news"

export const CATEGORY_LABELS: Record<Category, string> = {
  event: "イベント",
  new_opening: "新規オープン",
  closing: "閉店",
  renewal: "リニューアル",
  sale: "セール",
  campaign: "キャンペーン",
  popup: "POP UP",
  new_product: "新商品",
  exhibition: "展示会",
  facility_news: "施設ニュース",
  local_news: "地域ニュース",
}

// README「5. 管理する情報 - 店舗」準拠
export interface Store {
  id: string
  name: string
  category: string
  address: string
  lat: number
  lng: number
  hours: string
  openingDate?: string
  officialUrl: string
  sns?: string[]
  source: string
  area: string
}

// README「5. 管理する情報 - 施設・スポット」準拠
export interface Spot {
  id: string
  name: string
  type: string
  address: string
  lat: number
  lng: number
  officialUrl: string
  area: string
  imageUrl?: string | null
}

// README「5. 管理する情報 - ニュース」準拠
// 同一内容が複数の情報源に掲載されている場合は1記事に統合し、sourcesに全URLを保持する
// (README「6. Entity管理」「7. 重複管理」の考え方を記事にも適用)
// イベント(category: "event")は開催日時・場所などの構造化情報をevent*フィールドに持つ
export interface NewsArticle {
  id: string
  title: string
  category: Category
  publishedAt: string
  updatedAt?: string
  summary: string
  body: string
  sources: string[]
  area: string
  relatedStoreIds: string[]
  relatedSpotIds: string[]
  imageUrl: string | null
  // 重複記事の場合、正とする記事のid。URL維持のためページは残し、canonical・一覧除外に使う
  duplicateOf?: string
  // README「5. 管理する情報 - イベント」準拠。category: "event" の記事のみ設定
  eventStartDate?: string
  eventEndDate?: string
  eventLocation?: string
  eventFee?: string
  eventOrganizer?: string
  eventOfficialUrl?: string
}

// イベント記事(開催日時を持つ記事)の型ガード。カテゴリはevent以外(展示会/POP UP等)もありうる
export const isEventArticle = (
  article: NewsArticle
): article is NewsArticle & { eventStartDate: string; eventEndDate: string } =>
  !!article.eventStartDate && !!article.eventEndDate

// 翻訳スクリプト(scripts/9-translate.ts)が生成。hashは翻訳元の日本語フィールドのハッシュ(差分翻訳用)
export const ARTICLE_TRANSLATABLE_FIELDS = [
  "title",
  "summary",
  "body",
  "area",
  "eventLocation",
  "eventFee",
  "eventOrganizer",
] as const
export const SPOT_TRANSLATABLE_FIELDS = [
  "name",
  "type",
  "area",
  "address",
] as const
export const STORE_TRANSLATABLE_FIELDS = [
  "name",
  "category",
  "area",
  "address",
  "hours",
] as const

interface Entry<F extends string> {
  hash: string
  fields: Partial<Record<F, string>>
}

export interface Translations {
  news: Record<string, Entry<(typeof ARTICLE_TRANSLATABLE_FIELDS)[number]>>
  spots: Record<string, Entry<(typeof SPOT_TRANSLATABLE_FIELDS)[number]>>
  stores: Record<string, Entry<(typeof STORE_TRANSLATABLE_FIELDS)[number]>>
}
