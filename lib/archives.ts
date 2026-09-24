// イベント・新店舗の月別アーカイブ(/events/2026/09/ 等)。
// 薄いページを作らないよう、掲載件数が MIN_ARCHIVE_ITEMS 未満の月は生成しない
import { compareArticles, getArticlesByCategory, getEventsInRange, getUpcomingEvents } from "@/lib/data"
import { thisMonthRange, toDateStr } from "@/lib/date"
import type { NewsArticle } from "@/lib/types"

export const MIN_ARCHIVE_ITEMS = 3

export interface MonthArchive<T extends NewsArticle = NewsArticle> {
  year: string
  // ゼロ埋め2桁("09")
  month: string
  label: string
  // 当月はアーカイブではなく今月の特集ページを正規URLとする
  isCurrent: boolean
  articles: T[]
}

const monthRange = (year: number, monthIndex: number) => ({
  start: toDateStr(new Date(year, monthIndex, 1)),
  end: toDateStr(new Date(year, monthIndex + 1, 0)),
})

const toArchive = <T extends NewsArticle>(start: string, articles: T[]): MonthArchive<T> => ({
  year: start.slice(0, 4),
  month: start.slice(5, 7),
  label: `${Number(start.slice(0, 4))}年${Number(start.slice(5, 7))}月`,
  isCurrent: start === thisMonthRange().start,
  articles,
})

// 開催期間が月に重なるイベントをその月に含める
export const getEventArchives = () => {
  const events = getUpcomingEvents()
  if (events.length === 0) return []
  const first = events.reduce((min, e) => (e.eventStartDate < min ? e.eventStartDate : min), events[0].eventStartDate)
  const last = events.reduce((max, e) => (e.eventEndDate > max ? e.eventEndDate : max), events[0].eventEndDate)
  const archives: MonthArchive<(typeof events)[number]>[] = []
  for (
    let d = new Date(Number(first.slice(0, 4)), Number(first.slice(5, 7)) - 1, 1);
    toDateStr(d) <= last;
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  ) {
    const { start, end } = monthRange(d.getFullYear(), d.getMonth())
    const inMonth = getEventsInRange(start, end).sort((a, b) => a.eventStartDate.localeCompare(b.eventStartDate))
    if (inMonth.length >= MIN_ARCHIVE_ITEMS) archives.push(toArchive(start, inMonth))
  }
  return archives
}

// 新店舗は公開月で分類
export const getNewStoreArchives = () => {
  const byMonth = new Map<string, NewsArticle[]>()
  getArticlesByCategory("new_opening").forEach((a) => {
    const key = `${a.publishedAt.slice(0, 7)}-01`
    byMonth.set(key, [...(byMonth.get(key) ?? []), a])
  })
  return Array.from(byMonth.entries())
    .filter(([, articles]) => articles.length >= MIN_ARCHIVE_ITEMS)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([start, articles]) => toArchive(start, articles.sort(compareArticles)))
}

export const findArchive = <T extends NewsArticle>(archives: MonthArchive<T>[], year: string, month: string) =>
  archives.find((a) => a.year === year && a.month === month)
