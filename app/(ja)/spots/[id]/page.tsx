import type { Metadata } from "next"
import { Link } from "@/components/elements/link"
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
import { getI18n } from "@/lib/i18n"
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
  const original = getSpot(id)
  if (!original) return {}
  const i18n = await getI18n()
  const { t } = i18n
  const spot = i18n.spot(original)
  const { ongoing, future } = getSpotContents(original)
  const metadata = await pageMetadata({
    title: t({
      ja: `${spot.name}のイベント・展示情報`,
      en: `${spot.name}: Events & Exhibitions`,
      "zh-cn": `${spot.name}活动・展览资讯`,
    }),
    description: t({
      ja: `上野の${spot.type}「${spot.name}」で開催中のイベント${ongoing.length}件・今後の開催予定${future.length}件、展示・関連ニュースをまとめて紹介。所在地: ${spot.address}`,
      en: `${ongoing.length} current and ${future.length} upcoming events, exhibitions and news at ${spot.name} (${spot.type}) in Ueno. Address: ${spot.address}`,
      "zh-cn": `汇总上野${spot.type}「${spot.name}」正在举办的${ongoing.length}场活动、即将举办的${future.length}场活动以及展览和相关新闻。地址：${spot.address}`,
    }),
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
const linkStyle = { color: "var(--accent)" }

const Page: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params
  const original = getSpot(id)
  if (!original) notFound()
  const i18n = await getI18n()
  const { locale, t, path } = i18n
  const spot = i18n.spot(original)
  const { ongoing, future, exhibitions, pastEvents, news } =
    getSpotContents(original)
  // 種別・エリアの比較は翻訳前の値で行う
  const nearbySpots = spots
    .filter((s) => s.id !== original.id && s.area === original.area)
    .sort((a, b) => Number(b.type === original.type) - Number(a.type === original.type))
    .slice(0, 4)
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPES[original.type] ?? "TouristAttraction",
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
    url: pageUrl(path(`/spots/${spot.id}`)),
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
              eventListJsonLd(
                t({ ja: `${spot.name}のイベント`, en: `Events at ${spot.name}`, "zh-cn": `${spot.name}的活动` }),
                upcoming,
                locale
              )
            ),
          }}
        />
      )}
      <Breadcrumb
        items={[
          { label: t({ ja: "施設・スポット", en: "Places", "zh-cn": "设施・景点" }), href: "/spots" },
          { label: spot.name },
        ]}
      />
      <img
        src={spot.imageUrl ?? "/images/placeholder.jpg"}
        alt={
          spot.imageUrl
            ? t({ ja: `上野の${spot.type}「${spot.name}」`, en: spot.name, "zh-cn": `上野${spot.type}「${spot.name}」` })
            : ""
        }
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
            background: "var(--accent-soft)",
            color: "var(--accent)",
            borderRadius: "999px",
            padding: ".125rem .75rem",
            marginBottom: ".5rem",
          }}
        >
          {spot.type}
        </span>
        <h1 style={{ fontSize: "1.25rem", margin: "0 0 .5rem" }}>
          {t({
            ja: `${spot.name}のイベント・展示情報`,
            en: `${spot.name}: Events & Exhibitions`,
            "zh-cn": `${spot.name}活动・展览资讯`,
          })}
        </h1>
        <p
          style={{
            fontSize: ".875rem",
            color: "var(--secondary)",
            margin: "0 0 1rem",
            lineHeight: 1.7,
          }}
        >
          {t({
            ja: `上野・${spot.area}エリアの${spot.type}「${spot.name}」で開催中・開催予定のイベント、展示、関連ニュースをまとめている。`,
            en: `Current and upcoming events, exhibitions and news at ${spot.name}, a ${spot.type.toLowerCase()} in the ${spot.area} area of Ueno.`,
            "zh-cn": `汇总上野・${spot.area}地区${spot.type}「${spot.name}」正在举办及即将举办的活动、展览和相关新闻。`,
          })}
        </p>
        <h2 style={sectionHeadingStyle}>{t({ ja: "施設情報", en: "Information", "zh-cn": "设施信息" })}</h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            fontSize: ".875rem",
            lineHeight: 1.9,
          }}
        >
          <li>
            {t({ ja: "住所", en: "Address", "zh-cn": "地址" })}: {spot.address}
          </li>
          <li>
            {t({ ja: "エリア", en: "Area", "zh-cn": "区域" })}: {spot.area}
          </li>
          <li>
            {t({ ja: "地図", en: "Map", "zh-cn": "地图" })}:{" "}
            <a href={mapUrl} target="_blank" rel="noreferrer" style={linkStyle}>
              {t({ ja: "Googleマップで見る", en: "View on Google Maps", "zh-cn": "在Google地图中查看" })}
            </a>
          </li>
          <li>
            {t({ ja: "公式サイト", en: "Official website", "zh-cn": "官方网站" })}:{" "}
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
          {t({
            ja: `開催中のイベント(${ongoing.length}件)`,
            en: `Happening now (${ongoing.length})`,
            "zh-cn": `正在举办的活动(${ongoing.length}场)`,
          })}
        </h2>
        {ongoing.length === 0 ? (
          <p style={{ color: "#999" }}>
            {t({
              ja: `現在${spot.name}で開催中のイベント情報はない。`,
              en: `No events are currently happening at ${spot.name}.`,
              "zh-cn": `目前${spot.name}没有正在举办的活动。`,
            })}
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
            {t({
              ja: `今後のイベント(${future.length}件)`,
              en: `Upcoming events (${future.length})`,
              "zh-cn": `即将举办的活动(${future.length}场)`,
            })}
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
          <h2 style={sectionHeadingStyle}>
            {t({
              ja: `${spot.name}のその他の展示・展覧会`,
              en: `More exhibitions at ${spot.name}`,
              "zh-cn": `${spot.name}的其他展览`,
            })}
          </h2>
          <CardGrid>
            {exhibitions.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        </section>
      )}

      {news.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>
            {t({ ja: `${spot.name}の関連ニュース`, en: `News about ${spot.name}`, "zh-cn": `${spot.name}相关新闻` })}
          </h2>
          <CardGrid>
            {news.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        </section>
      )}

      {pastEvents.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>{t({ ja: "終了したイベント", en: "Past events", "zh-cn": "已结束的活动" })}</h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.25rem",
              fontSize: ".875rem",
              lineHeight: 1.9,
            }}
          >
            {pastEvents.map(i18n.article).map((e) => (
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
          <h2 style={sectionHeadingStyle}>
            {t({ ja: `${spot.area}周辺の施設`, en: `Nearby places in ${spot.area}`, "zh-cn": `${spot.area}周边设施` })}
          </h2>
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
