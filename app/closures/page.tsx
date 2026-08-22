import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"

export const metadata = { title: "閉店 | 上野ナビ" }

const Page: FC = () => (
  <ArticleListPage title="閉店" articles={getArticlesByCategory("closing")} />
)

export default Page
