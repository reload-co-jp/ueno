import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"

export const metadata = {
  title: "セール",
  description: "上野エリアのセール・キャンペーン情報一覧",
}

const Page: FC = () => (
  <ArticleListPage
    title="セール"
    articles={getArticlesByCategory(["sale", "campaign"])}
  />
)

export default Page
