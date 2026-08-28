import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"

export const metadata = {
  title: "現在開催中のセール",
  description: "上野エリアで現在開催中のセール・キャンペーン情報",
}

const Page: FC = () => (
  <ArticleListPage
    title="現在開催中のセール"
    articles={getArticlesByCategory(["sale", "campaign"])}
    breadcrumbItems={[{ label: "特集" }, { label: "現在開催中のセール" }]}
  />
)

export default Page
