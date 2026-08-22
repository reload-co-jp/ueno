import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"
import { thisMonthRange } from "@/lib/date"

export const metadata = { title: "今月の新店舗 | 上野ナビ" }

const Page: FC = () => {
  const { start, end } = thisMonthRange()
  const articles = getArticlesByCategory("new_opening").filter((a) => {
    const d = a.publishedAt.slice(0, 10)
    return d >= start && d <= end
  })
  const month = `${start.slice(0, 4)}年${Number(start.slice(5, 7))}月`

  return <ArticleListPage title={`${month}の新店舗`} articles={articles} />
}

export default Page
