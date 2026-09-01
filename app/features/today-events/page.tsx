import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getEventsOnDate } from "@/lib/data"
import { todayStr } from "@/lib/date"

export const metadata = {
  title: "今日の上野イベント",
  description: "本日開催の上野エリアのイベント情報",
}

const Page: FC = () => {
  const events = getEventsOnDate(todayStr())
  return (
    <div>
      <Breadcrumb items={[{ label: "特集" }, { label: "今日の上野イベント" }]} />
      <h1 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>今日の上野イベント</h1>
      {events.length === 0 ? (
        <p style={{ color: "#999" }}>本日開催中のイベントはない。</p>
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
