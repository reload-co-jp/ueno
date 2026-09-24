import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FC } from "react"
import { MonthArchivePage } from "@/components/elements/month-archive-page"
import { findArchive, getNewStoreArchives } from "@/lib/archives"
import { pageMetadata } from "@/lib/seo"

// 新店舗月別アーカイブ /new-stores/2026/09/
type Params = Promise<{ year: string; month: string }>

export const generateStaticParams = () =>
  getNewStoreArchives().map((a) => ({ year: a.year, month: a.month }))

export const generateMetadata = async ({ params }: { params: Params }): Promise<Metadata> => {
  const { year, month } = await params
  const archive = findArchive(getNewStoreArchives(), year, month)
  if (!archive) return {}
  const metadata = pageMetadata({
    title: `${archive.label}の上野新店舗・新規オープン一覧`,
    description: `${archive.label}に上野・御徒町エリアで掲載した新店舗・新規オープン情報${archive.articles.length}件のアーカイブ。グルメ・カフェ・ショップの新店を場所つきで掲載。`,
    path: `/new-stores/${year}/${month}`,
  })
  // 当月分は「今月の新店舗」と同内容のため、そちらを正規URLとする
  return archive.isCurrent
    ? { ...metadata, alternates: { canonical: "/features/monthly-openings" } }
    : metadata
}

const Page: FC<{ params: Params }> = async ({ params }) => {
  const { year, month } = await params
  const archives = getNewStoreArchives()
  const archive = findArchive(archives, year, month)
  if (!archive) notFound()

  return (
    <MonthArchivePage
      archive={archive}
      archives={archives}
      heading={`${archive.label}の上野新店舗・新規オープン一覧`}
      lead={`${archive.label}に掲載した上野・御徒町エリアの新店舗・新規オープン情報の一覧。`}
      breadcrumbItems={[{ label: "新店舗", href: "/new-stores" }, { label: archive.label }]}
      basePath="/new-stores"
      currentPath="/features/monthly-openings"
      navHeading="月別の上野新店舗"
    />
  )
}

export default Page
