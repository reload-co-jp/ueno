import storesJson from "@/data/stores.json"
import spotsJson from "@/data/spots.json"
import newsJson from "@/data/news.json"
import { isEventArticle, type Store, type Spot, type NewsArticle, type Category } from "@/lib/types"

export const stores = storesJson as Store[]
export const spots = spotsJson as Spot[]
// URL維持のため個別ページは全記事分生成する(generateStaticParams・idルックアップ用)
export const allArticles = newsJson as NewsArticle[]

// 収集時に統合しきれなかった重複記事の判定。同カテゴリで、タイトル一致、
// またはイベント会期が完全一致しタイトルが包含関係にあるものを重複とみなし、先に公開された記事を正とする
const isSameContent = (a: NewsArticle, b: NewsArticle) => {
  if (a.category !== b.category) return false
  if (a.title === b.title) return true
  return (
    isEventArticle(a) &&
    isEventArticle(b) &&
    a.eventStartDate === b.eventStartDate &&
    a.eventEndDate === b.eventEndDate &&
    (a.title.includes(b.title) || b.title.includes(a.title))
  )
}

const isPublishedBefore = (a: NewsArticle, b: NewsArticle) =>
  a.publishedAt !== b.publishedAt ? a.publishedAt < b.publishedAt : Number(a.id) < Number(b.id)

// 重複記事なら正とする記事を返す(canonical用)。重複でなければundefined
export const getPrimaryArticle = (article: NewsArticle) =>
  allArticles.find((other) => other.id !== article.id && isSameContent(article, other) && isPublishedBefore(other, article))

// 一覧・関連記事・sitemap用。重複記事を除く
export const news = allArticles.filter((n) => !getPrimaryArticle(n))

// 静的JSON DBからのidルックアップ
export const getStore = (id: string) => stores.find((s) => s.id === id)
export const getSpot = (id: string) => spots.find((s) => s.id === id)
export const getArticle = (id: string) => allArticles.find((n) => n.id === id)
// イベントもnews.json内のcategory: "event"記事として管理する
export const getEvent = (id: string) => allArticles.find((n) => n.id === id && isEventArticle(n))

// 記事に画像が無い場合、関連スポット(会場名一致を優先)の画像をフォールバックとして使う。
// altは画像の実際の被写体に合わせ、フォールバック時は施設名にする
export const getArticleImage = (article: NewsArticle): { url: string; alt: string } | null => {
  if (article.imageUrl) return { url: article.imageUrl, alt: article.title }
  const spot = getArticleSpots(article).find((s) => s.imageUrl)
  return spot?.imageUrl ? { url: spot.imageUrl, alt: `上野の${spot.type}「${spot.name}」` } : null
}

export const getArticleImageUrl = (article: NewsArticle): string | null =>
  getArticleImage(article)?.url ?? null

// イベント記事の開催近接度。開催期間中は0(最優先)、開催前は開始日時との差(ms)、
// 終了済・イベント記事でないものはInfinity
const getEventProximity = (article: NewsArticle): number => {
  if (!isEventArticle(article)) return Infinity
  const now = Date.now()
  const start = new Date(article.eventStartDate).getTime()
  const end = new Date(`${article.eventEndDate}T23:59:59`).getTime()
  if (now >= start && now <= end) return 0
  const diff = start - now
  return diff >= 0 ? diff : Infinity
}

// イベント記事(開催中・開催前のもののみ)優先→開催中を最優先、次に開催時期の近さ→公開日降順。同日内は画像有無→本文量の充実度で優先表示
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

// relatedSpotIdsに加え、会場名・タイトルに施設名を含む記事も施設に紐付ける(収集時の紐付け漏れを補完)
const articleSpotIdsCache = new Map<string, string[]>()
export const getArticleSpotIds = (article: NewsArticle): string[] => {
  const cached = articleSpotIdsCache.get(article.id)
  if (cached) return cached
  const text = `${article.eventLocation ?? ""} ${article.title}`
  const matched = spots.filter((s) => text.includes(s.name)).map((s) => s.id)
  // 会場名・タイトルで一致した施設を先頭に(収集時の紐付けより会場の特定精度が高い)
  const ids = Array.from(new Set([...matched, ...article.relatedSpotIds]))
  articleSpotIdsCache.set(article.id, ids)
  return ids
}

export const getArticleSpots = (article: NewsArticle) =>
  getArticleSpotIds(article)
    .map(getSpot)
    .filter((s): s is Spot => !!s)

export const getArticlesBySpot = (spotId: string) =>
  news.filter((n) => getArticleSpotIds(n).includes(spotId))

const DAY_MS = 24 * 60 * 60 * 1000

// 開催期間同士の近さ(日数)。重なっていれば0、イベント記事でなければInfinity
const eventGapDays = (a: NewsArticle, b: NewsArticle) => {
  if (!isEventArticle(a) || !isEventArticle(b)) return Infinity
  const gap = Math.max(
    new Date(a.eventStartDate).getTime() - new Date(b.eventEndDate).getTime(),
    new Date(b.eventStartDate).getTime() - new Date(a.eventEndDate).getTime(),
    0
  )
  return gap / DAY_MS
}

// 関連度: 同じ施設 > 同じ店舗 > 同じカテゴリ > 開催時期が近い > 同じエリア。
// 関連性の低い記事を並べないよう、同エリアのみの記事は他候補が足りない場合の補完に留める
const relatedScore = (base: NewsArticle, other: NewsArticle) => {
  const baseSpots = getArticleSpotIds(base)
  let score = 0
  if (getArticleSpotIds(other).some((id) => baseSpots.includes(id))) score += 8
  if (other.relatedStoreIds.some((id) => base.relatedStoreIds.includes(id))) score += 6
  if (other.category === base.category) score += 4
  if (eventGapDays(base, other) <= 14) score += 2
  if (other.area === base.area) score += 1
  return score
}

export const getRelatedArticles = (article: NewsArticle, limit = 3) =>
  news
    .filter((n) => n.id !== article.id)
    .map((n) => ({ n, score: relatedScore(article, n) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || compareArticles(a.n, b.n))
    .slice(0, limit)
    .map(({ n }) => n)

export const getUpcomingEvents = () =>
  news
    .filter(isEventArticle)
    .sort((a, b) => b.eventStartDate.localeCompare(a.eventStartDate))

const toDateOnly = (iso: string) => iso.slice(0, 10)

export const getEventsOnDate = (dateStr: string) =>
  getUpcomingEvents().filter(
    (e) => toDateOnly(e.eventStartDate) <= dateStr && dateStr <= toDateOnly(e.eventEndDate)
  )

export const getEventsInRange = (startStr: string, endStr: string) =>
  getUpcomingEvents().filter(
    (e) => toDateOnly(e.eventStartDate) <= endStr && startStr <= toDateOnly(e.eventEndDate)
  )

// 開催中(終了日が近い順)→開催予定(開始日が近い順)の並び
export const compareEventsBySchedule = (
  a: NewsArticle & { eventStartDate: string; eventEndDate: string },
  b: NewsArticle & { eventStartDate: string; eventEndDate: string },
  today: string
) => {
  const ongoingA = toDateOnly(a.eventStartDate) <= today ? 0 : 1
  const ongoingB = toDateOnly(b.eventStartDate) <= today ? 0 : 1
  if (ongoingA !== ongoingB) return ongoingA - ongoingB
  return ongoingA === 0
    ? a.eventEndDate.localeCompare(b.eventEndDate)
    : a.eventStartDate.localeCompare(b.eventStartDate)
}

export const getOngoingEvents = (today: string) =>
  getEventsOnDate(today).sort((a, b) => compareEventsBySchedule(a, b, today))

export const getFutureEvents = (today: string) =>
  getUpcomingEvents()
    .filter((e) => toDateOnly(e.eventStartDate) > today)
    .sort((a, b) => a.eventStartDate.localeCompare(b.eventStartDate))

// 終了済イベント。個別ページは検索流入資産として残すため一覧からもリンクする
export const getPastEvents = (today: string) =>
  getUpcomingEvents()
    .filter((e) => toDateOnly(e.eventEndDate) < today)
    .sort((a, b) => b.eventEndDate.localeCompare(a.eventEndDate))

export const isFreeEvent = (article: NewsArticle) => (article.eventFee ?? "").includes("無料")

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

export const getMuseumSpots = () => spots.filter((s) => s.type === "美術館")

export const getMuseumArticles = () =>
  news
    .filter((n) => getArticleSpotIds(n).some((id) => getMuseumSpots().some((m) => m.id === id)))
    .sort(compareArticles)

// 「上野 グルメ・カフェ新店」LP向け抽出。関連店舗のカテゴリが飲食系、
// または店舗紐付けが無い記事はタイトルの飲食キーワードで判定する
const GOURMET_STORE_CATEGORIES = ["飲食", "ドリンク", "カフェ・書店"]
const GOURMET_KEYWORDS = [
  "カフェ", "食堂", "ラーメン", "らぁめん", "酒場", "焼肉", "やきにく", "居酒屋",
  "寿司", "カステラ", "パスタ", "チャンポン", "ひつまぶし", "うまいもん", "釜飯",
  "カレー", "ダイニング", "バー", "和牛", "ホルモン", "海鮮", "商店", "ゴンチャ",
  "串", "成吉思汗", "もつ", "おばんざい", "コーヒー", "珈琲", "ベーカリー", "スイーツ",
]

export const getGourmetNewOpenings = () =>
  news
    .filter((n) => {
      if (n.category !== "new_opening") return false
      const hasGourmetStore = n.relatedStoreIds.some((id) => {
        const store = getStore(id)
        return !!store && GOURMET_STORE_CATEGORIES.includes(store.category)
      })
      return hasGourmetStore || GOURMET_KEYWORDS.some((kw) => n.title.includes(kw))
    })
    .sort(compareArticles)
