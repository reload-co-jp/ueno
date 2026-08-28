import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"
import { thisMonthRange } from "@/lib/date"

export const metadata = {
  title: "今月の新店舗",
  description: "今月オープンした上野エリアの新店舗情報",
}

const Page: FC = () => {
  const { start, end } = thisMonthRange()
  const articles = getArticlesByCategory("new_opening").filter((a) => {
    const d = a.publishedAt.slice(0, 10)
    return d >= start && d <= end
  })
  const month = `${start.slice(0, 4)}年${Number(start.slice(5, 7))}月`
  const title = `${month}の新店舗`

  return (
    <ArticleListPage
      title={title}
      articles={articles}
      breadcrumbItems={[{ label: "特集" }, { label: title }]}
    />
  )
}

export default Page
