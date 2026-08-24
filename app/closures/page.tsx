import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"

export const metadata = {
  title: "閉店情報",
  description: "上野エリアの閉店情報一覧",
}

const Page: FC = () => (
  <ArticleListPage title="閉店" articles={getArticlesByCategory("closing")} />
)

export default Page
