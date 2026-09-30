import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FC } from "react"
import { MonthArchivePage } from "@/components/elements/month-archive-page"
import { archiveLabel, findArchive, getNewStoreArchives, type MonthArchive } from "@/lib/archives"
import { getI18n, type Locale, type Texts } from "@/lib/i18n"
import { localeAlternates, pageMetadata } from "@/lib/seo"

// 新店舗月別アーカイブ /new-stores/2026/09/
type Params = Promise<{ year: string; month: string }>

const textsOf = (archive: MonthArchive, locale: Locale): Texts<{ heading: string; description: string; lead: string }> => {
  const label = archiveLabel(archive, locale)
  const n = archive.articles.length
  return {
    ja: {
      heading: `${label}の上野新店舗・新規オープン一覧`,
      description: `${label}に上野・御徒町エリアで掲載した新店舗・新規オープン情報${n}件のアーカイブ。グルメ・カフェ・ショップの新店を場所つきで掲載。`,
      lead: `${label}に掲載した上野・御徒町エリアの新店舗・新規オープン情報の一覧。`,
    },
    en: {
      heading: `New Shops & Openings in Ueno: ${label}`,
      description: `Archive of ${n} new shops and openings in the Ueno and Okachimachi area published in ${label}, including restaurants, cafés and stores with locations.`,
      lead: `New shops and openings in the Ueno and Okachimachi area published in ${label}.`,
    },
    "zh-cn": {
      heading: `${label}上野新店・开业列表`,
      description: `${label}刊登的上野・御徒町地区${n}家新店・开业资讯存档，包含美食、咖啡、商店的新店及地点。`,
      lead: `${label}刊登的上野・御徒町地区新店・开业资讯列表。`,
    },
  }
}

export const generateStaticParams = () =>
  getNewStoreArchives().map((a) => ({ year: a.year, month: a.month }))

export const generateMetadata = async ({ params }: { params: Params }): Promise<Metadata> => {
  const { year, month } = await params
  const archive = findArchive(getNewStoreArchives(), year, month)
  if (!archive) return {}
  const { locale, t } = await getI18n()
  const texts = t(textsOf(archive, locale))
  const metadata = await pageMetadata({
    title: texts.heading,
    description: texts.description,
    path: `/new-stores/${year}/${month}`,
  })
  // 当月分は「今月の新店舗」と同内容のため、そちらを正規URLとする
  return archive.isCurrent
    ? { ...metadata, alternates: localeAlternates(locale, "/features/monthly-openings") }
    : metadata
}

const Page: FC<{ params: Params }> = async ({ params }) => {
  const { year, month } = await params
  const archives = getNewStoreArchives()
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
        { label: t({ ja: "新店舗", en: "New Shops", "zh-cn": "新店" }), href: "/new-stores" },
        { label: archiveLabel(archive, locale) },
      ]}
      basePath="/new-stores"
      currentPath="/features/monthly-openings"
      navHeading={t({ ja: "月別の上野新店舗", en: "New shops by month", "zh-cn": "按月份查看上野新店" })}
    />
  )
}

export default Page
