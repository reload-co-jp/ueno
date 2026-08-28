import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { events, getArticlesByEvent, getEvent, getSpot, getStore } from "@/lib/data"
import { formatDateRangeJp } from "@/lib/date"
import { absoluteUrl, jsonLdString, SITE_NAME } from "@/lib/seo"

export const generateStaticParams = () => events.map((e) => ({ id: e.id }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> => {
  const { id } = await params
  const event = getEvent(id)
  if (!event) return {}
  const url = absoluteUrl(`/events/${event.id}`)
  return {
    title: event.name,
    description: event.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: event.name,
      description: event.summary,
      siteName: SITE_NAME,
      images: event.imageUrl ? [event.imageUrl] : undefined,
    },
    twitter: {
      card: "summary",
      title: event.name,
      description: event.summary,
    },
  }
}

const Page: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params
  const event = getEvent(id)
  if (!event) notFound()

  const relatedStore = event.relatedStoreId ? getStore(event.relatedStoreId) : undefined
  const relatedSpot = event.relatedSpotId ? getSpot(event.relatedSpotId) : undefined
  const relatedArticles = getArticlesByEvent(event.id)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: event.startDate,
    endDate: event.endDate,
    location: { "@type": "Place", name: event.location },
    description: event.summary,
    organizer: { "@type": "Organization", name: event.organizer },
    offers: { "@type": "Offer", price: event.fee },
    url: absoluteUrl(`/events/${event.id}`),
  }

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "40rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "イベント", href: "/events" }, { label: event.name }]} />
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt=""
          style={{ width: "100%", borderRadius: ".75rem", objectFit: "cover" }}
        />
      )}
      <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{event.name}</h2>
      <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>
        {formatDateRangeJp(event.startDate, event.endDate)} ・ {event.area}
      </p>

      <p style={{ fontSize: ".875rem", margin: 0 }}>{event.summary}</p>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: ".875rem" }}>
        <li>開催場所: {event.location}</li>
        <li>料金: {event.fee}</li>
        <li>主催: {event.organizer}</li>
        <li>
          公式サイト:{" "}
          <a href={event.officialUrl} target="_blank" rel="noreferrer" style={{ color: "#c0483a" }}>
            {event.officialUrl}
          </a>
        </li>
      </ul>

      {(relatedStore || relatedSpot) && (
        <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}>
          <h3 style={{ fontSize: ".9375rem", marginBottom: ".5rem" }}>関連情報</h3>
          <ul style={{ listStyle: "none", padding: 0, fontSize: ".875rem" }}>
            {relatedStore && (
              <li>
                <Link href={`/stores/${relatedStore.id}`} style={{ color: "#c0483a" }}>
                  店舗: {relatedStore.name}
                </Link>
              </li>
            )}
            {relatedSpot && (
              <li>
                <Link href={`/spots/${relatedSpot.id}`} style={{ color: "#c0483a" }}>
                  施設: {relatedSpot.name}
                </Link>
              </li>
            )}
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
        <a href={event.source} target="_blank" rel="noreferrer" style={{ color: "#c0483a" }}>
          {event.source}
        </a>
      </div>
    </article>
  )
}

export default Page
