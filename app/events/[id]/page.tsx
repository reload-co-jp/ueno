import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FC } from "react"
import { ArticleBody } from "@/components/elements/article-body"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getArticleImageUrl, getEvent, getRelatedArticles, getSpot, getStore, getUpcomingEvents } from "@/lib/data"
import { formatDateRangeJp } from "@/lib/date"
import { absoluteUrl, jsonLdString, SITE_NAME } from "@/lib/seo"

export const generateStaticParams = () => getUpcomingEvents().map((e) => ({ id: e.id }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> => {
  const { id } = await params
  const event = getEvent(id)
  if (!event) return {}
  const url = absoluteUrl(`/events/${event.id}`)
  const imageUrl = getArticleImageUrl(event)
  return {
    title: event.title,
    description: event.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: event.title,
      description: event.summary,
      siteName: SITE_NAME,
      images: imageUrl ? [imageUrl] : undefined,
    },
    twitter: {
      card: "summary",
      title: event.title,
      description: event.summary,
    },
  }
}

const Page: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params
  const event = getEvent(id)
  if (!event) notFound()

  const relatedStores = event.relatedStoreIds.map(getStore).filter(Boolean)
  const relatedSpots = event.relatedSpotIds.map(getSpot).filter(Boolean)
  const relatedArticles = getRelatedArticles(event)
  const imageUrl = getArticleImageUrl(event)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.eventStartDate,
    endDate: event.eventEndDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: event.eventLocation },
    description: event.summary,
    image: imageUrl ? [absoluteUrl(imageUrl)] : undefined,
    organizer: { "@type": "Organization", name: event.eventOrganizer, url: event.eventOfficialUrl },
    offers: {
      "@type": "Offer",
      price: event.eventFee,
      priceCurrency: "JPY",
      url: event.eventOfficialUrl,
    },
    url: absoluteUrl(`/events/${event.id}`),
  }

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "75rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "イベント", href: "/events" }, { label: event.title }]} />
      {imageUrl && (
        <img
          src={imageUrl}
          alt={event.title}
          style={{ width: "100%", borderRadius: ".75rem", objectFit: "cover" }}
        />
      )}
      <h1 style={{ fontSize: "1.25rem", margin: 0 }}>{event.title}</h1>
      <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>
        {formatDateRangeJp(event.eventStartDate, event.eventEndDate)} ・ {event.area}
      </p>

      <ArticleBody body={event.body} />

      <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: ".875rem" }}>
        {event.eventLocation && <li>開催場所: {event.eventLocation}</li>}
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
          <h3 style={{ fontSize: ".9375rem", marginBottom: ".5rem" }}>関連情報</h3>
          <ul style={{ listStyle: "none", padding: 0, fontSize: ".875rem" }}>
            {relatedStores.map((s) => (
              <li key={s!.id}>
                <Link href={`/stores/${s!.id}`} style={{ color: "#c0483a" }}>
                  店舗: {s!.name}
                </Link>
              </li>
            ))}
            {relatedSpots.map((s) => (
              <li key={s!.id}>
                <Link href={`/spots/${s!.id}`} style={{ color: "#c0483a" }}>
                  施設: {s!.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}>
          <h3 style={{ fontSize: ".9375rem", marginBottom: ".75rem" }}>関連記事</h3>
          <CardGrid>
            {relatedArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        </div>
      )}

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
