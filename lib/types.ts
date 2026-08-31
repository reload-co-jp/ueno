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

// README「5. 管理する情報 - イベント」準拠
export interface EventItem {
  id: string
  name: string
  startDate: string
  endDate: string
  location: string
  summary: string
  fee: string
  organizer: string
  officialUrl: string
  source: string
  area: string
  imageUrl: string | null
  relatedStoreId?: string
  relatedSpotId?: string
}

// README「5. 管理する情報 - ニュース」準拠
// 同一内容が複数の情報源に掲載されている場合は1記事に統合し、sourcesに全URLを保持する
// (README「6. Entity管理」「7. 重複管理」の考え方を記事にも適用)
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
  relatedEventIds: string[]
  imageUrl: string | null
}
