import { FC } from "react"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { NewsArticle } from "@/lib/types"

export const ArticleListPage: FC<{ title: string; articles: NewsArticle[] }> = ({
  title,
  articles,
}) => (
  <div>
    <h2
      style={{
        fontSize: "1.125rem",
        paddingBottom: ".5rem",
        marginBottom: "1.25rem",
        borderBottom: "0.1875rem solid #111",
      }}
    >
      {title}
    </h2>
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
