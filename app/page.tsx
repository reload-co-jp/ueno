import Link from "next/link"
import { FC } from "react"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getLatestArticles } from "@/lib/data"

const FEATURES = [
  { href: "/features/this-week", label: "今週の上野" },
  { href: "/features/today-events", label: "今日の上野イベント" },
  { href: "/features/weekend-events", label: "今週末の上野イベント" },
  { href: "/features/monthly-openings", label: "今月の新店舗" },
  { href: "/features/ongoing-sales", label: "現在開催中のセール" },
] as const

const Page: FC = () => {
  const latest = getLatestArticles(12)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section>
        <h2 style={{ fontSize: "1.125rem", marginBottom: ".75rem" }}>特集</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="pill"
              style={{
                background: "#f7e6e1",
                border: "1px solid #e8e1d3",
                borderRadius: "999px",
                padding: ".5rem 1rem",
                fontSize: ".875rem",
                fontWeight: 700,
                color: "#c0483a",
                textDecoration: "none",
              }}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.125rem", marginBottom: ".75rem" }}>
          上野の最新情報
        </h2>
        <CardGrid>
          {latest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </CardGrid>
      </section>
    </div>
  )
}

export default Page
