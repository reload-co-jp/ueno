import type { Metadata } from "next"
import Link from "next/link"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getUpcomingEvents } from "@/lib/data"
import { absoluteUrl, jsonLdString, SITE_NAME } from "@/lib/seo"

const title = "上野イベント一覧"
const description =
  "上野エリアの開催予定イベントを網羅した一覧。上野公園・上野駅・御徒町駅周辺のマルシェ・展示会・催し物などの上野イベント情報を随時更新。"

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/events" },
  openGraph: { type: "website", title, description, siteName: SITE_NAME },
  twitter: { card: "summary", title, description },
}

const Page: FC = () => {
  const events = getUpcomingEvents()

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
      <Breadcrumb items={[{ label: "イベント" }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>上野イベント一覧</h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        上野公園・上野駅・御徒町駅周辺で開催予定の上野イベントをまとめて紹介。マルシェ、展示会、催し物など最新情報を随時更新。
        <Link href="/features/today-events">今日開催の上野イベント</Link>や
        <Link href="/features/weekend-events">今週末の上野イベント</Link>もあわせて確認できる。
      </p>
      <CardGrid>
        {events.map((event) => (
          <ArticleCard key={event.id} article={event} />
        ))}
      </CardGrid>
    </div>
  )
}

export default Page
