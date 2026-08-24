import { FC } from "react"
import { CardGrid, EventCard } from "@/components/elements/card"
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
      <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>今日の上野イベント</h2>
      {events.length === 0 ? (
        <p style={{ color: "#999" }}>本日開催中のイベントはない。</p>
      ) : (
        <CardGrid>
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </CardGrid>
      )}
    </div>
  )
}

export default Page
