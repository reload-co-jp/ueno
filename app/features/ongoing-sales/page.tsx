import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"

export const metadata = { title: "現在開催中のセール | 上野ナビ" }

const Page: FC = () => (
  <ArticleListPage
    title="現在開催中のセール"
    articles={getArticlesByCategory(["sale", "campaign"])}
  />
)

export default Page
