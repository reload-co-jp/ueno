import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"

export const metadata = {
  title: "新店舗",
  description: "上野エリアの新規オープン店舗情報一覧",
}

const Page: FC = () => (
  <ArticleListPage title="新店舗" articles={getArticlesByCategory("new_opening")} />
)

export default Page
