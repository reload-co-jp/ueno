import { FC } from "react"
import { Breadcrumb, BreadcrumbItem } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { NewsArticle } from "@/lib/types"

export const ArticleListPage: FC<{
  title: string
  articles: NewsArticle[]
  breadcrumbItems?: BreadcrumbItem[]
}> = ({ title, articles, breadcrumbItems = [{ label: title }] }) => (
  <div>
    <Breadcrumb items={breadcrumbItems} />
    <h1
      style={{
        fontSize: "1.125rem",
        paddingBottom: ".5rem",
        marginBottom: "1.25rem",
        borderBottom: "0.1875rem solid #111",
      }}
    >
      {title}
    </h1>
    {articles.length === 0 ? (
      <p style={{ color: "#a39c8c" }}>該当する記事はまだない。</p>
    ) : (
      <CardGrid>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </CardGrid>
    )}
  </div>
)
