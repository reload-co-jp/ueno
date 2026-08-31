import Link from "next/link"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { CardGrid, EventCard } from "@/components/elements/card"
import { getArticlesByEvent, getEventsInRange } from "@/lib/data"
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
          {events.map((e) => {
            const articles = getArticlesByEvent(e.id)
            return (
              <div key={e.id}>
                <EventCard event={e} />
                {articles.length > 0 && (
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: ".5rem 0 0",
                      fontSize: ".8125rem",
                      color: "#7a7468",
                    }}
                  >
                    {articles.map((a) => (
                      <li key={a.id}>
                        関連記事:{" "}
                        <Link href={`/articles/${a.id}`} style={{ color: "#c0483a" }}>
                          {a.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </CardGrid>
      )}
    </div>
  )
}

export default Page
