import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"

export const metadata = { title: "POP UP | 上野ナビ" }

const Page: FC = () => (
  <ArticleListPage title="POP UP" articles={getArticlesByCategory("popup")} />
)

export default Page
