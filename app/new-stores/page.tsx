import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"

export const metadata = { title: "新店舗 | 上野ナビ" }

const Page: FC = () => (
  <ArticleListPage title="新店舗" articles={getArticlesByCategory("new_opening")} />
)

export default Page
