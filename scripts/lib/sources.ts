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
  // 一覧ページ用: 個別記事詳細へのリンクを検出する部分文字列パターン。
  // 設定すると、このパターンを含むhrefを詳細ページURL候補として収集し、
  // sourcesには一覧ページURLでなく該当項目の詳細ページURLを採用する(extract.ts参照)。
  detailLinkPattern?: string
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
    detailLinkPattern: "/main/html/rd/p/",
  },
  {
    id: "prtimes-ueno-marui",
    name: "PR TIMES「上野マルイ」",
    url: "https://prtimes.jp/topics/keywords/%E4%B8%8A%E9%87%8E%E3%83%9E%E3%83%AB%E3%82%A4",
    type: "press_release",
    categoryHints: ["new_opening", "event", "popup", "sale", "campaign"],
    strictAreaFilter: true,
    detailLinkPattern: "/main/html/rd/p/",
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
    id: "ueno-mori",
    name: "上野の森美術館",
    url: "https://www.ueno-mori.org/exhibitions/",
    type: "official_site",
    categoryHints: ["exhibition"],
    strictAreaFilter: false,
  },
  {
    id: "geidai",
    name: "東京藝術大学大学美術館",
    url: "https://museum.geidai.ac.jp/exhibit/",
    type: "official_site",
    categoryHints: ["exhibition"],
    strictAreaFilter: false,
  },
  {
    id: "nmwa-current",
    name: "国立西洋美術館 開催中の展覧会",
    url: "https://www.nmwa.go.jp/jp/exhibitions/current.html",
    type: "official_site",
    categoryHints: ["exhibition"],
    strictAreaFilter: false,
  },
  {
    id: "nmwa-upcoming",
    name: "国立西洋美術館 今後の展覧会",
    url: "https://www.nmwa.go.jp/jp/exhibitions/upcoming.html",
    type: "official_site",
    categoryHints: ["exhibition"],
    strictAreaFilter: false,
  },
  {
    id: "shitamachi-museum",
    name: "台東区立したまちミュージアム",
    url: "https://www.taitogeibun.net/shitamachi/tenji/schedule/",
    type: "official_site",
    categoryHints: ["exhibition"],
    strictAreaFilter: false,
  },
  {
    id: "t-bunka",
    name: "東京文化会館",
    url: "https://www.t-bunka.jp/stage/",
    type: "official_site",
    categoryHints: ["event"],
    strictAreaFilter: false,
  },
  {
    id: "kodomo-library",
    name: "国際こども図書館",
    url: "https://www.kodomo.go.jp/event/event/future",
    type: "official_site",
    categoryHints: ["event"],
    strictAreaFilter: false,
  },
  {
    id: "sougakudou-concert",
    name: "旧東京音楽学校奏楽堂 演奏会",
    url: "https://www.taitogeibun.net/sougakudou/concert/",
    type: "official_site",
    categoryHints: ["event"],
    strictAreaFilter: false,
  },
  {
    id: "sougakudou-contest",
    name: "旧東京音楽学校奏楽堂 コンクール",
    url: "https://www.taitogeibun.net/sougakudou/contest_j/",
    type: "official_site",
    categoryHints: ["event"],
    strictAreaFilter: false,
  },
  {
    id: "sougakudou-workshop",
    name: "旧東京音楽学校奏楽堂 講座・ワークショップ",
    url: "https://www.taitogeibun.net/sougakudou/workshop/",
    type: "official_site",
    categoryHints: ["event"],
    strictAreaFilter: false,
  },
  {
    id: "bentendo",
    name: "不忍池辯天堂",
    url: "https://bentendo.kaneiji.jp/",
    type: "official_site",
    categoryHints: ["event", "facility_news"],
    strictAreaFilter: false,
  },
  {
    id: "kyu-iwasaki-tei",
    name: "旧岩崎邸庭園",
    url: "https://www.tokyo-park.or.jp/park/kyu-iwasaki-tei/index.html",
    type: "official_site",
    categoryHints: ["event", "facility_news"],
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
