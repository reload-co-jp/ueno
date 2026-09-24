import type { Metadata } from "next"
import Link from "next/link"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { compareArticles, compareEventsBySchedule, getEventsInRange, news } from "@/lib/data"
import { formatShortRangeJp, thisWeekRange, toDateStr, todayStr } from "@/lib/date"
import { getEventFeature } from "@/lib/event-features"
import { eventListJsonLd, jsonLdString, pageMetadata } from "@/lib/seo"
import type { NewsArticle } from "@/lib/types"

const title = "今週の上野｜イベント・展示・新店舗"

const getThisWeek = () => {
  const { start, end } = thisWeekRange()
  const today = todayStr()
  const events = getEventsInRange(start, end).sort((a, b) => compareEventsBySchedule(a, b, today))
  const publishedThisWeek = news
    .filter((n) => {
      const d = toDateStr(new Date(n.publishedAt))
      return d >= start && d <= end
    })
    .sort(compareArticles)
  const eventIds = new Set(events.map((e) => e.id))
  const byCategory = (articles: NewsArticle[], categories: string[]) =>
    articles.filter((a) => categories.includes(a.category))

  const sections = {
    events: events.filter((e) => !["exhibition", "popup"].includes(e.category)),
    exhibitions: byCategory(events, ["exhibition"]),
    newStores: byCategory(publishedThisWeek, ["new_opening"]),
    popups: [
      ...byCategory(events, ["popup"]),
      ...byCategory(publishedThisWeek, ["popup"]).filter((a) => !eventIds.has(a.id)),
    ],
    others: publishedThisWeek.filter(
      (a) => !eventIds.has(a.id) && !["new_opening", "popup"].includes(a.category)
    ),
  }
  return { start, end, events, sections }
}

export const generateMetadata = (): Metadata => {
  const { start, end, sections } = getThisWeek()
  const range = formatShortRangeJp(start, end)
  const total = Object.values(sections).reduce((sum, s) => sum + s.length, 0)
  return pageMetadata({
    title,
    description: `今週(${range})の上野情報まとめ。上野で開催中のイベント${sections.events.length}件・展示${sections.exhibitions.length}件、新店舗${sections.newStores.length}件、POP UPなどを毎週更新。`,
    path: "/features/this-week",
    noindex: total === 0,
  })
}

const sectionHeadingStyle = { fontSize: "1rem", margin: "0 0 .75rem" }

const Section: FC<{ heading: string; articles: NewsArticle[]; empty: string }> = ({
  heading,
  articles,
  empty,
}) => (
  <section>
    <h2 style={sectionHeadingStyle}>{heading}</h2>
    {articles.length === 0 ? (
      <p style={{ color: "#999" }}>{empty}</p>
    ) : (
      <CardGrid>
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </CardGrid>
    )}
  </section>
)

const Page: FC = () => {
  const { start, end, events, sections } = getThisWeek()
  const weekend = getEventFeature("weekend")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {events.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(eventListJsonLd(title, events)) }}
        />
      )}
      <Breadcrumb items={[{ label: "イベント", href: "/events" }, { label: "今週の上野" }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{title}</h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        対象期間: {formatShortRangeJp(start, end)}
        <br />
        上野エリアで今週開催中のイベント・展示会、今週の新店舗やPOP UP情報をまとめている。毎週更新。
      </p>

      <Section heading="今週開催のイベント" articles={sections.events} empty="今週開催のイベントはない。" />
      <Section
        heading="今週開催の展示・展覧会"
        articles={sections.exhibitions}
        empty="今週開催の展示はない。"
      />
      <Section heading="今週の新店舗情報" articles={sections.newStores} empty="今週公開の新店舗情報はない。" />
      {sections.popups.length > 0 && (
        <Section heading="今週のPOP UP・期間限定イベント" articles={sections.popups} empty="" />
      )}

      {weekend.events.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>今週末のイベント</h2>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: ".875rem", lineHeight: 1.9 }}>
            {weekend.events.map((e) => (
              <li key={e.id}>
                <Link href={`/events/${e.id}`} style={{ color: "#c0483a" }}>
                  {e.title}
                </Link>
              </li>
            ))}
          </ul>
          <p style={{ fontSize: ".875rem", margin: ".5rem 0 0" }}>
            <Link href={weekend.path} style={{ color: "#c0483a" }}>
              {weekend.heading}をすべて見る
            </Link>
          </p>
        </section>
      )}

      {sections.others.length > 0 && (
        <Section heading="今週のその他のニュース" articles={sections.others} empty="" />
      )}

      <RelatedLinks current="/features/this-week" heading="関連ページ" />
    </div>
  )
}

export default Page
