import type { Metadata } from "next"
import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "上野の閉店情報",
  description:
    "上野・御徒町エリアで閉店・営業終了した店舗の情報をまとめて紹介。",
  path: "/closures",
})

const Page: FC = () => (
  <ArticleListPage
    title="上野の閉店情報"
    breadcrumbItems={[{ label: "閉店" }]}
    path="/closures"
    articles={getArticlesByCategory("closing")}
  />
)

export default Page
