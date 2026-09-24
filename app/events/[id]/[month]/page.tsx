import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FC } from "react"
import { MonthArchivePage } from "@/components/elements/month-archive-page"
import { findArchive, getEventArchives } from "@/lib/archives"
import { pageMetadata } from "@/lib/seo"

// イベント月別アーカイブ /events/2026/09/。
// /events/[id] と同階層のため、動的セグメント名は [id] を共有し年として扱う
type Params = Promise<{ id: string; month: string }>

export const generateStaticParams = () =>
  getEventArchives().map((a) => ({ id: a.year, month: a.month }))

export const generateMetadata = async ({ params }: { params: Params }): Promise<Metadata> => {
  const { id: year, month } = await params
  const archive = findArchive(getEventArchives(), year, month)
  if (!archive) return {}
  const metadata = pageMetadata({
    title: `${archive.label}の上野イベント・展示会一覧`,
    description: `${archive.label}に上野で開催のイベント・展示会${archive.articles.length}件の一覧。上野公園・美術館・博物館の展覧会や催し物を開催日時・会場つきで掲載。`,
    path: `/events/${year}/${month}`,
  })
  // 当月分は「今月の上野イベント」と同内容のため、そちらを正規URLとする
  return archive.isCurrent
    ? { ...metadata, alternates: { canonical: "/features/month-events" } }
    : metadata
}

const Page: FC<{ params: Params }> = async ({ params }) => {
  const { id: year, month } = await params
  const archives = getEventArchives()
  const archive = findArchive(archives, year, month)
  if (!archive) notFound()

  return (
    <MonthArchivePage
      archive={archive}
      archives={archives}
      heading={`${archive.label}の上野イベント・展示会一覧`}
      lead={`${archive.label}に上野エリアで開催(予定を含む)のイベント・展示会の一覧。会期が月をまたぐ展覧会も含めて掲載している。`}
      breadcrumbItems={[{ label: "イベント", href: "/events" }, { label: archive.label }]}
      basePath="/events"
      currentPath="/features/month-events"
      navHeading="月別の上野イベント"
    />
  )
}

export default Page
