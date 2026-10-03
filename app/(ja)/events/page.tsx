import type { Metadata } from "next"
import { Link } from "@/components/elements/link"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { MonthArchiveNav } from "@/components/elements/month-archive-page"
import { RelatedLinks } from "@/components/elements/related-links"
import { getEventArchives } from "@/lib/archives"
import { getFutureEvents, getOngoingEvents, getPastEvents } from "@/lib/data"
import { todayStr } from "@/lib/date"
import { EVENT_FEATURE_KEYS, getEventFeature } from "@/lib/event-features"
import { getI18n, type Texts } from "@/lib/i18n"
import { eventListJsonLd, jsonLdString, pageMetadata } from "@/lib/seo"

const TITLES: Texts = { ja: "上野のイベント情報", en: "Events in Ueno", "zh-cn": "上野活动资讯" }

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n()
  const today = todayStr()
  const count = getOngoingEvents(today).length + getFutureEvents(today).length
  return pageMetadata({
    title: t(TITLES),
    description: t({
      ja: `上野で開催中・開催予定のイベント${count}件を紹介。上野公園・東京国立博物館・東京都美術館など上野駅・御徒町周辺の展示会・マルシェ・催し物を開催日時・会場・料金つきで毎日更新。`,
      en: `${count} current and upcoming events in Ueno. Exhibitions, markets and events around Ueno Park, the Tokyo National Museum, the Tokyo Metropolitan Art Museum, Ueno Station and Okachimachi, with dates, venues and admission, updated daily.`,
      "zh-cn": `介绍上野正在举办及即将举办的${count}场活动。每日更新上野公园、东京国立博物馆、东京都美术馆等上野站・御徒町周边的展览、市集及各类活动，附举办时间、会场及费用。`,
    }),
    path: "/events",
  })
}

const sectionHeadingStyle = { fontSize: "1rem", margin: "0 0 .75rem" }

const Page: FC = async () => {
  const i18n = await getI18n()
  const { locale, t } = i18n
  const title = t(TITLES)
  const today = todayStr()
  const ongoing = getOngoingEvents(today)
  const future = getFutureEvents(today)
  const past = getPastEvents(today)
  // 該当イベントがある特集のみ案内する(空ページへの誘導を避ける)
  const features = EVENT_FEATURE_KEYS.map((key) => getEventFeature(key, locale)).filter((f) => f.events.length > 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {ongoing.length + future.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(eventListJsonLd(title, [...ongoing, ...future], locale)) }}
        />
      )}
      <Breadcrumb items={[{ label: t({ ja: "イベント", en: "Events", "zh-cn": "活动" }) }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{title}</h1>
      <p style={{ fontSize: ".875rem", color: "var(--secondary)", margin: 0, lineHeight: 1.7 }}>
        {t({
          ja: (
            <>
              上野公園・上野駅・御徒町駅周辺で開催中・開催予定のイベントをまとめて紹介。展示会、マルシェ、催し物など最新情報を毎日更新。
              <Link href="/exhibitions">展示・展覧会</Link>や<Link href="/spots">施設ごとのイベント</Link>もあわせて確認できる。
            </>
          ),
          en: (
            <>
              Current and upcoming events around Ueno Park, Ueno Station and Okachimachi Station — exhibitions, markets and more, updated daily. See also{" "}
              <Link href="/exhibitions">exhibitions</Link> and <Link href="/spots">events by venue</Link>.
            </>
          ),
          "zh-cn": (
            <>
              汇总上野公园、上野站、御徒町站周边正在举办及即将举办的活动，每日更新展览、市集等最新资讯。也可查看
              <Link href="/exhibitions">展览</Link>和<Link href="/spots">各设施的活动</Link>。
            </>
          ),
        })}
      </p>

      {features.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>
            {t({ ja: "日付・条件から探す", en: "Browse by date", "zh-cn": "按日期・条件查找" })}
          </h2>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: ".875rem", lineHeight: 1.9 }}>
            {features.map((f) => (
              <li key={f.key}>
                <Link href={f.path} style={{ color: "var(--accent)" }}>
                  {f.heading}
                </Link>
                {t({ ja: `(${f.events.length}件)`, en: ` (${f.events.length})`, "zh-cn": `(${f.events.length}场)` })}
              </li>
            ))}
          </ul>
        </section>
      )}

      <InArticleAd />
      <section>
        <h2 style={sectionHeadingStyle}>
          {t({
            ja: `開催中のイベント(${ongoing.length}件)`,
            en: `Happening now (${ongoing.length})`,
            "zh-cn": `正在举办的活动(${ongoing.length}场)`,
          })}
        </h2>
        {ongoing.length === 0 ? (
          <p style={{ color: "#999" }}>
            {t({ ja: "現在開催中のイベントはない。", en: "No events are happening right now.", "zh-cn": "目前没有正在举办的活动。" })}
          </p>
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
          <h2 style={sectionHeadingStyle}>
            {t({
              ja: `今後開催のイベント(${future.length}件)`,
              en: `Upcoming events (${future.length})`,
              "zh-cn": `即将举办的活动(${future.length}场)`,
            })}
          </h2>
          <CardGrid>
            {future.map((e) => (
              <ArticleCard key={e.id} article={e} />
            ))}
          </CardGrid>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>{t({ ja: "終了したイベント", en: "Past events", "zh-cn": "已结束的活动" })}</h2>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: ".875rem", lineHeight: 1.9 }}>
            {past.map(i18n.article).map((e) => (
              <li key={e.id}>
                <Link href={`/events/${e.id}`} style={{ color: "var(--accent)" }}>
                  {e.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <MonthArchiveNav
        archives={getEventArchives()}
        basePath="/events"
        currentPath="/features/month-events"
        heading={t({ ja: "月別の上野イベント", en: "Ueno events by month", "zh-cn": "按月份查看上野活动" })}
      />

      <RelatedLinks current="/events" />
    </div>
  )
}

export default Page
