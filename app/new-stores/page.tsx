import type { Metadata } from "next"
import Link from "next/link"
import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { MonthArchiveNav } from "@/components/elements/month-archive-page"
import { getNewStoreArchives } from "@/lib/archives"
import { getArticlesByCategory } from "@/lib/data"
import { pageMetadata } from "@/lib/seo"

const title = "上野の新店舗・新規オープン情報"

export const generateMetadata = (): Metadata =>
  pageMetadata({
    title,
    description: `上野・御徒町エリアの新店舗・新規オープン情報${getArticlesByCategory("new_opening").length}件を紹介。上野駅周辺のグルメ・カフェ・ショップの新店をオープン日・場所つきで毎日更新。`,
    path: "/new-stores",
  })

const Page: FC = () => (
  <ArticleListPage
    title={title}
    articles={getArticlesByCategory("new_opening")}
    breadcrumbItems={[{ label: "新店舗" }]}
    path="/new-stores"
    footer={
      <MonthArchiveNav
        archives={getNewStoreArchives()}
        basePath="/new-stores"
        currentPath="/features/monthly-openings"
        heading="月別の上野新店舗"
      />
    }
    lead={
      <>
        上野駅・御徒町駅・上野公園周辺で新しくオープンした店舗・オープン予定の新店をまとめて紹介。
        <Link href="/features/monthly-openings">今月オープンの新店舗</Link>や
        <Link href="/features/gourmet-new-stores">グルメ・カフェの新店</Link>もあわせて確認できる。
      </>
    }
  />
)

export default Page
