import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FC } from "react"
import { MonthArchivePage } from "@/components/elements/month-archive-page"
import { archiveLabel, findArchive, getEventArchives, type MonthArchive } from "@/lib/archives"
import { getI18n, type Locale, type Texts } from "@/lib/i18n"
import { localeAlternates, pageMetadata } from "@/lib/seo"

// イベント月別アーカイブ /events/2026/09/。
// /events/[id] と同階層のため、動的セグメント名は [id] を共有し年として扱う
type Params = Promise<{ id: string; month: string }>

const textsOf = (archive: MonthArchive, locale: Locale): Texts<{ heading: string; description: string; lead: string }> => {
  const label = archiveLabel(archive, locale)
  const n = archive.articles.length
  return {
    ja: {
      heading: `${label}の上野イベント・展示会一覧`,
      description: `${label}に上野で開催のイベント・展示会${n}件の一覧。上野公園・美術館・博物館の展覧会や催し物を開催日時・会場つきで掲載。`,
      lead: `${label}に上野エリアで開催(予定を含む)のイベント・展示会の一覧。会期が月をまたぐ展覧会も含めて掲載している。`,
    },
    en: {
      heading: `Ueno Events & Exhibitions in ${label}`,
      description: `${n} events and exhibitions held in Ueno in ${label}, including shows at Ueno Park and its museums, with dates and venues.`,
      lead: `Events and exhibitions held (or scheduled) in the Ueno area in ${label}, including exhibitions spanning multiple months.`,
    },
    "zh-cn": {
      heading: `${label}上野活动・展览列表`,
      description: `${label}在上野举办的${n}场活动・展览列表。刊登上野公园、美术馆、博物馆的展览及活动，附举办时间及会场。`,
      lead: `${label}在上野地区举办(含预定)的活动・展览列表，包含跨月举办的展览。`,
    },
  }
}

export const generateStaticParams = () =>
  getEventArchives().map((a) => ({ id: a.year, month: a.month }))

export const generateMetadata = async ({ params }: { params: Params }): Promise<Metadata> => {
  const { id: year, month } = await params
  const archive = findArchive(getEventArchives(), year, month)
  if (!archive) return {}
  const { locale, t } = await getI18n()
  const texts = t(textsOf(archive, locale))
  const metadata = await pageMetadata({
    title: texts.heading,
    description: texts.description,
    path: `/events/${year}/${month}`,
  })
  // 当月分は「今月の上野イベント」と同内容のため、そちらを正規URLとする
  return archive.isCurrent
    ? { ...metadata, alternates: localeAlternates(locale, "/features/month-events") }
    : metadata
}

const Page: FC<{ params: Params }> = async ({ params }) => {
  const { id: year, month } = await params
  const archives = getEventArchives()
  const archive = findArchive(archives, year, month)
  if (!archive) notFound()
  const { locale, t } = await getI18n()
  const texts = t(textsOf(archive, locale))

  return (
    <MonthArchivePage
      archive={archive}
      archives={archives}
      heading={texts.heading}
      lead={texts.lead}
      breadcrumbItems={[
        { label: t({ ja: "イベント", en: "Events", "zh-cn": "活动" }), href: "/events" },
        { label: archiveLabel(archive, locale) },
      ]}
      basePath="/events"
      currentPath="/features/month-events"
      navHeading={t({ ja: "月別の上野イベント", en: "Ueno events by month", "zh-cn": "按月份查看上野活动" })}
    />
  )
}

export default Page
