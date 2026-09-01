import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getUpcomingEvents } from "@/lib/data"

export const metadata = {
  title: "イベント",
  description: "上野エリアの開催予定イベント一覧",
}

const Page: FC = () => {
  const events = getUpcomingEvents()
  return (
    <div>
      <Breadcrumb items={[{ label: "イベント" }]} />
      <h1 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>イベント</h1>
      <CardGrid>
        {events.map((event) => (
          <ArticleCard key={event.id} article={event} />
        ))}
      </CardGrid>
    </div>
  )
}

export default Page
