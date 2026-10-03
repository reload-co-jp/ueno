// ヘッダー検索のサジェスト用インデックス。静的exportのためビルド時にJSONとして書き出し、
// クライアントは初回フォーカス時に1回だけ取得して前方一致ではなく部分一致で絞り込む
import { compareArticles, getFutureEvents, getOngoingEvents, getPastEvents, news, spots, stores } from "@/lib/data"
import { formatDotDate, formatEventSpan, todayStr } from "@/lib/date"
import { categoryLabel, localizeArticle, localizeSpot, localizeStore, type Locale, type Texts } from "@/lib/i18n"
import { isEventArticle } from "@/lib/types"

export interface SearchEntry {
  // 種別ラベル(イベント・スポット等)
  k: string
  // タイトル
  t: string
  // リンク先(言語プレフィックスなし)
  h: string
  // 補助情報(開催期間・日付・場所)
  d?: string
  // 検索対象テキスト(小文字化済み)
  s: string
}

// 「今日」「無料」「ランチ」等の自然なキーワードから特集・一覧へ直接飛ばすショートカット
const SHORTCUTS: { href: string; label: Texts; keywords: string }[] = [
  { href: "/features/today-events", label: { ja: "今日の上野イベント", en: "Today in Ueno", "zh-cn": "今日上野活动" }, keywords: "今日 きょう 本日 today 今天" },
  { href: "/features/weekend-events", label: { ja: "今週末の上野イベント", en: "This weekend in Ueno", "zh-cn": "本周末上野活动" }, keywords: "今週末 週末 土日 土曜 日曜 weekend 周末" },
  { href: "/features/this-week", label: { ja: "今週の上野", en: "This week in Ueno", "zh-cn": "本周上野" }, keywords: "今週 this week 本周" },
  { href: "/features/next-week-events", label: { ja: "来週の上野イベント", en: "Next week in Ueno", "zh-cn": "下周上野活动" }, keywords: "来週 next week 下周" },
  { href: "/features/month-events", label: { ja: "今月の上野イベント", en: "This month in Ueno", "zh-cn": "本月上野活动" }, keywords: "今月 this month 本月" },
  { href: "/features/free-events", label: { ja: "上野の無料イベント", en: "Free events in Ueno", "zh-cn": "上野免费活动" }, keywords: "無料 タダ free 免费" },
  { href: "/features/museums", label: { ja: "上野の美術館・博物館", en: "Ueno museums", "zh-cn": "上野美术馆・博物馆" }, keywords: "美術館 博物館 ミュージアム museum 美术馆 博物馆" },
  { href: "/exhibitions", label: { ja: "上野の展示・展覧会", en: "Ueno exhibitions", "zh-cn": "上野展览" }, keywords: "展示 展覧会 アート 美術 exhibition art 展览 艺术" },
  { href: "/features/gourmet-new-stores", label: { ja: "上野のグルメ・カフェ新店", en: "New restaurants & cafés", "zh-cn": "上野美食・咖啡新店" }, keywords: "ランチ グルメ カフェ ごはん 飲食 ディナー lunch food cafe restaurant 美食 咖啡 午餐" },
  { href: "/new-stores", label: { ja: "上野の新店舗", en: "New shops in Ueno", "zh-cn": "上野新店" }, keywords: "新店 新店舗 オープン 開店 new open shop 新店 开业" },
  { href: "/popup", label: { ja: "上野のPOP UP", en: "Pop-ups in Ueno", "zh-cn": "上野快闪店" }, keywords: "pop up popup ポップアップ 期間限定 快闪" },
  { href: "/sales", label: { ja: "上野のセール", en: "Sales in Ueno", "zh-cn": "上野促销" }, keywords: "セール 安売り バーゲン sale 促销" },
  { href: "/closures", label: { ja: "上野の閉店情報", en: "Closures in Ueno", "zh-cn": "上野闭店" }, keywords: "閉店 閉業 closing closure 闭店" },
  { href: "/spots", label: { ja: "上野の施設・スポット", en: "Places in Ueno", "zh-cn": "上野设施・景点" }, keywords: "スポット 施設 観光 公園 spot place park 景点 公园" },
]

const KIND: Record<"shortcut" | "event" | "past" | "spot" | "store", Texts> = {
  shortcut: { ja: "特集", en: "Guide", "zh-cn": "专题" },
  event: { ja: "イベント", en: "Event", "zh-cn": "活动" },
  past: { ja: "終了", en: "Ended", "zh-cn": "已结束" },
  spot: { ja: "スポット", en: "Place", "zh-cn": "景点" },
  store: { ja: "店舗", en: "Shop", "zh-cn": "店铺" },
}

const text = (...parts: (string | undefined | null)[]) => parts.filter(Boolean).join(" ").toLowerCase()

// 並び順がそのまま表示優先度になる: 特集 → 開催中・予定イベント → スポット → 店舗 → 記事 → 終了イベント
export const buildSearchIndex = (locale: Locale): SearchEntry[] => {
  const today = todayStr()
  const kind = (k: keyof typeof KIND) => KIND[k][locale]
  const eventEntry = (e: ReturnType<typeof getOngoingEvents>[number], k: string): SearchEntry => {
    const a = localizeArticle(e, locale)
    return {
      k,
      t: a.title,
      h: `/events/${a.id}`,
      d: [formatEventSpan(a.eventStartDate, a.eventEndDate), a.eventLocation].filter(Boolean).join(" ・ "),
      s: text(a.title, e.title, a.eventLocation, a.area, a.eventFee, categoryLabel(a.category, locale), a.summary),
    }
  }

  const active = [...getOngoingEvents(today), ...getFutureEvents(today)]
  return [
    ...SHORTCUTS.map((sc) => ({ k: kind("shortcut"), t: sc.label[locale], h: sc.href, s: text(sc.label[locale], sc.keywords) })),
    ...active.map((e) => eventEntry(e, kind("event"))),
    ...spots.map((original) => {
      const s = localizeSpot(original, locale)
      return { k: kind("spot"), t: s.name, h: `/spots/${s.id}`, d: s.type, s: text(s.name, original.name, s.type, s.address, s.area) }
    }),
    ...stores.map((original) => {
      const s = localizeStore(original, locale)
      return { k: kind("store"), t: s.name, h: `/stores/${s.id}`, d: s.category, s: text(s.name, original.name, s.category, s.address, s.area) }
    }),
    ...news
      .filter((n) => !isEventArticle(n))
      .sort(compareArticles)
      .map((n) => {
        const a = localizeArticle(n, locale)
        return {
          k: categoryLabel(a.category, locale),
          t: a.title,
          h: `/articles/${a.id}`,
          d: formatDotDate(a.publishedAt),
          s: text(a.title, n.title, a.area, categoryLabel(a.category, locale), a.summary),
        }
      }),
    ...getPastEvents(today).map((e) => eventEntry(e, kind("past"))),
  ]
}
