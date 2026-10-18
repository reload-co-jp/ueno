import { Link } from "@/components/elements/link"
import { FC, ReactNode } from "react"
import { NewsArticle, Spot, Store, isEventArticle } from "@/lib/types"
import { getEventStatus, type EventStatus } from "@/lib/data"
import { formatDate, formatDateRange, todayStr } from "@/lib/date"
import { getI18n, type Texts } from "@/lib/i18n"

export const EVENT_STATUS_LABELS: Record<EventStatus, Texts> = {
  ongoing: { ja: "開催中", en: "Now on", "zh-cn": "举办中" },
  upcoming: { ja: "開催予定", en: "Upcoming", "zh-cn": "即将举办" },
  ended: { ja: "終了", en: "Ended", "zh-cn": "已结束" },
}

// 終了済は灰色、開催中は強調色で区別する
const STATUS_COLORS: Record<EventStatus, string> = {
  ongoing: "var(--accent)",
  upcoming: "var(--green)",
  ended: "var(--secondary)",
}

export const EventStatusBadge: FC<{ status: EventStatus; label: string }> = ({ status, label }) => (
  <span style={{ ...badgeStyle, color: STATUS_COLORS[status], marginBottom: 0, marginRight: ".375rem" }}>{label}</span>
)

export const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: ".6875rem",
  fontWeight: 700,
  letterSpacing: ".06em",
  lineHeight: 1.6,
  color: "var(--accent)",
  border: "1px solid currentColor",
  borderRadius: "2px",
  padding: "0 .375rem",
  marginBottom: ".5rem",
}

// 画像枠。比率はCSS(.card-media)で固定しレイアウトシフトを防ぐ。画像が無ければラベル入りのプレースホルダー
export const Media: FC<{
  image?: { url: string; alt: string } | null
  fallback: string
  badge?: ReactNode
  eager?: boolean
}> = ({ image, fallback, badge, eager }) => (
  <div className={image ? "card-media" : "card-media is-empty"}>
    {image ? (
      <img
        src={image.url}
        alt={image.alt}
        width={640}
        height={480}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    ) : (
      <span aria-hidden="true">{fallback}</span>
    )}
    {badge}
  </div>
)

export const ArticleCard: FC<{ article: NewsArticle }> = async ({
  article: original,
}) => {
  const i18n = await getI18n()
  const { locale, t } = i18n
  const article = i18n.article(original)
  const isEvent = isEventArticle(article)
  const image = i18n.image(original)
  const label = i18n.category(article.category)
  const sep = t({ ja: " ・ ", en: " · ", "zh-cn": " · " })
  const status = isEvent ? getEventStatus(article, todayStr()) : "upcoming"
  return (
    <Link
      href={isEvent ? `/events/${article.id}` : `/articles/${article.id}`}
      className="card"
    >
      <Media image={image} fallback={label} />
      <div className="card-body">
        <span className="card-label">{label}</span>
        {isEvent && (
          <span className="card-date">
            <EventStatusBadge status={status} label={t(EVENT_STATUS_LABELS[status])} />
            {formatDateRange(article.eventStartDate, article.eventEndDate, locale)}
          </span>
        )}
        <h3 className="card-title">{article.title}</h3>
        <p className="card-summary">{article.summary}</p>
        <p className="card-meta">
          {isEvent ? "" : `${formatDate(article.publishedAt, locale)}${sep}`}
          {isEvent ? (article.eventLocation ?? article.area) : article.area}
          {isEvent &&
            original.eventFee &&
            original.eventFee !== "不明" &&
            `${sep}${t({ ja: "料金", en: "Admission", "zh-cn": "费用" })}: ${article.eventFee}`}
        </p>
      </div>
    </Link>
  )
}

export const StoreCard: FC<{ store: Store }> = async ({ store: original }) => {
  const { t, store: localize } = await getI18n()
  const store = localize(original)
  return (
    <Link
      href={`/stores/${store.id}`}
      className="card"
      style={{ borderTop: "1px solid var(--text)", paddingTop: ".25rem" }}
    >
      <div className="card-body">
        <span className="card-label">{store.category}</span>
        <h3 className="card-title">{store.name}</h3>
        <p className="card-meta">
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
    <Link href={`/spots/${spot.id}`} className="card">
      <Media
        image={spot.imageUrl ? { url: spot.imageUrl, alt: spot.name } : null}
        fallback={spot.type}
      />
      <div className="card-body">
        <span className="card-label">{spot.type}</span>
        <h3 className="card-title">{spot.name}</h3>
        <p className="card-meta">{spot.address}</p>
      </div>
    </Link>
  )
}

// 画像・カテゴリ・タイトル・補助情報の小型カード。画像が無い場合はプレースホルダーを表示する
export const CompactCard: FC<{
  href: string
  image?: { url: string; alt: string } | null
  label: string
  title: string
  meta?: ReactNode
  note?: string
  badge?: ReactNode
  className?: string
  eager?: boolean
}> = ({ href, image, label, title, meta, note, badge, className, eager }) => (
  <Link href={href} className={`card ${className ?? ""}`}>
    <Media image={image} fallback={label} badge={badge} eager={eager} />
    <div className="card-body">
      <span className="card-label">{label}</span>
      {meta && <span className="card-date">{meta}</span>}
      <h3 className="card-title">{title}</h3>
      {note && <p className="card-meta">{note}</p>}
    </div>
  </Link>
)

export const CardGrid: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="card-grid">{children}</div>
)
