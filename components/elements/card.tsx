import Link from "next/link"
import { FC } from "react"
import { CATEGORY_LABELS, EventItem, NewsArticle, Spot, Store } from "@/lib/types"
import { formatDateJp, formatDateRangeJp } from "@/lib/date"

const cardStyle: React.CSSProperties = {
  display: "block",
  border: "1px solid #444",
  borderRadius: ".5rem",
  padding: "1rem",
  color: "#f0f0f0",
  textDecoration: "none",
}

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: ".75rem",
  background: "#555",
  borderRadius: ".25rem",
  padding: ".125rem .5rem",
  marginBottom: ".5rem",
}

export const ArticleCard: FC<{ article: NewsArticle }> = ({ article }) => (
  <Link href={`/articles/${article.id}`} style={cardStyle}>
    <span style={badgeStyle}>{CATEGORY_LABELS[article.category]}</span>
    <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>{article.title}</h3>
    <p style={{ fontSize: ".875rem", color: "#ccc", margin: "0 0 .5rem" }}>
      {article.summary}
    </p>
    <p style={{ fontSize: ".75rem", color: "#999", margin: 0 }}>
      {formatDateJp(article.publishedAt)} ・ {article.area}
    </p>
  </Link>
)

export const EventCard: FC<{ event: EventItem }> = ({ event }) => (
  <a href={event.officialUrl} target="_blank" rel="noreferrer" style={cardStyle}>
    <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>{event.name}</h3>
    <p style={{ fontSize: ".875rem", color: "#ccc", margin: "0 0 .5rem" }}>
      {event.summary}
    </p>
    <p style={{ fontSize: ".75rem", color: "#999", margin: 0 }}>
      {formatDateRangeJp(event.startDate, event.endDate)} ・ {event.location} ・{" "}
      {event.fee}
    </p>
  </a>
)

export const StoreCard: FC<{ store: Store }> = ({ store }) => (
  <Link href={`/stores/${store.id}`} style={cardStyle}>
    <span style={badgeStyle}>{store.category}</span>
    <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>{store.name}</h3>
    <p style={{ fontSize: ".75rem", color: "#999", margin: 0 }}>
      {store.address} ・ {store.hours}
    </p>
  </Link>
)

export const SpotCard: FC<{ spot: Spot }> = ({ spot }) => (
  <Link href={`/spots/${spot.id}`} style={cardStyle}>
    <span style={badgeStyle}>{spot.type}</span>
    <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>{spot.name}</h3>
    <p style={{ fontSize: ".75rem", color: "#999", margin: 0 }}>{spot.address}</p>
  </Link>
)

export const CardGrid: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))",
      gap: "1rem",
    }}
  >
    {children}
  </div>
)
