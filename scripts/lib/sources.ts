// README「2. 情報源」「情報源の優先順位」準拠
export type SourceType =
  | "government" // 1. 行政・公的機関
  | "official_site" // 2. 店舗・施設の公式サイト
  | "press_release" // 3. PR TIMES等企業公式プレスリリース
  | "platform" // 4. イベントプラットフォーム
  | "database" // 5. 食べログ・Google Maps等の店舗データベース
  | "sns" // 6. SNS
  | "media" // 7. その他Webメディア

export const SOURCE_PRIORITY: Record<SourceType, number> = {
  government: 1,
  official_site: 2,
  press_release: 3,
  platform: 4,
  database: 5,
  sns: 6,
  media: 7,
}

export interface Source {
  id: string
  name: string
  url: string
  type: SourceType
  // このソースから抽出されうる情報カテゴリ(ヒント。キーワード一致が無い場合の既定カテゴリに使う)
  categoryHints: string[]
  // true: 本文ブロックに「上野」を含むものだけ採用する(全国横断のキーワード検索結果ページ向け。
  //       ノイズ記事の混入を防ぐ)
  // false: URL自体が上野エリア専用なので無条件で採用する(店舗・施設の公式サイト等)
  strictAreaFilter: boolean
}

export const SOURCES: Source[] = [
  {
    id: "tokyo-ueno-park-event",
    name: "東京都建設局・上野恩賜公園「イベント案内」",
    url: "https://www.kensetsu.metro.tokyo.lg.jp/jimusho/toubuk/ueno/event",
    type: "government",
    categoryHints: ["event", "facility_news"],
    strictAreaFilter: false,
  },
  {
    id: "taito-city-event",
    name: "台東区公式サイト「イベント」",
    url: "https://www.city.taito.lg.jp/bunka_kanko/sekaiisan/10kinen/gyoji.html",
    type: "government",
    categoryHints: ["event", "local_news"],
    strictAreaFilter: true,
  },
  {
    id: "taito-navi-event",
    name: "台東区公式観光情報サイト「TAITOおでかけナビ」",
    url: "https://t-navi.city.taito.lg.jp/event?keyword=%E4%B8%8A%E9%87%8E",
    type: "government",
    categoryHints: ["event"],
    strictAreaFilter: true,
  },
  {
    id: "prtimes-ueno",
    name: "PR TIMES「上野」",
    url: "https://prtimes.jp/main/action.php?run=html&page=searchkey&search_word=%E4%B8%8A%E9%87%8E",
    type: "press_release",
    categoryHints: ["new_opening", "event", "popup", "sale", "campaign", "new_product"],
    strictAreaFilter: true,
  },
  {
    id: "prtimes-ueno-marui",
    name: "PR TIMES「上野マルイ」",
    url: "https://prtimes.jp/topics/keywords/%E4%B8%8A%E9%87%8E%E3%83%9E%E3%83%AB%E3%82%A4",
    type: "press_release",
    categoryHints: ["new_opening", "event", "popup", "sale", "campaign"],
    strictAreaFilter: true,
  },
  {
    id: "tabelog-ueno-new",
    name: "食べログ「上野の新規オープン」",
    url: "https://tabelog.com/tokyo/C13106/C36324/rstLst/cond16-00-00/",
    type: "database",
    categoryHints: ["new_opening"],
    strictAreaFilter: false,
  },
  {
    id: "tobikan",
    name: "東京都美術館",
    url: "https://www.tobikan.jp/exhibition/",
    type: "official_site",
    categoryHints: ["exhibition"],
    strictAreaFilter: false,
  },
  {
    id: "tnm",
    name: "東京国立博物館",
    url: "https://www.tnm.jp/modules/r_free_page/index.php?id=1255",
    type: "official_site",
    categoryHints: ["exhibition"],
    strictAreaFilter: false,
  },
  {
    id: "kahaku",
    name: "国立科学博物館",
    url: "https://www.kahaku.go.jp/tenji/exhibitions.html",
    type: "official_site",
    categoryHints: ["exhibition"],
    strictAreaFilter: false,
  },
  {
    id: "ueno-zoo",
    name: "上野動物園",
    url: "https://www.tokyo-zoo.net/ueno/events/index.html",
    type: "official_site",
    categoryHints: ["event", "facility_news"],
    strictAreaFilter: false,
  },
  {
    id: "ueno-marui",
    name: "上野マルイ",
    url: "https://www.0101.co.jp/058/event/?from=01_pc_st058_top_gnav-event",
    type: "official_site",
    categoryHints: ["event", "popup", "sale", "campaign", "new_opening"],
    strictAreaFilter: false,
  },
  {
    id: "ecute-ueno-campaign",
    name: "エキュート上野 キャンペーン",
    url: "https://www.ecute.jp/ueno/campaign",
    type: "official_site",
    categoryHints: ["campaign", "sale"],
    strictAreaFilter: false,
  },
  {
    id: "ecute-ueno-limitedshop",
    name: "エキュート上野 期間限定ショップ",
    url: "https://www.ecute.jp/ueno/limitedshop",
    type: "official_site",
    categoryHints: ["popup", "new_opening"],
    strictAreaFilter: false,
  },
  {
    id: "matsuzakaya-ueno",
    name: "松坂屋上野店",
    url: "https://www.matsuzakaya.co.jp/ueno/event/",
    type: "official_site",
    categoryHints: ["event", "sale", "campaign", "popup"],
    strictAreaFilter: false,
  },
]

export const getSource = (id: string) => SOURCES.find((s) => s.id === id)
