import type { MetadataRoute } from "next"
import { news, spots, stores } from "@/lib/data"
import { SITE_URL } from "@/lib/seo"

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
  "/features/today-events",
  "/features/weekend-events",
  "/features/monthly-openings",
  "/features/ongoing-sales",
]

const sitemap = (): MetadataRoute.Sitemap => {
  const staticEntries = STATIC_PATHS.map((path) => ({
    url: path === "/" ? SITE_URL + "/" : `${SITE_URL}${path}/`,
    changeFrequency: "daily" as const,
    priority: path === "/" ? 1 : 0.7,
  }))

  const articleEntries = news.map((n) => ({
    url: `${SITE_URL}/articles/${n.id}/`,
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

  return [...staticEntries, ...articleEntries, ...storeEntries, ...spotEntries]
}

export default sitemap
