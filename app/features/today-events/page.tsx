import type { Metadata } from "next"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getEventsOnDate } from "@/lib/data"
import { formatDateJp, todayStr } from "@/lib/date"
import { absoluteUrl, jsonLdString, SITE_NAME } from "@/lib/seo"

const title = "【今日開催】上野のイベント一覧"
const description =
  "上野で今日開催中のイベントを毎日更新。上野公園・上野駅周辺のマルシェ・展示会・催し物など、本日開催のイベント情報をまとめて紹介。"

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/features/today-events" },
  openGraph: { type: "website", title, description, siteName: SITE_NAME },
  twitter: { card: "summary", title, description },
}

const Page: FC = () => {
  const today = todayStr()
  const events = getEventsOnDate(today)

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
      <Breadcrumb items={[{ label: "特集" }, { label: "今日の上野イベント" }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>今日({formatDateJp(today)})の上野イベント</h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        上野エリアで本日開催中のイベントをまとめている。上野公園・上野駅・御徒町駅周辺のマルシェ、
        展示会、催し物などを毎日自動更新。当日開催のイベントを探す際に活用できる。
      </p>

      {events.length === 0 ? (
        <p style={{ color: "#999" }}>本日開催中のイベントはない。</p>
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
