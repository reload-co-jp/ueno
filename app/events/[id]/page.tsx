import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { ArticleBody } from "@/components/elements/article-body"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { SpotEvents } from "@/components/elements/spot-events"
import { getArticleImage, getArticleImageUrl, getEvent, getRelatedArticles, getArticleSpots, getStore, allArticles, getPrimaryArticle } from "@/lib/data"
import { formatDateRangeJp } from "@/lib/date"
import { absoluteUrl, articleDescription, jsonLdString, pageUrl, parseFeeYen, SITE_NAME } from "@/lib/seo"
import { isEventArticle } from "@/lib/types"

export const generateStaticParams = () =>
  allArticles.filter(isEventArticle).map((e) => ({ id: e.id }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> => {
  const { id } = await params
  const event = getEvent(id)
  if (!event) return {}
  // 重複記事は先行記事を正規URLとする
  const url = pageUrl(`/events/${(getPrimaryArticle(event) ?? event).id}`)
  const imageUrl = getArticleImageUrl(event)
  return {
    title: event.title,
    description: articleDescription(event),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: event.title,
      description: articleDescription(event),
      siteName: SITE_NAME,
      images: imageUrl ? [imageUrl] : undefined,
    },
    twitter: {
      card: "summary",
      title: event.title,
      description: articleDescription(event),
    },
  }
}

const Page: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params
  const event = getEvent(id)
  if (!event) notFound()

  const relatedStores = event.relatedStoreIds.map(getStore).filter(Boolean)
  const relatedSpots = getArticleSpots(event)
  const relatedArticles = getRelatedArticles(event)
  const image = getArticleImage(event)
  const imageUrl = image?.url
  // 会場施設が1つに定まる場合のみ住所を表示・構造化データに含める
  const venue = relatedSpots.length === 1 ? relatedSpots[0] : undefined
  const price = parseFeeYen(event.eventFee)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.eventStartDate,
    endDate: event.eventEndDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.eventLocation ?? venue?.name ?? event.area,
      // 住所はページ上に会場施設として表示している場合のみ
      ...(venue
        ? { address: { "@type": "PostalAddress", streetAddress: venue.address, addressCountry: "JP" } }
        : {}),
    },
    description: event.summary,
    image: imageUrl ? [absoluteUrl(imageUrl)] : undefined,
    organizer: event.eventOrganizer
      ? { "@type": "Organization", name: event.eventOrganizer, url: event.eventOfficialUrl }
      : undefined,
    // 料金表記から金額が読み取れる場合のみ(「一般 2,000円」→2000、「入場無料」→0)
    offers:
      price !== null
        ? { "@type": "Offer", price, priceCurrency: "JPY", url: event.eventOfficialUrl ?? pageUrl(`/events/${event.id}`) }
        : undefined,
    url: pageUrl(`/events/${event.id}`),
  }

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "75rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "イベント", href: "/events" },
          // 会場施設が1つに定まる場合は施設ページを経由させる(イベント > 施設 > 個別イベント)
          ...(relatedSpots.length === 1
            ? [{ label: relatedSpots[0].name, href: `/spots/${relatedSpots[0].id}` }]
            : []),
          { label: event.title },
        ]}
      />
      {imageUrl && (
        <img
          src={imageUrl}
          alt={image?.alt}
          style={{ width: "100%", borderRadius: ".75rem", objectFit: "cover" }}
        />
      )}
      <h1 style={{ fontSize: "1.25rem", margin: 0 }}>{event.title}</h1>
      <p
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          gap: ".5rem",
          fontSize: "1rem",
          fontWeight: 700,
          color: "#c0483a",
          background: "#f7e6e1",
          borderRadius: ".5rem",
          padding: ".5rem .875rem",
          margin: 0,
        }}
      >
        <span style={{ fontSize: ".75rem", fontWeight: 800 }}>開催日時</span>
        {formatDateRangeJp(event.eventStartDate, event.eventEndDate)}
      </p>
      <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>{event.area}</p>

      <InArticleAd />

      <ArticleBody body={event.body} />

      <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: ".875rem" }}>
        {event.eventLocation && <li>開催場所: {event.eventLocation}</li>}
        {venue && (
          <li>
            会場施設:{" "}
            <Link href={`/spots/${venue.id}`} style={{ color: "#c0483a" }}>
              {venue.name}
            </Link>
            (住所: {venue.address})
          </li>
        )}
        {event.eventFee && <li>料金: {event.eventFee}</li>}
        {event.eventOrganizer && <li>主催: {event.eventOrganizer}</li>}
        {event.eventOfficialUrl && (
          <li>
            公式サイト:{" "}
            <a href={event.eventOfficialUrl} target="_blank" rel="noreferrer" style={{ color: "#c0483a" }}>
              {event.eventOfficialUrl}
            </a>
          </li>
        )}
      </ul>

      {(relatedStores.length > 0 || relatedSpots.length > 0) && (
        <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}>
          <h2 style={{ fontSize: ".9375rem", marginBottom: ".5rem" }}>関連情報</h2>
          <ul style={{ listStyle: "none", padding: 0, fontSize: ".875rem" }}>
            {relatedStores.map((s) => (
              <li key={s.id}>
                <Link href={`/stores/${s.id}`} style={{ color: "#c0483a" }}>
                  店舗: {s.name}
                </Link>
              </li>
            ))}
            {relatedSpots.map((s) => (
              <li key={s.id}>
                <Link href={`/spots/${s.id}`} style={{ color: "#c0483a" }}>
                  施設: {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}>
          <h2 style={{ fontSize: ".9375rem", marginBottom: ".75rem" }}>関連記事</h2>
          <CardGrid>
            {relatedArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        </div>
      )}

      <SpotEvents article={event} spots={relatedSpots} />

      <RelatedLinks />

      <div style={{ fontSize: ".75rem", color: "#a39c8c" }}>
        情報源:{" "}
        {event.sources.map((url, i) => (
          <span key={url}>
            {i > 0 && "、"}
            <a href={url} target="_blank" rel="noreferrer" style={{ color: "#c0483a" }}>
              {url}
            </a>
          </span>
        ))}
      </div>
    </article>
  )
}

export default Page
