import { FC } from "react"
import { ArticleCard, CardGrid, EventCard } from "@/components/elements/card"
import { getEventsInRange, news } from "@/lib/data"
import { thisWeekRange, toDateStr } from "@/lib/date"

export const metadata = {
  title: "今週の上野",
  description: "今週開催中の上野エリアのイベント・最新情報",
}

const Page: FC = () => {
  const { start, end } = thisWeekRange()
  const events = getEventsInRange(start, end)
  const articles = news
    .filter((n) => {
      const d = toDateStr(new Date(n.publishedAt))
      return d >= start && d <= end
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h2 style={{ fontSize: "1.125rem", margin: 0 }}>今週の上野</h2>

      <div>
        <h3 style={{ fontSize: "1rem", marginBottom: ".75rem" }}>開催中・開催予定イベント</h3>
        {events.length === 0 ? (
          <p style={{ color: "#999" }}>今週開催のイベントはない。</p>
        ) : (
          <CardGrid>
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
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
