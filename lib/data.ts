import storesJson from "@/data/stores.json"
import spotsJson from "@/data/spots.json"
import eventsJson from "@/data/events.json"
import newsJson from "@/data/news.json"
import type { Store, Spot, EventItem, NewsArticle, Category } from "@/lib/types"

export const stores = storesJson as Store[]
export const spots = spotsJson as Spot[]
export const events = eventsJson as EventItem[]
export const news = newsJson as NewsArticle[]

// 静的JSON DBからのidルックアップ
export const getStore = (id: string) => stores.find((s) => s.id === id)
export const getSpot = (id: string) => spots.find((s) => s.id === id)
export const getEvent = (id: string) => events.find((e) => e.id === id)
export const getArticle = (id: string) => news.find((n) => n.id === id)

// 関連イベントの開催日と現在日時との差(ms・絶対値)。関連イベントなしはInfinity
const getEventProximity = (article: NewsArticle): number => {
  if (article.relatedEventIds.length === 0) return Infinity
  const now = Date.now()
  const diffs = article.relatedEventIds
    .map((id) => getEvent(id))
    .filter((e): e is EventItem => !!e)
    .map((e) => Math.abs(new Date(e.startDate).getTime() - now))
  return diffs.length > 0 ? Math.min(...diffs) : Infinity
}

// イベントカテゴリ優先→開催時期の近さ→公開日降順。同日内は画像有無→本文量の充実度で優先表示
export const compareArticles = (a: NewsArticle, b: NewsArticle) => {
  const isEventA = a.category === "event" ? 0 : 1
  const isEventB = b.category === "event" ? 0 : 1
  if (isEventA !== isEventB) return isEventA - isEventB

  const proximityA = getEventProximity(a)
  const proximityB = getEventProximity(b)
  if (proximityA !== proximityB) return proximityA - proximityB

  const dateA = a.publishedAt.slice(0, 10)
  const dateB = b.publishedAt.slice(0, 10)
  if (dateA !== dateB) return dateB.localeCompare(dateA)
  const imageA = a.imageUrl ? 1 : 0
  const imageB = b.imageUrl ? 1 : 0
  if (imageA !== imageB) return imageB - imageA
  if (a.body.length !== b.body.length) return b.body.length - a.body.length
  return b.publishedAt.localeCompare(a.publishedAt)
}

export const getArticlesByCategory = (category: Category | Category[]) => {
  const categories = Array.isArray(category) ? category : [category]
  return news.filter((n) => categories.includes(n.category)).sort(compareArticles)
}

export const getLatestArticles = (limit = 10) =>
  [...news].sort(compareArticles).slice(0, limit)

export const getArticlesByArea = (area: string) =>
  news.filter((n) => n.area === area).sort(compareArticles)

export const getArticlesByStore = (storeId: string) =>
  news.filter((n) => n.relatedStoreIds.includes(storeId))

export const getArticlesBySpot = (spotId: string) =>
  news.filter((n) => n.relatedSpotIds.includes(spotId))

export const getArticlesByEvent = (eventId: string) =>
  news.filter((n) => n.relatedEventIds.includes(eventId)).sort(compareArticles)

// 同カテゴリ→同エリアの順で補完し、自身を除いた関連記事を返す
export const getRelatedArticles = (article: NewsArticle, limit = 3) => {
  const sameCategory = news
    .filter((n) => n.id !== article.id && n.category === article.category)
    .sort(compareArticles)

  const sameArea = news
    .filter(
      (n) => n.id !== article.id && n.area === article.area && n.category !== article.category
    )
    .sort(compareArticles)

  return [...sameCategory, ...sameArea].slice(0, limit)
}

export const getUpcomingEvents = () =>
  [...events].sort((a, b) => a.startDate.localeCompare(b.startDate))

const toDateOnly = (iso: string) => iso.slice(0, 10)

export const getEventsOnDate = (dateStr: string) =>
  getUpcomingEvents().filter(
    (e) => toDateOnly(e.startDate) <= dateStr && dateStr <= toDateOnly(e.endDate)
  )

export const getEventsInRange = (startStr: string, endStr: string) =>
  getUpcomingEvents().filter(
    (e) => toDateOnly(e.startDate) <= endStr && startStr <= toDateOnly(e.endDate)
  )

export const getAreas = () => {
  const areaSet = new Set<string>()
  stores.forEach((s) => areaSet.add(s.area))
  spots.forEach((s) => areaSet.add(s.area))
  news.forEach((n) => areaSet.add(n.area))
  return Array.from(areaSet).sort()
}

export const getStoresByArea = (area: string) =>
  stores.filter((s) => s.area === area)

export const getSpotsByArea = (area: string) =>
  spots.filter((s) => s.area === area)
