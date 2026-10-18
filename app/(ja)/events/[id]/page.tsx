import type { Metadata } from "next"
import { Link } from "@/components/elements/link"
import { notFound } from "next/navigation"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { ArticleBody } from "@/components/elements/article-body"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid, EVENT_STATUS_LABELS, EventStatusBadge } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { SpotEvents } from "@/components/elements/spot-events"
import { getArticleImageUrl, getEvent, getRelatedArticles, getArticleSpots, getStore, allArticles, getPrimaryArticle, getEventStatus } from "@/lib/data"
import { formatDate, formatDateRange, todayStr } from "@/lib/date"
import { EVENT_FEATURE_KEYS, getEventFeature } from "@/lib/event-features"
import { getI18n, isArticleTranslated, LOCALE_META } from "@/lib/i18n"
import {
  absoluteUrl,
  articleDescription,
  jsonLdString,
  localeAlternates,
  pageUrl,
  parseFeeYen,
  SITE_NAMES,
} from "@/lib/seo"
import { isEventArticle } from "@/lib/types"

export const generateStaticParams = () =>
  allArticles.filter(isEventArticle).map((e) => ({ id: e.id }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> => {
  const { id } = await params
  const original = getEvent(id)
  if (!original) return {}
  const i18n = await getI18n()
  const { locale } = i18n
  const event = i18n.article(original)
  // 重複記事は先行記事を正規URLとする
  const alternates = localeAlternates(locale, `/events/${(getPrimaryArticle(original) ?? original).id}`)
  const imageUrl = getArticleImageUrl(original)
  const description = articleDescription(original, locale)
  // 「イベント名｜開催日・会場」。会場は短い表記の場合のみ(長いtitleを避ける)
  const spots = getArticleSpots(original)
  const venueName =
    event.eventLocation && event.eventLocation.length <= 20
      ? event.eventLocation
      : spots.length === 1
        ? i18n.spot(spots[0]).name
        : undefined
  const title = `${event.title}｜${formatDateRange(event.eventStartDate, event.eventEndDate, locale)}${venueName ? `・${venueName}` : ""}`
  return {
    title,
    description,
    alternates,
    // 未翻訳の英語・簡体字版は日本語版と重複するため検索対象外
    robots: isArticleTranslated(original.id, locale) ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      url: alternates.canonical,
      title,
      description,
      siteName: SITE_NAMES[locale],
      locale: LOCALE_META[locale].og,
      images: imageUrl ? [imageUrl] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

const Page: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params
  const original = getEvent(id)
  if (!original) notFound()
  const i18n = await getI18n()
  const { locale, t, path } = i18n
  const event = i18n.article(original)

  const relatedStores = original.relatedStoreIds.map(getStore).filter(Boolean)
  const relatedSpots = getArticleSpots(original)
  const relatedArticles = getRelatedArticles(original)
  const image = i18n.image(original)
  const imageUrl = image?.url
  // 会場施設が1つに定まる場合のみ住所を表示・構造化データに含める
  const venue = relatedSpots.length === 1 ? i18n.spot(relatedSpots[0]) : undefined
  // 料金のパースは翻訳前の日本語表記で行う
  const price = parseFeeYen(original.eventFee)
  const url = pageUrl(path(`/events/${event.id}`))
  const status = getEventStatus(event, todayStr())
  // このイベントを掲載中の特集ページ(同じ時期・ジャンルのイベント一覧への導線)
  const features = EVENT_FEATURE_KEYS.map((key) => getEventFeature(key, locale)).filter((f) =>
    f.events.some((e) => e.id === original.id)
  )

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.eventStartDate,
    endDate: event.eventEndDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.eventLocation ?? venue?.name ?? event.area,
      // 住所はページ上に会場施設として表示している場合のみ
      ...(venue
        ? { address: { "@type": "PostalAddress", streetAddress: venue.address, addressCountry: "JP" } }
        : {}),
    },
    description: event.summary,
    image: imageUrl ? [absoluteUrl(imageUrl)] : undefined,
    organizer: event.eventOrganizer
      ? { "@type": "Organization", name: event.eventOrganizer, url: event.eventOfficialUrl }
      : undefined,
    // 料金表記から金額が読み取れる場合のみ(「一般 2,000円」→2000、「入場無料」→0)
    offers:
      price !== null
        ? { "@type": "Offer", price, priceCurrency: "JPY", url: event.eventOfficialUrl ?? url }
        : undefined,
    url,
    inLanguage: LOCALE_META[locale].hreflang,
  }

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "75rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: t({ ja: "イベント", en: "Events", "zh-cn": "活动" }), href: "/events" },
          // 会場施設が1つに定まる場合は施設ページを経由させる(イベント > 施設 > 個別イベント)
          ...(venue ? [{ label: venue.name, href: `/spots/${venue.id}` }] : []),
          { label: event.title },
        ]}
      />
      {imageUrl && (
        <img
          src={imageUrl}
          alt={image?.alt}
          className="detail-image"
        />
      )}
      <h1 style={{ fontSize: "1.25rem", margin: 0 }}>{event.title}</h1>
      <p
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          gap: ".5rem",
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--accent)",
          background: "var(--accent-soft)",
          borderRadius: "2px",
          padding: ".5rem .875rem",
          margin: 0,
        }}
      >
        <EventStatusBadge status={status} label={t(EVENT_STATUS_LABELS[status])} />
        <span style={{ fontSize: ".75rem", fontWeight: 800 }}>
          {t({ ja: "開催日時", en: "Dates", "zh-cn": "举办时间" })}
        </span>
        {formatDateRange(event.eventStartDate, event.eventEndDate, locale)}
      </p>
      <p style={{ fontSize: ".75rem", color: "var(--secondary)", margin: 0 }}>{event.area}</p>
      {status === "ended" && (
        <p role="note" style={{ fontSize: ".875rem", margin: 0, padding: ".5rem .875rem", background: "var(--green-soft)" }}>
          {t({
            ja: "このイベントは終了した。開催予定のイベントは",
            en: "This event has ended. See ",
            "zh-cn": "该活动已结束。正在举办及即将举办的活动请查看",
          })}
          <Link href="/events" style={{ color: "var(--accent)" }}>
            {t({ ja: "上野のイベント情報", en: "upcoming events in Ueno", "zh-cn": "上野活动资讯" })}
          </Link>
          {t({ ja: "を参照。", en: ".", "zh-cn": "。" })}
        </p>
      )}

      <InArticleAd />

      <ArticleBody body={event.body} />

      <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: ".875rem" }}>
        {event.eventLocation && (
          <li>
            {t({ ja: "開催場所", en: "Location", "zh-cn": "举办地点" })}: {event.eventLocation}
          </li>
        )}
        {venue && (
          <li>
            {t({ ja: "会場施設", en: "Venue", "zh-cn": "会场设施" })}:{" "}
            <Link href={`/spots/${venue.id}`} style={{ color: "var(--accent)" }}>
              {venue.name}
            </Link>
            ({t({ ja: "住所", en: "Address", "zh-cn": "地址" })}: {venue.address})
          </li>
        )}
        {event.eventFee && (
          <li>
            {t({ ja: "料金", en: "Admission", "zh-cn": "费用" })}: {event.eventFee}
          </li>
        )}
        {event.eventOrganizer && (
          <li>
            {t({ ja: "主催", en: "Organizer", "zh-cn": "主办方" })}: {event.eventOrganizer}
          </li>
        )}
        {event.eventOfficialUrl && (
          <li>
            {t({ ja: "公式サイト", en: "Official website", "zh-cn": "官方网站" })}:{" "}
            <a href={event.eventOfficialUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
              {event.eventOfficialUrl}
            </a>
          </li>
        )}
        <li>
          {t({ ja: "情報確認日", en: "Last checked", "zh-cn": "信息确认日" })}:{" "}
          {formatDate(original.updatedAt ?? original.publishedAt, locale)}
        </li>
      </ul>
      <p style={{ fontSize: ".75rem", color: "var(--secondary)", margin: 0 }}>
        {t({
          ja: "掲載内容は情報確認日時点のもの。日程変更・中止の可能性があるため、最新情報は公式サイトで確認のこと。",
          en: "Information is as of the date last checked. Schedules may change or events may be cancelled, so please check the official website for the latest details.",
          "zh-cn": "刊登内容以信息确认日为准。日程可能变更或取消，最新信息请以官方网站为准。",
        })}
      </p>

      {(relatedStores.length > 0 || relatedSpots.length > 0) && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
          <h2 style={{ fontSize: ".9375rem", marginBottom: ".5rem" }}>
            {t({ ja: "関連情報", en: "Related", "zh-cn": "相关信息" })}
          </h2>
          <ul style={{ listStyle: "none", padding: 0, fontSize: ".875rem" }}>
            {relatedStores.map(i18n.store).map((s) => (
              <li key={s.id}>
                <Link href={`/stores/${s.id}`} style={{ color: "var(--accent)" }}>
                  {t({ ja: "店舗", en: "Shop", "zh-cn": "店铺" })}: {s.name}
                </Link>
              </li>
            ))}
            {relatedSpots.map(i18n.spot).map((s) => (
              <li key={s.id}>
                <Link href={`/spots/${s.id}`} style={{ color: "var(--accent)" }}>
                  {t({ ja: "施設", en: "Place", "zh-cn": "设施" })}: {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
          <h2 style={{ fontSize: ".9375rem", marginBottom: ".75rem" }}>
            {t({ ja: "関連記事", en: "Related articles", "zh-cn": "相关文章" })}
          </h2>
          <CardGrid>
            {relatedArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        </div>
      )}

      <SpotEvents excludeId={original.id} spots={relatedSpots} />

      {features.length > 0 && (
        <nav
          aria-label={t({ ja: "このイベントを掲載中の特集", en: "Featured in", "zh-cn": "收录该活动的专题" })}
          style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}
        >
          <h2 style={{ fontSize: ".9375rem", marginBottom: ".5rem" }}>
            {t({ ja: "このイベントを掲載中の特集", en: "Featured in", "zh-cn": "收录该活动的专题" })}
          </h2>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: ".875rem", lineHeight: 1.9 }}>
            {features.map((f) => (
              <li key={f.key}>
                <Link href={f.path} style={{ color: "var(--accent)" }}>
                  {f.heading}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <RelatedLinks />

      <div style={{ fontSize: ".75rem", color: "var(--secondary)" }}>
        {t({ ja: "情報源", en: "Sources", "zh-cn": "信息来源" })}:{" "}
        {event.sources.map((url, i) => (
          <span key={url}>
            {i > 0 && t({ ja: "、", en: ", ", "zh-cn": "、" })}
            <a href={url} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
              {url}
            </a>
          </span>
        ))}
      </div>
    </article>
  )
}

export default Page
