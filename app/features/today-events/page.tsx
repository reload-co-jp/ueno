import Link from "next/link"
import { FC } from "react"
import { CardGrid, EventCard } from "@/components/elements/card"
import { getArticlesByEvent, getEventsOnDate } from "@/lib/data"
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
