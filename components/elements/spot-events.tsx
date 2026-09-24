import Link from "next/link"
import { FC } from "react"
import { getArticleSpotIds, getFutureEvents, getOngoingEvents } from "@/lib/data"
import { formatDateRangeJp, todayStr } from "@/lib/date"
import type { NewsArticle, Spot } from "@/lib/types"

const LIMIT = 5

// 記事の関連施設ごとに、同じ施設で開催中・開催予定のイベントへリンクする(個別記事→施設→関連イベント)
export const SpotEvents: FC<{ article: NewsArticle; spots: Spot[] }> = ({
  article,
  spots,
}) => {
  const today = todayStr()
  const upcoming = [...getOngoingEvents(today), ...getFutureEvents(today)].filter(
    (e) => e.id !== article.id
  )

  return spots.map((spot) => {
    const events = upcoming.filter((e) => getArticleSpotIds(e).includes(spot.id))
    if (events.length === 0) return null
    return (
      <section
        key={spot.id}
        style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}
      >
        <h2 style={{ fontSize: ".9375rem", margin: "0 0 .5rem" }}>
          {spot.name}で開催中・開催予定のイベント
        </h2>
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.25rem",
            fontSize: ".875rem",
            lineHeight: 1.9,
          }}
        >
          {events.slice(0, LIMIT).map((e) => (
            <li key={e.id}>
              <Link href={`/events/${e.id}`} style={{ color: "#c0483a" }}>
                {e.title}
              </Link>
              <span style={{ color: "#a39c8c", fontSize: ".75rem" }}>
                {" "}
                ({formatDateRangeJp(e.eventStartDate, e.eventEndDate)})
              </span>
            </li>
          ))}
        </ul>
        <p style={{ fontSize: ".875rem", margin: ".5rem 0 0" }}>
          <Link href={`/spots/${spot.id}`} style={{ color: "#c0483a" }}>
            {spot.name}のイベント・展示情報をすべて見る
          </Link>
        </p>
      </section>
    )
  })
}
