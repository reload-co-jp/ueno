import { Link } from "@/components/elements/link"
import { FC } from "react"
import {
  getArticleSpotIds,
  getFutureEvents,
  getOngoingEvents,
} from "@/lib/data"
import { formatDateRange, todayStr } from "@/lib/date"
import { getI18n } from "@/lib/i18n"
import type { NewsArticle, Spot } from "@/lib/types"

const LIMIT = 5

// 記事の関連施設ごとに、同じ施設で開催中・開催予定のイベントへリンクする(個別記事→施設→関連イベント)
export const SpotEvents: FC<{ article: NewsArticle; spots: Spot[] }> = async ({
  article,
  spots,
}) => {
  const i18n = await getI18n()
  const { locale, t } = i18n
  const today = todayStr()
  const upcoming = [
    ...getOngoingEvents(today),
    ...getFutureEvents(today),
  ].filter((e) => e.id !== article.id)

  return spots.map((spot) => {
    const events = upcoming.filter((e) =>
      getArticleSpotIds(e).includes(spot.id)
    )
    if (events.length === 0) return null
    const name = i18n.spot(spot).name
    return (
      <section
        key={spot.id}
        style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}
      >
        <h2 style={{ fontSize: ".9375rem", margin: "0 0 .5rem" }}>
          {t({
            ja: `${name}で開催中・開催予定のイベント`,
            en: `Current & upcoming events at ${name}`,
            "zh-cn": `${name}正在举办・即将举办的活动`,
          })}
        </h2>
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.25rem",
            fontSize: ".875rem",
            lineHeight: 1.9,
          }}
        >
          {events
            .slice(0, LIMIT)
            .map(i18n.article)
            .map((e) => (
              <li key={e.id}>
                <Link href={`/events/${e.id}`} style={{ color: "#c0483a" }}>
                  {e.title}
                </Link>
                <span style={{ color: "#a39c8c", fontSize: ".75rem" }}>
                  {" "}
                  ({formatDateRange(e.eventStartDate, e.eventEndDate, locale)})
                </span>
              </li>
            ))}
        </ul>
        <p style={{ fontSize: ".875rem", margin: ".5rem 0 0" }}>
          <Link href={`/spots/${spot.id}`} style={{ color: "#c0483a" }}>
            {t({
              ja: `${name}のイベント・展示情報をすべて見る`,
              en: `See all events & exhibitions at ${name}`,
              "zh-cn": `查看${name}的全部活动・展览`,
            })}
          </Link>
        </p>
      </section>
    )
  })
}
