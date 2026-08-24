import { FC } from "react"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { NewsArticle } from "@/lib/types"

export const ArticleListPage: FC<{ title: string; articles: NewsArticle[] }> = ({
  title,
  articles,
}) => (
  <div>
    <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>{title}</h2>
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
