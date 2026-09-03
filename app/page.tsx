import Link from "next/link"
import { FC } from "react"
import { badgeStyle } from "@/components/elements/card"
import { formatDateJp } from "@/lib/date"
import { getArticleImageUrl, getLatestArticles } from "@/lib/data"
import { CATEGORY_LABELS } from "@/lib/types"

const FEATURES = [
  { href: "/features/this-week", label: "今週の上野" },
  { href: "/features/gourmet-new-stores", label: "グルメ・カフェ新店" },
  { href: "/features/today-events", label: "今日の上野イベント" },
  { href: "/features/weekend-events", label: "今週末の上野イベント" },
  { href: "/features/monthly-openings", label: "今月の新店舗" },
  { href: "/features/ongoing-sales", label: "現在開催中のセール" },
] as const

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1.125rem",
  paddingBottom: ".5rem",
  marginBottom: "1.25rem",
  borderBottom: "0.1875rem solid #111",
}

const Page: FC = () => {
  const [hero, ...rest] = getLatestArticles(12)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {hero && (
        <section>
          <Link
            href={`/articles/${hero.id}`}
            style={{ display: "block", color: "#111", textDecoration: "none" }}
          >
            <img
              src={getArticleImageUrl(hero) ?? "/images/placeholder.jpg"}
              alt={hero.title}
              style={{
                width: "100%",
                aspectRatio: "21 / 9",
                objectFit: "contain",
                borderRadius: ".5rem",
                marginBottom: "1.25rem",
              }}
            />
            <span style={badgeStyle}>{CATEGORY_LABELS[hero.category]}</span>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                lineHeight: 1.25,
                margin: ".5rem 0",
              }}
            >
              {hero.title}
            </h2>
            <p style={{ fontSize: ".875rem", color: "#666", margin: 0 }}>
              {formatDateJp(hero.publishedAt)} ・ {hero.area}
            </p>
          </Link>
        </section>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem" }}>
        <section style={{ flex: "3 1 22rem" }}>
          <h1 style={sectionTitleStyle}>上野の最新情報</h1>
          <div>
            {rest.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                style={{
                  display: "flex",
                  gap: "1.25rem",
                  padding: "1.25rem 0",
                  borderBottom: "1px solid #e5e5e5",
                  color: "#111",
                  textDecoration: "none",
                }}
              >
                <img
                  src={getArticleImageUrl(article) ?? "/images/placeholder.jpg"}
                  alt={article.title}
                  style={{
                    width: "9rem",
                    aspectRatio: "4 / 3",
                    objectFit: "contain",
                    borderRadius: ".375rem",
                    flexShrink: 0,
                    maxHeight: "9rem",
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <span style={badgeStyle}>
                    {CATEGORY_LABELS[article.category]}
                  </span>
                  <h3
                    style={{
                      fontSize: "1.0625rem",
                      margin: ".125rem 0 .375rem",
                    }}
                  >
                    {article.title}
                  </h3>
                  <p
                    style={{
                      fontSize: ".875rem",
                      color: "#666",
                      margin: "0 0 .5rem",
                    }}
                  >
                    {article.summary}
                  </p>
                  <p style={{ fontSize: ".75rem", color: "#999", margin: 0 }}>
                    {formatDateJp(article.publishedAt)} ・ {article.area}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside style={{ flex: "1 1 14rem" }}>
          <h2 style={sectionTitleStyle}>特集</h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}
          >
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="pill"
                style={{
                  display: "block",
                  background: "#f7e6e1",
                  borderRadius: ".5rem",
                  padding: ".75rem 1rem",
                  fontSize: ".875rem",
                  fontWeight: 800,
                  color: "#c0483a",
                  textDecoration: "none",
                }}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Page
