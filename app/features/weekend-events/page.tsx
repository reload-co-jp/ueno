import type { Metadata } from "next"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getEventsInRange } from "@/lib/data"
import { formatDateRangeJp, thisWeekendRange } from "@/lib/date"
import { absoluteUrl, jsonLdString, SITE_NAME } from "@/lib/seo"

const title = "今週末の上野イベント"
const description =
  "上野で今週末開催のイベントをまとめて紹介。上野公園・上野駅周辺の週末限定マルシェ・展示会・催し物情報を毎週更新。"

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/features/weekend-events" },
  openGraph: { type: "website", title, description, siteName: SITE_NAME },
  twitter: { card: "summary", title, description },
}

const Page: FC = () => {
  const { start, end } = thisWeekendRange()
  const events = getEventsInRange(start, end)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListElement: events.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Event",
        name: e.title,
        startDate: e.eventStartDate,
        endDate: e.eventEndDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: { "@type": "Place", name: e.eventLocation },
        url: absoluteUrl(`/events/${e.id}`),
      },
    })),
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "特集" }, { label: title }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>
        今週末({formatDateRangeJp(start, end)})の上野イベント
      </h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        上野エリアで今週末開催のイベントをまとめている。上野公園・上野駅・御徒町駅周辺の
        マルシェ、展示会、催し物などを毎週更新。週末のお出かけ先を探す際に活用できる。
      </p>

      {events.length === 0 ? (
        <p style={{ color: "#999" }}>今週末開催のイベントはない。</p>
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
