import type { Metadata } from "next"
import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "上野のPOP UP・期間限定ショップ情報",
  description:
    "上野・御徒町エリアで開催中・開催予定のPOP UPストア、期間限定ショップの情報をまとめて紹介。上野マルイ・エキュート上野・松坂屋上野店などのPOP UPを随時更新。",
  path: "/popup",
})

const Page: FC = () => (
  <ArticleListPage
    title="上野のPOP UP・期間限定ショップ情報"
    breadcrumbItems={[{ label: "POP UP" }]}
    path="/popup"
    articles={getArticlesByCategory("popup")}
  />
)

export default Page
