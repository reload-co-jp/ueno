import { FC } from "react"
import { CardGrid, EventCard } from "@/components/elements/card"
import { getUpcomingEvents } from "@/lib/data"

export const metadata = {
  title: "イベント",
  description: "上野エリアの開催予定イベント一覧",
}

const Page: FC = () => {
  const events = getUpcomingEvents()
  return (
    <div>
      <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>イベント</h2>
      <CardGrid>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </CardGrid>
    </div>
  )
}

export default Page
