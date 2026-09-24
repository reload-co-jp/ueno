import type { MetadataRoute } from "next"
import { getEventArchives, getNewStoreArchives } from "@/lib/archives"
import { news, spots, stores } from "@/lib/data"
import { EVENT_FEATURE_KEYS, getEventFeature } from "@/lib/event-features"
import { GENRES, genreEvents, genreSlug, PERIODS } from "@/lib/genres"
import { pageUrl, SITE_URL } from "@/lib/seo"
import { isEventArticle } from "@/lib/types"

export const dynamic = "force-static"

const STATIC_PATHS = [
  "/",
  "/events",
  "/new-stores",
  "/closures",
  "/sales",
  "/popup",
  "/exhibitions",
  "/stores",
  "/spots",
  "/features/this-week",
  "/features/gourmet-new-stores",
  "/features/monthly-openings",
  "/features/ongoing-sales",
]

const sitemap = (): MetadataRoute.Sitemap => {
  const staticEntries = STATIC_PATHS.map((path) => ({
    url: path === "/" ? SITE_URL + "/" : `${SITE_URL}${path}/`,
    changeFrequency: "daily" as const,
    priority: path === "/" ? 1 : 0.7,
  }))

  // 日付特集は該当イベントがある場合のみ掲載(空ページはnoindex)
  const eventFeatureEntries = EVENT_FEATURE_KEYS.map(getEventFeature)
    .filter((f) => f.events.length > 0)
    .map((f) => ({
      url: pageUrl(f.path),
      changeFrequency: "daily" as const,
      priority: f.key === "today" || f.key === "weekend" ? 0.8 : 0.7,
    }))

  // 月別アーカイブ(当月分は今月の特集ページが正規URLのため除外)
  const archiveEntries = [
    ...getEventArchives().map((a) => ({ ...a, base: "/events" })),
    ...getNewStoreArchives().map((a) => ({ ...a, base: "/new-stores" })),
  ]
    .filter((a) => !a.isCurrent)
    .map((a) => ({
      url: pageUrl(`${a.base}/${a.year}/${a.month}`),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }))

  const genreEntries = PERIODS.flatMap((period) =>
    GENRES.filter((genre) => genreEvents(period, genre).length > 0).map((genre) => ({
      url: `${SITE_URL}/features/genre/${genreSlug(period, genre)}/`,
      changeFrequency: "daily" as const,
      priority: 0.5,
    }))
  )

  const articleEntries = news.map((n) => ({
    // イベント記事は /events/[id] を正規URLとする(/articles/[id] のcanonicalも同様)
    url: pageUrl(isEventArticle(n) ? `/events/${n.id}` : `/articles/${n.id}`),
    lastModified: n.updatedAt ?? n.publishedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  const storeEntries = stores.map((s) => ({
    url: `${SITE_URL}/stores/${s.id}/`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }))

  const spotEntries = spots.map((s) => ({
    url: `${SITE_URL}/spots/${s.id}/`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }))

  return [...staticEntries, ...eventFeatureEntries, ...archiveEntries, ...genreEntries, ...articleEntries, ...storeEntries, ...spotEntries]
}

export default sitemap
