import type { Metadata } from "next"
import Link from "next/link"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { getFutureEvents, getOngoingEvents, getPastEvents } from "@/lib/data"
import { todayStr } from "@/lib/date"
import { EVENT_FEATURE_KEYS, getEventFeature } from "@/lib/event-features"
import { eventListJsonLd, jsonLdString, pageMetadata } from "@/lib/seo"

const title = "上野のイベント情報"

export const generateMetadata = (): Metadata => {
  const today = todayStr()
  const count = getOngoingEvents(today).length + getFutureEvents(today).length
  return pageMetadata({
    title,
    description: `上野で開催中・開催予定のイベント${count}件を紹介。上野公園・東京国立博物館・東京都美術館など上野駅・御徒町周辺の展示会・マルシェ・催し物を開催日時・会場・料金つきで毎日更新。`,
    path: "/events",
  })
}

const sectionHeadingStyle = { fontSize: "1rem", margin: "0 0 .75rem" }

const Page: FC = () => {
  const today = todayStr()
  const ongoing = getOngoingEvents(today)
  const future = getFutureEvents(today)
  const past = getPastEvents(today)
  // 該当イベントがある特集のみ案内する(空ページへの誘導を避ける)
  const features = EVENT_FEATURE_KEYS.map(getEventFeature).filter((f) => f.events.length > 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {ongoing.length + future.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(eventListJsonLd(title, [...ongoing, ...future])) }}
        />
      )}
      <Breadcrumb items={[{ label: "イベント" }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{title}</h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        上野公園・上野駅・御徒町駅周辺で開催中・開催予定のイベントをまとめて紹介。展示会、マルシェ、催し物など最新情報を毎日更新。
        <Link href="/exhibitions">展示・展覧会</Link>や<Link href="/spots">施設ごとのイベント</Link>もあわせて確認できる。
      </p>

      {features.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>日付・条件から探す</h2>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: ".875rem", lineHeight: 1.9 }}>
            {features.map((f) => (
              <li key={f.key}>
                <Link href={f.path} style={{ color: "#c0483a" }}>
                  {f.heading}
                </Link>
                ({f.events.length}件)
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 style={sectionHeadingStyle}>開催中のイベント({ongoing.length}件)</h2>
        {ongoing.length === 0 ? (
          <p style={{ color: "#999" }}>現在開催中のイベントはない。</p>
        ) : (
          <CardGrid>
            {ongoing.map((e) => (
              <ArticleCard key={e.id} article={e} />
            ))}
          </CardGrid>
        )}
      </section>

      {future.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>今後開催のイベント({future.length}件)</h2>
          <CardGrid>
            {future.map((e) => (
              <ArticleCard key={e.id} article={e} />
            ))}
          </CardGrid>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>終了したイベント</h2>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: ".875rem", lineHeight: 1.9 }}>
            {past.map((e) => (
              <li key={e.id}>
                <Link href={`/events/${e.id}`} style={{ color: "#c0483a" }}>
                  {e.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <RelatedLinks current="/events" />
    </div>
  )
}

export default Page
