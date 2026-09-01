import storesJson from "@/data/stores.json"
import spotsJson from "@/data/spots.json"
import newsJson from "@/data/news.json"
import { isEventArticle, type Store, type Spot, type NewsArticle, type Category } from "@/lib/types"

export const stores = storesJson as Store[]
export const spots = spotsJson as Spot[]
export const news = newsJson as NewsArticle[]

// 静的JSON DBからのidルックアップ
export const getStore = (id: string) => stores.find((s) => s.id === id)
export const getSpot = (id: string) => spots.find((s) => s.id === id)
export const getArticle = (id: string) => news.find((n) => n.id === id)
// イベントもnews.json内のcategory: "event"記事として管理する
export const getEvent = (id: string) => news.find((n) => n.id === id && isEventArticle(n))

// 記事に画像が無い場合、関連スポットの画像をフォールバックとして使う
export const getArticleImageUrl = (article: NewsArticle): string | null =>
  article.imageUrl ??
  article.relatedSpotIds.map(getSpot).find((s) => s?.imageUrl)?.imageUrl ??
  null

// イベント記事の開催日と現在日時との差(ms)。過去開催・イベント記事でないものはInfinity
const getEventProximity = (article: NewsArticle): number => {
  if (!isEventArticle(article)) return Infinity
  const diff = new Date(article.eventStartDate).getTime() - Date.now()
  return diff >= 0 ? diff : Infinity
}

// イベントカテゴリ(開催日が未来のもののみ)優先→開催時期の近さ→公開日降順。同日内は画像有無→本文量の充実度で優先表示
export const compareArticles = (a: NewsArticle, b: NewsArticle) => {
  const proximityA = getEventProximity(a)
  const proximityB = getEventProximity(b)
  const isEventA = proximityA !== Infinity ? 0 : 1
  const isEventB = proximityB !== Infinity ? 0 : 1
  if (isEventA !== isEventB) return isEventA - isEventB

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
  news
    .filter(isEventArticle)
    .sort((a, b) => a.eventStartDate.localeCompare(b.eventStartDate))

const toDateOnly = (iso: string) => iso.slice(0, 10)

export const getEventsOnDate = (dateStr: string) =>
  getUpcomingEvents().filter(
    (e) => toDateOnly(e.eventStartDate) <= dateStr && dateStr <= toDateOnly(e.eventEndDate)
  )

export const getEventsInRange = (startStr: string, endStr: string) =>
  getUpcomingEvents().filter(
    (e) => toDateOnly(e.eventStartDate) <= endStr && startStr <= toDateOnly(e.eventEndDate)
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
