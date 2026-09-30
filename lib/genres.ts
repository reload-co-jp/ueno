// 「今日の公演」「今週の展示」等の検索クエリ向け特集ページのジャンル定義
import { getEventsInRange, getEventsOnDate } from "@/lib/data"
import { thisWeekRange, todayStr } from "@/lib/date"
import type { Texts } from "@/lib/i18n"
import type { NewsArticle } from "@/lib/types"

export interface Genre {
  key: string
  label: Texts
  keywords: string[]
}

// keywordsは日本語データに対する判定用(翻訳後の表示テキストではなく原文で判定する)
export const GENRES: Genre[] = [
  { key: "koen", label: { ja: "公演", en: "Performances", "zh-cn": "演出" }, keywords: ["公演"] },
  { key: "engeki", label: { ja: "演劇", en: "Theater", "zh-cn": "戏剧" }, keywords: ["演劇", "芝居"] },
  { key: "concert", label: { ja: "コンサート", en: "Concerts", "zh-cn": "音乐会" }, keywords: ["コンサート", "ライブ"] },
  { key: "tenji", label: { ja: "展示", en: "Exhibits", "zh-cn": "展示" }, keywords: ["展示"] },
  { key: "museum", label: { ja: "美術館", en: "Art Museum Events", "zh-cn": "美术馆" }, keywords: ["美術館"] },
  { key: "hakubutsukan", label: { ja: "博物館", en: "Museum Events", "zh-cn": "博物馆" }, keywords: ["博物館"] },
  { key: "kikakuten", label: { ja: "企画展", en: "Featured Exhibitions", "zh-cn": "企划展" }, keywords: ["企画展"] },
  { key: "tokubetsuten", label: { ja: "特別展", en: "Special Exhibitions", "zh-cn": "特别展" }, keywords: ["特別展"] },
  { key: "fes", label: { ja: "フェス", en: "Festivals", "zh-cn": "音乐节・庆典" }, keywords: ["フェス", "フェスティバル"] },
  { key: "matsuri", label: { ja: "祭", en: "Matsuri", "zh-cn": "祭典" }, keywords: ["祭", "まつり"] },
]

export type PeriodKey = "today" | "week"

export interface Period {
  key: PeriodKey
  label: Texts
}

export const PERIODS: Period[] = [
  { key: "today", label: { ja: "今日", en: "today", "zh-cn": "今天" } },
  { key: "week", label: { ja: "今週", en: "this week", "zh-cn": "本周" } },
]

export const matchesGenre = (article: NewsArticle, genre: Genre) => {
  const text = `${article.title} ${article.summary} ${article.eventLocation ?? ""}`
  return genre.keywords.some((k) => text.includes(k))
}

export const genreSlug = (period: Period, genre: Genre) => `${period.key}-${genre.key}`

export const parseGenreSlug = (slug: string) => {
  const period = PERIODS.find((p) => slug.startsWith(`${p.key}-`))
  if (!period) return null
  const genre = GENRES.find((g) => g.key === slug.slice(period.key.length + 1))
  if (!genre) return null
  return { period, genre }
}

// 該当0件のジャンルページはnoindex・sitemap除外(薄いページを検索対象にしない)
export const genreEvents = (period: Period, genre: Genre) => {
  const candidates =
    period.key === "today"
      ? getEventsOnDate(todayStr())
      : getEventsInRange(thisWeekRange().start, thisWeekRange().end)
  return candidates.filter((e) => matchesGenre(e, genre))
}
