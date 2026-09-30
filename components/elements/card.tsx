import { Link } from "@/components/elements/link"
import { FC } from "react"
import { NewsArticle, Spot, Store, isEventArticle } from "@/lib/types"
import { formatDate, formatDateRange } from "@/lib/date"
import { getI18n } from "@/lib/i18n"

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

export const ArticleCard: FC<{ article: NewsArticle }> = async ({
  article: original,
}) => {
  const i18n = await getI18n()
  const { locale, t } = i18n
  const article = i18n.article(original)
  const isEvent = isEventArticle(article)
  const image = i18n.image(original)
  return (
    <Link
      href={isEvent ? `/events/${article.id}` : `/articles/${article.id}`}
      className="card"
      style={cardStyle}
    >
      <img
        src={image?.url ?? "/images/placeholder.jpg"}
        alt={image?.alt ?? ""}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          objectFit: "contain",
          marginBottom: ".75rem",
        }}
      />
      <div style={{ padding: "0 .5rem" }}>
        <span style={badgeStyle}>{i18n.category(article.category)}</span>
        <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>
          {article.title}
        </h3>
        <p
          style={{ fontSize: ".875rem", color: "#7a7468", margin: "0 0 .5rem" }}
        >
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
            <span style={{ fontSize: ".6875rem", fontWeight: 800 }}>
              {t({ ja: "開催日時", en: "Dates", "zh-cn": "举办时间" })}
            </span>
            {formatDateRange(
              article.eventStartDate,
              article.eventEndDate,
              locale
            )}
          </p>
        )}
        <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>
          {isEvent ? "" : formatDate(article.publishedAt, locale)}
          {isEvent ? "" : t({ ja: " ・ ", en: " · ", "zh-cn": " · " })}
          {isEvent ? (article.eventLocation ?? article.area) : article.area}
          {isEvent &&
            original.eventFee &&
            original.eventFee !== "不明" &&
            `${t({ ja: " ・ ", en: " · ", "zh-cn": " · " })}${t({ ja: "料金", en: "Admission", "zh-cn": "费用" })}: ${article.eventFee}`}
        </p>
      </div>
    </Link>
  )
}

export const StoreCard: FC<{ store: Store }> = async ({ store: original }) => {
  const { t, store: localize } = await getI18n()
  const store = localize(original)
  return (
    <Link href={`/stores/${store.id}`} className="card" style={cardStyle}>
      <div style={{ padding: "1rem" }}>
        <span style={badgeStyle}>{store.category}</span>
        <h3 style={{ fontSize: "1rem", margin: "0 0 .25rem" }}>{store.name}</h3>
        <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>
          {store.address}
        {t({ ja: " ・ ", en: " · ", "zh-cn": " · " })}
        {store.hours}
        </p>
      </div>
    </Link>
  )
}

export const SpotCard: FC<{ spot: Spot }> = async ({ spot: original }) => {
  const spot = (await getI18n()).spot(original)
  return (
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
}

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
