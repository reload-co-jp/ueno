import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"

export const metadata = {
  title: "POP UP",
  description: "上野エリアのPOP UP・期間限定店情報一覧",
}

const Page: FC = () => (
  <ArticleListPage title="POP UP" articles={getArticlesByCategory("popup")} />
)

export default Page
