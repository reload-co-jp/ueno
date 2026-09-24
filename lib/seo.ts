import type { Metadata } from "next"
import type { NewsArticle } from "@/lib/types"

export const SITE_URL = "https://ueno.reload.co.jp"
export const SITE_NAME = "上野ライブ"

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`

// JSON-LDを<script>に埋め込む際、</script>による早期終了・タグインジェクションを防ぐ
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c")

// ページURL(trailingSlash: true 構成に合わせ末尾スラッシュ付き)。canonical・sitemapで共通利用
export const pageUrl = (path: string) =>
  path === "/" ? `${SITE_URL}/` : `${absoluteUrl(path).replace(/\/$/, "")}/`

// 一覧・特集ページ共通のmetadata。コンテンツが空の日付ページ等は noindex で検索対象外にする
export const pageMetadata = ({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string
  description: string
  path: string
  noindex?: boolean
}): Metadata => ({
  title,
  description,
  alternates: { canonical: pageUrl(path) },
  robots: noindex ? { index: false, follow: true } : undefined,
  openGraph: { type: "website", url: pageUrl(path), title, description, siteName: SITE_NAME },
  twitter: { card: "summary", title, description },
})

// 一覧ページ用Event構造化データ。ページ上に表示している項目のみ含める
export const eventListJsonLd = (
  name: string,
  events: (NewsArticle & { eventStartDate: string; eventEndDate: string })[]
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  itemListElement: events.map((e, i) => ({
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
      url: pageUrl(`/events/${e.id}`),
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
