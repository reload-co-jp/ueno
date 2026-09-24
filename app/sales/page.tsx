import type { Metadata } from "next"
import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "上野のセール・キャンペーン情報",
  description:
    "上野・御徒町エリアの商業施設・店舗で開催中のセール、キャンペーン情報をまとめて紹介。上野マルイ・松坂屋上野店・エキュート上野などのお得な情報を随時更新。",
  path: "/sales",
})

const Page: FC = () => (
  <ArticleListPage
    title="上野のセール・キャンペーン情報"
    breadcrumbItems={[{ label: "セール" }]}
    path="/sales"
    articles={getArticlesByCategory(["sale", "campaign"])}
  />
)

export default Page
