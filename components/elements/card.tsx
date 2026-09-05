import Link from "next/link"
import { FC } from "react"
import { CATEGORY_LABELS, NewsArticle, Spot, Store, isEventArticle } from "@/lib/types"
import { formatDateJp, formatDateRangeJp } from "@/lib/date"
import { getArticleImageUrl } from "@/lib/data"

const cardStyle: React.CSSProperties = {
  display: "block",
  background: "#fff",
  borderBottom: "0.1875rem solid #111",
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

export const ArticleCard: FC<{ article: NewsArticle }> = ({ article }) => {
  const isEvent = isEventArticle(article)
  return (
    <Link
      href={isEvent ? `/events/${article.id}` : `/articles/${article.id}`}
      className="card"
      style={cardStyle}
    >
      <img
        src={getArticleImageUrl(article) ?? "/images/placeholder.jpg"}
        alt={article.title}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          objectFit: "contain",
          marginBottom: ".75rem",
        }}
      />
      <div style={{ padding: "0 .5rem" }}>
        <span style={badgeStyle}>{CATEGORY_LABELS[article.category]}</span>
        <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>
          {article.title}
        </h3>
        <p style={{ fontSize: ".875rem", color: "#7a7468", margin: "0 0 .5rem" }}>
          {article.summary}
        </p>
        {isEvent && (
          <p
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: ".375rem",
              fontSize: ".8125rem",
              fontWeight: 700,
              color: "#c0483a",
              background: "#f7e6e1",
              borderRadius: ".375rem",
              padding: ".1875rem .625rem",
              margin: "0 0 .375rem",
            }}
          >
            <span style={{ fontSize: ".6875rem", fontWeight: 800 }}>開催日時</span>
            {formatDateRangeJp(article.eventStartDate, article.eventEndDate)}
          </p>
        )}
        <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>
          {isEvent ? "" : formatDateJp(article.publishedAt)}
          {isEvent ? "" : " ・ "}
          {isEvent ? (article.eventLocation ?? article.area) : article.area}
        </p>
      </div>
    </Link>
  )
}

export const StoreCard: FC<{ store: Store }> = ({ store }) => (
  <Link href={`/stores/${store.id}`} className="card" style={cardStyle}>
    <div style={{ padding: "1rem" }}>
      <span style={badgeStyle}>{store.category}</span>
      <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>{store.name}</h3>
      <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>
        {store.address} ・ {store.hours}
      </p>
    </div>
  </Link>
)

export const SpotCard: FC<{ spot: Spot }> = ({ spot }) => (
  <Link href={`/spots/${spot.id}`} className="card" style={cardStyle}>
    <img
      src={spot.imageUrl ?? "/images/placeholder.jpg"}
      alt={spot.name}
      style={{
        width: "100%",
        aspectRatio: "16 / 9",
        objectFit: "cover",
        marginBottom: ".75rem",
      }}
    />
    <div style={{ padding: "0 .5rem 1rem" }}>
      <span style={badgeStyle}>{spot.type}</span>
      <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>{spot.name}</h3>
      <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>
        {spot.address}
      </p>
    </div>
  </Link>
)

export const CardGrid: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))",
      gap: "1.25rem",
    }}
  >
    {children}
  </div>
)
