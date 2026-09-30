import type { Metadata } from "next"
import { Link } from "@/components/elements/link"
import { notFound } from "next/navigation"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { ArticleBody } from "@/components/elements/article-body"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { SpotEvents } from "@/components/elements/spot-events"
import { getArticleImageUrl, getEvent, getRelatedArticles, getArticleSpots, getStore, allArticles, getPrimaryArticle } from "@/lib/data"
import { formatDateRange } from "@/lib/date"
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
  return {
    title: event.title,
    description,
    alternates,
    // 未翻訳の英語・簡体字版は日本語版と重複するため検索対象外
    robots: isArticleTranslated(original.id, locale) ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      url: alternates.canonical,
      title: event.title,
      description,
      siteName: SITE_NAMES[locale],
      locale: LOCALE_META[locale].og,
      images: imageUrl ? [imageUrl] : undefined,
    },
    twitter: {
      card: "summary",
      title: event.title,
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
          style={{ width: "100%", borderRadius: ".75rem", objectFit: "cover" }}
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
          color: "#c0483a",
          background: "#f7e6e1",
          borderRadius: ".5rem",
          padding: ".5rem .875rem",
          margin: 0,
        }}
      >
        <span style={{ fontSize: ".75rem", fontWeight: 800 }}>
          {t({ ja: "開催日時", en: "Dates", "zh-cn": "举办时间" })}
        </span>
        {formatDateRange(event.eventStartDate, event.eventEndDate, locale)}
      </p>
      <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>{event.area}</p>

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
            <Link href={`/spots/${venue.id}`} style={{ color: "#c0483a" }}>
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
            <a href={event.eventOfficialUrl} target="_blank" rel="noreferrer" style={{ color: "#c0483a" }}>
              {event.eventOfficialUrl}
            </a>
          </li>
        )}
      </ul>

      {(relatedStores.length > 0 || relatedSpots.length > 0) && (
        <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}>
          <h2 style={{ fontSize: ".9375rem", marginBottom: ".5rem" }}>
            {t({ ja: "関連情報", en: "Related", "zh-cn": "相关信息" })}
          </h2>
          <ul style={{ listStyle: "none", padding: 0, fontSize: ".875rem" }}>
            {relatedStores.map(i18n.store).map((s) => (
              <li key={s.id}>
                <Link href={`/stores/${s.id}`} style={{ color: "#c0483a" }}>
                  {t({ ja: "店舗", en: "Shop", "zh-cn": "店铺" })}: {s.name}
                </Link>
              </li>
            ))}
            {relatedSpots.map(i18n.spot).map((s) => (
              <li key={s.id}>
                <Link href={`/spots/${s.id}`} style={{ color: "#c0483a" }}>
                  {t({ ja: "施設", en: "Place", "zh-cn": "设施" })}: {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}>
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

      <SpotEvents article={original} spots={relatedSpots} />

      <RelatedLinks />

      <div style={{ fontSize: ".75rem", color: "#a39c8c" }}>
        {t({ ja: "情報源", en: "Sources", "zh-cn": "信息来源" })}:{" "}
        {event.sources.map((url, i) => (
          <span key={url}>
            {i > 0 && t({ ja: "、", en: ", ", "zh-cn": "、" })}
            <a href={url} target="_blank" rel="noreferrer" style={{ color: "#c0483a" }}>
              {url}
            </a>
          </span>
        ))}
      </div>
    </article>
  )
}

export default Page
