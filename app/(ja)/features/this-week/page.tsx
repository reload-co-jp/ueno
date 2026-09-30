import type { Metadata } from "next"
import { Link } from "@/components/elements/link"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { compareArticles, compareEventsBySchedule, getEventsInRange, news } from "@/lib/data"
import { formatShortRange, thisWeekRange, toDateStr, todayStr } from "@/lib/date"
import { getEventFeature } from "@/lib/event-features"
import { getI18n, type Texts } from "@/lib/i18n"
import { eventListJsonLd, jsonLdString, pageMetadata } from "@/lib/seo"
import type { NewsArticle } from "@/lib/types"

const TITLES: Texts = {
  ja: "今週の上野｜イベント・展示・新店舗",
  en: "This Week in Ueno | Events, Exhibitions & New Shops",
  "zh-cn": "本周上野｜活动・展览・新店",
}

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

export const generateMetadata = async (): Promise<Metadata> => {
  const { locale, t } = await getI18n()
  const { start, end, sections } = getThisWeek()
  const range = formatShortRange(start, end, locale)
  const total = Object.values(sections).reduce((sum, s) => sum + s.length, 0)
  const { events, exhibitions, newStores } = {
    events: sections.events.length,
    exhibitions: sections.exhibitions.length,
    newStores: sections.newStores.length,
  }
  return pageMetadata({
    title: t(TITLES),
    description: t({
      ja: `今週(${range})の上野情報まとめ。上野で開催中のイベント${events}件・展示${exhibitions}件、新店舗${newStores}件、POP UPなどを毎週更新。`,
      en: `This week in Ueno (${range}): ${events} events, ${exhibitions} exhibitions, ${newStores} new shops, pop-ups and more, updated weekly.`,
      "zh-cn": `本周(${range})上野资讯汇总。每周更新上野正在举办的${events}场活动、${exhibitions}场展览、${newStores}家新店及快闪店等信息。`,
    }),
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

const Page: FC = async () => {
  const i18n = await getI18n()
  const { locale, t } = i18n
  const title = t(TITLES)
  const { start, end, events, sections } = getThisWeek()
  const weekend = getEventFeature("weekend", locale)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {events.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(eventListJsonLd(title, events, locale)) }}
        />
      )}
      <Breadcrumb
        items={[
          { label: t({ ja: "イベント", en: "Events", "zh-cn": "活动" }), href: "/events" },
          { label: t({ ja: "今週の上野", en: "This week in Ueno", "zh-cn": "本周上野" }) },
        ]}
      />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{title}</h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        {t({ ja: "対象期間", en: "Period", "zh-cn": "时间范围" })}: {formatShortRange(start, end, locale)}
        <br />
        {t({
          ja: "上野エリアで今週開催中のイベント・展示会、今週の新店舗やPOP UP情報をまとめている。毎週更新。",
          en: "Events and exhibitions happening in the Ueno area this week, plus this week's new shops and pop-ups. Updated weekly.",
          "zh-cn": "汇总本周在上野地区举办的活动・展览，以及本周新店和快闪店信息。每周更新。",
        })}
      </p>

      <InArticleAd />

      <Section
        heading={t({ ja: "今週開催のイベント", en: "Events this week", "zh-cn": "本周举办的活动" })}
        articles={sections.events}
        empty={t({ ja: "今週開催のイベントはない。", en: "No events this week.", "zh-cn": "本周没有活动。" })}
      />
      <Section
        heading={t({ ja: "今週開催の展示・展覧会", en: "Exhibitions this week", "zh-cn": "本周举办的展览" })}
        articles={sections.exhibitions}
        empty={t({ ja: "今週開催の展示はない。", en: "No exhibitions this week.", "zh-cn": "本周没有展览。" })}
      />
      <Section
        heading={t({ ja: "今週の新店舗情報", en: "New shops this week", "zh-cn": "本周新店资讯" })}
        articles={sections.newStores}
        empty={t({
          ja: "今週公開の新店舗情報はない。",
          en: "No new shops were posted this week.",
          "zh-cn": "本周没有新店资讯。",
        })}
      />
      {sections.popups.length > 0 && (
        <Section
          heading={t({ ja: "今週のPOP UP・期間限定イベント", en: "Pop-ups this week", "zh-cn": "本周快闪店・限时活动" })}
          articles={sections.popups}
          empty=""
        />
      )}

      {weekend.events.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>{t({ ja: "今週末のイベント", en: "This weekend", "zh-cn": "本周末活动" })}</h2>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: ".875rem", lineHeight: 1.9 }}>
            {weekend.events.map(i18n.article).map((e) => (
              <li key={e.id}>
                <Link href={`/events/${e.id}`} style={{ color: "#c0483a" }}>
                  {e.title}
                </Link>
              </li>
            ))}
          </ul>
          <p style={{ fontSize: ".875rem", margin: ".5rem 0 0" }}>
            <Link href={weekend.path} style={{ color: "#c0483a" }}>
              {t({
                ja: `${weekend.heading}をすべて見る`,
                en: `See all: ${weekend.heading}`,
                "zh-cn": `查看全部${weekend.heading}`,
              })}
            </Link>
          </p>
        </section>
      )}

      {sections.others.length > 0 && (
        <Section
          heading={t({ ja: "今週のその他のニュース", en: "Other news this week", "zh-cn": "本周其他新闻" })}
          articles={sections.others}
          empty=""
        />
      )}

      <RelatedLinks
        current="/features/this-week"
        heading={t({ ja: "関連ページ", en: "Related pages", "zh-cn": "相关页面" })}
      />
    </div>
  )
}

export default Page
