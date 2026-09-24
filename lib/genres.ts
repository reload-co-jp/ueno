// 「今日の公演」「今週の展示」等の検索クエリ向け特集ページのジャンル定義
import { getEventsInRange, getEventsOnDate } from "@/lib/data"
import { thisWeekRange, todayStr } from "@/lib/date"
import type { NewsArticle } from "@/lib/types"

export interface Genre {
  key: string
  label: string
  keywords: string[]
}

export const GENRES: Genre[] = [
  { key: "koen", label: "公演", keywords: ["公演"] },
  { key: "engeki", label: "演劇", keywords: ["演劇", "芝居"] },
  { key: "concert", label: "コンサート", keywords: ["コンサート", "ライブ"] },
  { key: "tenji", label: "展示", keywords: ["展示"] },
  { key: "museum", label: "美術館", keywords: ["美術館"] },
  { key: "hakubutsukan", label: "博物館", keywords: ["博物館"] },
  { key: "kikakuten", label: "企画展", keywords: ["企画展"] },
  { key: "tokubetsuten", label: "特別展", keywords: ["特別展"] },
  { key: "fes", label: "フェス", keywords: ["フェス", "フェスティバル"] },
  { key: "matsuri", label: "祭", keywords: ["祭", "まつり"] },
]

export type PeriodKey = "today" | "week"

export interface Period {
  key: PeriodKey
  label: string
}

export const PERIODS: Period[] = [
  { key: "today", label: "今日" },
  { key: "week", label: "今週" },
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
