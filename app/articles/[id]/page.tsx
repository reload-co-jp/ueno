import Link from "next/link"
import { notFound } from "next/navigation"
import { FC } from "react"
import { getArticle, getEvent, getSpot, getStore, news } from "@/lib/data"
import { formatDateJp } from "@/lib/date"
import { CATEGORY_LABELS } from "@/lib/types"

export const generateStaticParams = () => news.map((n) => ({ id: n.id }))

const Page: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params
  const article = getArticle(id)
  if (!article) notFound()

  const relatedStores = article.relatedStoreIds.map(getStore).filter(Boolean)
  const relatedSpots = article.relatedSpotIds.map(getSpot).filter(Boolean)
  const relatedEvents = article.relatedEventIds.map(getEvent).filter(Boolean)

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "40rem" }}>
      <span
        style={{
          display: "inline-block",
          fontSize: ".75rem",
          background: "#555",
          borderRadius: ".25rem",
          padding: ".125rem .5rem",
          width: "fit-content",
        }}
      >
        {CATEGORY_LABELS[article.category]}
      </span>
      <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{article.title}</h2>
      <p style={{ fontSize: ".75rem", color: "#999", margin: 0 }}>
        {formatDateJp(article.publishedAt)} ・ {article.area}
      </p>

      <div style={{ fontSize: ".9375rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
        {article.body}
      </div>

      {(relatedStores.length > 0 || relatedSpots.length > 0 || relatedEvents.length > 0) && (
        <div style={{ borderTop: "1px solid #444", paddingTop: "1rem" }}>
          <h3 style={{ fontSize: ".9375rem", marginBottom: ".5rem" }}>関連情報</h3>
          <ul style={{ listStyle: "none", padding: 0, fontSize: ".875rem" }}>
            {relatedStores.map((s) => (
              <li key={s!.id}>
                <Link href={`/stores/${s!.id}`} style={{ color: "#8ecbff" }}>
                  店舗: {s!.name}
                </Link>
              </li>
            ))}
            {relatedSpots.map((s) => (
              <li key={s!.id}>
                <Link href={`/spots/${s!.id}`} style={{ color: "#8ecbff" }}>
                  施設: {s!.name}
                </Link>
              </li>
            ))}
            {relatedEvents.map((e) => (
              <li key={e!.id}>イベント: {e!.name}</li>
            ))}
          </ul>
        </div>
      )}

      <p style={{ fontSize: ".75rem", color: "#999" }}>情報源: {article.source}</p>
    </article>
  )
}

export default Page
