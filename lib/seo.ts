import type { Metadata } from "next"
import { formatDateRange } from "@/lib/date"
import {
  getLocale,
  LOCALE_META,
  LOCALES,
  localePath,
  localizeArticle,
  type Locale,
  type Texts,
} from "@/lib/i18n"
import { isEventArticle, type NewsArticle } from "@/lib/types"

export const SITE_URL = "https://ueno.reload.co.jp"
export const SITE_NAME = "上野ライブ"
export const SITE_NAMES: Texts = {
  ja: SITE_NAME,
  en: "Ueno Live",
  "zh-cn": "上野Live",
}

export const absoluteUrl = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`

// JSON-LDを<script>に埋め込む際、</script>による早期終了・タグインジェクションを防ぐ
export const jsonLdString = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c")

// ページURL(trailingSlash: true 構成に合わせ末尾スラッシュ付き)。canonical・sitemapで共通利用
export const pageUrl = (path: string) =>
  path === "/" ? `${SITE_URL}/` : `${absoluteUrl(path).replace(/\/$/, "")}/`

// 言語別の正規URLとhreflang。pathは日本語版(プレフィックスなし)のパス
export const localeAlternates = (locale: Locale, path: string) => ({
  canonical: pageUrl(localePath(locale, path)),
  languages: {
    ...Object.fromEntries(
      LOCALES.map((l) => [
        LOCALE_META[l].hreflang,
        pageUrl(localePath(l, path)),
      ])
    ),
    "x-default": pageUrl(path),
  },
})

// 一覧・特集ページ共通のmetadata。コンテンツが空の日付ページ等は noindex で検索対象外にする
export const pageMetadata = async ({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string
  description: string
  path: string
  noindex?: boolean
}): Promise<Metadata> => {
  const locale = await getLocale()
  const alternates = localeAlternates(locale, path)
  return {
    title,
    description,
    alternates,
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      url: alternates.canonical,
      title,
      description,
      siteName: SITE_NAMES[locale],
      locale: LOCALE_META[locale].og,
    },
    twitter: { card: "summary", title, description },
  }
}

// 一覧ページ用Event構造化データ。ページ上に表示している項目のみ含める
export const eventListJsonLd = (
  name: string,
  events: (NewsArticle & { eventStartDate: string; eventEndDate: string })[],
  locale: Locale
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  itemListElement: events
    .map((event) => localizeArticle(event, locale))
    .map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Event",
        name: e.title,
        description: e.summary,
        startDate: e.eventStartDate,
        endDate: e.eventEndDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: { "@type": "Place", name: e.eventLocation ?? e.area },
        url: pageUrl(localePath(locale, `/events/${e.id}`)),
      },
    })),
})

// 料金表記→金額(円)。無料は0、金額が読み取れない表記(「入園料のみ」「不明」等)はnull
export const parseFeeYen = (fee?: string): number | null => {
  if (!fee) return null
  if (fee.includes("無料")) return 0
  const match = fee.match(/([\d,]+)円/)
  return match ? Number(match[1].replace(/,/g, "")) : null
}

// 記事ページのmeta description。summaryが短く記事間で重複しやすいため、
// イベントは開催日時・会場・料金(ページ上に表示している情報)を補って固有にする
const DESCRIPTION_LABELS: Texts<{
  date: string
  venue: string
  fee: string
  sep: string
  end: string
}> = {
  ja: { date: "開催日時", venue: "会場", fee: "料金", sep: "。", end: "。" },
  en: { date: "Dates", venue: "Venue", fee: "Admission", sep: ". ", end: "." },
  "zh-cn": {
    date: "举办时间",
    venue: "会场",
    fee: "费用",
    sep: "。",
    end: "。",
  },
}

export const articleDescription = (article: NewsArticle, locale: Locale) => {
  const a = localizeArticle(article, locale)
  if (!isEventArticle(a)) return a.summary
  const l = DESCRIPTION_LABELS[locale]
  const details = [
    `${l.date}: ${formatDateRange(a.eventStartDate, a.eventEndDate, locale)}`,
    a.eventLocation && `${l.venue}: ${a.eventLocation}`,
    // 「不明」判定は翻訳前の日本語表記で行う
    article.eventFee &&
      article.eventFee !== "不明" &&
      `${l.fee}: ${a.eventFee}`,
  ].filter(Boolean)
  return `${a.summary} ${details.join(l.sep)}${l.end}`
}
