import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getEventsInRange } from "@/lib/data"
import { thisWeekendRange } from "@/lib/date"

export const metadata = {
  title: "今週末の上野イベント",
  description: "今週末開催の上野エリアのイベント情報",
}

const Page: FC = () => {
  const { start, end } = thisWeekendRange()
  const events = getEventsInRange(start, end)
  return (
    <div>
      <Breadcrumb items={[{ label: "特集" }, { label: "今週末の上野イベント" }]} />
      <h1 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>今週末の上野イベント</h1>
      {events.length === 0 ? (
        <p style={{ color: "#999" }}>今週末開催のイベントはない。</p>
      ) : (
        <CardGrid>
          {events.map((e) => (
            <ArticleCard key={e.id} article={e} />
          ))}
        </CardGrid>
      )}
    </div>
  )
}

export default Page
