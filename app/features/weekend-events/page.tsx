import { FC } from "react"
import { CardGrid, EventCard } from "@/components/elements/card"
import { getEventsInRange } from "@/lib/data"
import { thisWeekendRange } from "@/lib/date"

export const metadata = { title: "今週末の上野イベント | 上野ナビ" }

const Page: FC = () => {
  const { start, end } = thisWeekendRange()
  const events = getEventsInRange(start, end)
  return (
    <div>
      <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>今週末の上野イベント</h2>
      {events.length === 0 ? (
        <p style={{ color: "#999" }}>今週末開催のイベントはない。</p>
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
