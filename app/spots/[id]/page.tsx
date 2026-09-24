import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid, SpotCard } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import {
  compareArticles,
  getArticlesBySpot,
  getFutureEvents,
  getOngoingEvents,
  getPastEvents,
  getSpot,
  spots,
} from "@/lib/data"
import { todayStr } from "@/lib/date"
import { absoluteUrl, eventListJsonLd, jsonLdString, pageMetadata, pageUrl } from "@/lib/seo"
import { isEventArticle, type Spot } from "@/lib/types"

// 施設種別→Schema.orgの型。該当が無いものはTouristAttraction
const SCHEMA_TYPES: Record<string, string> = {
  公園: "Park",
  美術館: "Museum",
  博物館: "Museum",
  動物園: "Zoo",
  商業施設: "ShoppingCenter",
  百貨店: "DepartmentStore",
  図書館: "Library",
  寺院: "BuddhistTemple",
}

const getSpotContents = (spot: Spot) => {
  const today = todayStr()
  const related = getArticlesBySpot(spot.id)
  const isAtSpot = (a: { id: string }) => related.some((r) => r.id === a.id)
  const ongoing = getOngoingEvents(today).filter(isAtSpot)
  const future = getFutureEvents(today).filter(isAtSpot)
  const listed = new Set([...ongoing, ...future].map((a) => a.id))
  const rest = related.filter((a) => !listed.has(a.id)).sort(compareArticles)
  return {
    ongoing,
    future,
    // 終了済・会期なしの展示も検索流入資産としてリンクを残す
    exhibitions: rest.filter((a) => a.category === "exhibition"),
    pastEvents: getPastEvents(today).filter(
      (e) => isAtSpot(e) && e.category !== "exhibition"
    ),
    news: rest.filter((a) => a.category !== "exhibition" && !isEventArticle(a)),
  }
}

export const generateStaticParams = () => spots.map((s) => ({ id: s.id }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> => {
  const { id } = await params
  const spot = getSpot(id)
  if (!spot) return {}
  const { ongoing, future } = getSpotContents(spot)
  const metadata = pageMetadata({
    title: `${spot.name}のイベント・展示情報`,
    description: `上野の${spot.type}「${spot.name}」で開催中のイベント${ongoing.length}件・今後の開催予定${future.length}件、展示・関連ニュースをまとめて紹介。所在地: ${spot.address}`,
    path: `/spots/${spot.id}`,
  })
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      images: spot.imageUrl ? [spot.imageUrl] : undefined,
    },
  }
}

const sectionHeadingStyle = { fontSize: "1rem", margin: "0 0 .75rem" }
const linkStyle = { color: "#c0483a" }

const Page: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params
  const spot = getSpot(id)
  if (!spot) notFound()
  const { ongoing, future, exhibitions, pastEvents, news } =
    getSpotContents(spot)
  const nearbySpots = spots
    .filter((s) => s.id !== spot.id && s.area === spot.area)
    .sort((a, b) => Number(b.type === spot.type) - Number(a.type === spot.type))
    .slice(0, 4)
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPES[spot.type] ?? "TouristAttraction",
    name: spot.name,
    image: spot.imageUrl ? absoluteUrl(spot.imageUrl) : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: spot.address,
      addressCountry: "JP",
    },
    geo: { "@type": "GeoCoordinates", latitude: spot.lat, longitude: spot.lng },
    hasMap: mapUrl,
    sameAs: spot.officialUrl,
    url: pageUrl(`/spots/${spot.id}`),
  }
  const upcoming = [...ongoing, ...future]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      {upcoming.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdString(
              eventListJsonLd(`${spot.name}のイベント`, upcoming)
            ),
          }}
        />
      )}
      <Breadcrumb
        items={[
          { label: "施設・スポット", href: "/spots" },
          { label: spot.name },
        ]}
      />
      <img
        src={spot.imageUrl ?? "/images/placeholder.jpg"}
        alt={spot.imageUrl ? `上野の${spot.type}「${spot.name}」` : ""}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          objectFit: "cover",
          borderRadius: ".5rem",
        }}
      />
      <div>
        <span
          style={{
            display: "inline-block",
            fontSize: ".75rem",
            fontWeight: 700,
            background: "#f7e6e1",
            color: "#c0483a",
            borderRadius: "999px",
            padding: ".125rem .75rem",
            marginBottom: ".5rem",
          }}
        >
          {spot.type}
        </span>
        <h1 style={{ fontSize: "1.25rem", margin: "0 0 .5rem" }}>
          {spot.name}のイベント・展示情報
        </h1>
        <p
          style={{
            fontSize: ".875rem",
            color: "#7a7468",
            margin: "0 0 1rem",
            lineHeight: 1.7,
          }}
        >
          上野・{spot.area}エリアの{spot.type}「{spot.name}」
          で開催中・開催予定のイベント、展示、関連ニュースをまとめている。
        </p>
        <h2 style={sectionHeadingStyle}>施設情報</h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            fontSize: ".875rem",
            lineHeight: 1.9,
          }}
        >
          <li>住所: {spot.address}</li>
          <li>エリア: {spot.area}</li>
          <li>
            地図:{" "}
            <a href={mapUrl} target="_blank" rel="noreferrer" style={linkStyle}>
              Googleマップで見る
            </a>
          </li>
          <li>
            公式サイト:{" "}
            <a
              href={spot.officialUrl}
              target="_blank"
              rel="noreferrer"
              style={{ ...linkStyle, wordBreak: "break-all" }}
            >
              {spot.officialUrl}
            </a>
          </li>
        </ul>
      </div>

      <section>
        <h2 style={sectionHeadingStyle}>
          開催中のイベント({ongoing.length}件)
        </h2>
        {ongoing.length === 0 ? (
          <p style={{ color: "#999" }}>
            現在{spot.name}で開催中のイベント情報はない。
          </p>
        ) : (
          <CardGrid>
            {ongoing.map((e) => (
              <ArticleCard key={e.id} article={e} />
            ))}
          </CardGrid>
        )}
      </section>

      {future.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>
            今後のイベント({future.length}件)
          </h2>
          <CardGrid>
            {future.map((e) => (
              <ArticleCard key={e.id} article={e} />
            ))}
          </CardGrid>
        </section>
      )}

      {exhibitions.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>{spot.name}のその他の展示・展覧会</h2>
          <CardGrid>
            {exhibitions.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        </section>
      )}

      {news.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>{spot.name}の関連ニュース</h2>
          <CardGrid>
            {news.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        </section>
      )}

      {pastEvents.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>終了したイベント</h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.25rem",
              fontSize: ".875rem",
              lineHeight: 1.9,
            }}
          >
            {pastEvents.map((e) => (
              <li key={e.id}>
                <Link href={`/events/${e.id}`} style={linkStyle}>
                  {e.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {nearbySpots.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>{spot.area}周辺の施設</h2>
          <CardGrid>
            {nearbySpots.map((s) => (
              <SpotCard key={s.id} spot={s} />
            ))}
          </CardGrid>
        </section>
      )}

      <RelatedLinks />
    </div>
  )
}

export default Page
