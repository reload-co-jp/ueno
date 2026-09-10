import type { Metadata } from "next"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { compareArticles, getEventsInRange, news } from "@/lib/data"
import { thisWeekRange, toDateStr } from "@/lib/date"
import { SITE_NAME } from "@/lib/seo"

const title = "今週の上野"
const description = "今週開催中の上野エリアのイベント・最新情報をまとめて紹介。毎週更新。"

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/features/this-week" },
  openGraph: { type: "website", title, description, siteName: SITE_NAME },
  twitter: { card: "summary", title, description },
}

const Page: FC = () => {
  const { start, end } = thisWeekRange()
  const events = getEventsInRange(start, end)
  const articles = news
    .filter((n) => {
      const d = toDateStr(new Date(n.publishedAt))
      return d >= start && d <= end
    })
    .sort(compareArticles)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Breadcrumb items={[{ label: "特集" }, { label: "今週の上野" }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>今週の上野</h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        上野エリアで今週開催中のイベントと最新記事をまとめている。上野公園・上野駅周辺の
        話題を毎週更新。
      </p>

      <div>
        <h3 style={{ fontSize: "1rem", marginBottom: ".75rem" }}>開催中・開催予定イベント</h3>
        {events.length === 0 ? (
          <p style={{ color: "#999" }}>今週開催のイベントはない。</p>
        ) : (
          <CardGrid>
            {events.map((e) => (
              <ArticleCard key={e.id} article={e} />
            ))}
          </CardGrid>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: "1rem", marginBottom: ".75rem" }}>今週の記事</h3>
        {articles.length === 0 ? (
          <p style={{ color: "#999" }}>今週公開の記事はない。</p>
        ) : (
          <CardGrid>
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        )}
      </div>
    </div>
  )
}

export default Page
