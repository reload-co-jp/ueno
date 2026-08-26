import Link from "next/link"
import { FC } from "react"
import { CATEGORY_LABELS, NewsArticle, Spot, Store, EventItem } from "@/lib/types"
import { formatDateJp, formatDateRangeJp } from "@/lib/date"

const cardStyle: React.CSSProperties = {
  display: "block",
  background: "#fff",
  borderBottom: "0.1875rem solid #111",
  borderRadius: ".375rem",
  padding: "0 0 1rem",
  color: "#111",
  textDecoration: "none",
}

export const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: ".75rem",
  fontWeight: 800,
  background: "#f7e6e1",
  color: "#c0483a",
  borderRadius: "999px",
  padding: ".125rem .75rem",
  marginBottom: ".5rem",
}

export const ArticleCard: FC<{ article: NewsArticle }> = ({ article }) => (
  <Link href={`/articles/${article.id}`} className="card" style={cardStyle}>
    {article.imageUrl && (
      <img
        src={article.imageUrl}
        alt=""
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          objectFit: "cover",
          borderRadius: ".5rem",
          marginBottom: ".75rem",
        }}
      />
    )}
    <span style={badgeStyle}>{CATEGORY_LABELS[article.category]}</span>
    <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>{article.title}</h3>
    <p style={{ fontSize: ".875rem", color: "#7a7468", margin: "0 0 .5rem" }}>
      {article.summary}
    </p>
    <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>
      {formatDateJp(article.publishedAt)} ・ {article.area}
    </p>
  </Link>
)

export const EventCard: FC<{ event: EventItem }> = ({ event }) => (
  <a
    href={event.officialUrl}
    target="_blank"
    rel="noreferrer"
    className="card"
    style={cardStyle}
  >
    <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>{event.name}</h3>
    <p style={{ fontSize: ".875rem", color: "#7a7468", margin: "0 0 .5rem" }}>
      {event.summary}
    </p>
    <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>
      {formatDateRangeJp(event.startDate, event.endDate)} ・ {event.location} ・{" "}
      {event.fee}
    </p>
  </a>
)

export const StoreCard: FC<{ store: Store }> = ({ store }) => (
  <Link href={`/stores/${store.id}`} className="card" style={cardStyle}>
    <span style={badgeStyle}>{store.category}</span>
    <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>{store.name}</h3>
    <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>
      {store.address} ・ {store.hours}
    </p>
  </Link>
)

export const SpotCard: FC<{ spot: Spot }> = ({ spot }) => (
  <Link href={`/spots/${spot.id}`} className="card" style={cardStyle}>
    <span style={badgeStyle}>{spot.type}</span>
    <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>{spot.name}</h3>
    <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>{spot.address}</p>
  </Link>
)

export const CardGrid: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))",
      gap: "1.25rem",
    }}
  >
    {children}
  </div>
)
