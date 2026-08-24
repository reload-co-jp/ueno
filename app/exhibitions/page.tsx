import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"

export const metadata = {
  title: "展示・アート",
  description: "上野エリアの展示会・アート情報一覧",
}

const Page: FC = () => (
  <ArticleListPage title="展示・アート" articles={getArticlesByCategory("exhibition")} />
)

export default Page
