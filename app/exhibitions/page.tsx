import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"

export const metadata = { title: "展示・アート | 上野ナビ" }

const Page: FC = () => (
  <ArticleListPage title="展示・アート" articles={getArticlesByCategory("exhibition")} />
)

export default Page
