import { FC, ReactNode } from "react"
import { Breadcrumb, BreadcrumbItem } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { NewsArticle } from "@/lib/types"

export const ArticleListPage: FC<{
  title: string
  articles: NewsArticle[]
  breadcrumbItems?: BreadcrumbItem[]
  lead?: ReactNode
  // 関連リンクから自ページを除外するためのパス
  path?: string
  // 一覧末尾(関連リンクの前)に差し込む追加コンテンツ
  footer?: ReactNode
}> = ({ title, articles, breadcrumbItems = [{ label: title }], lead, path, footer }) => (
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
    {lead && (
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: "0 0 1.25rem", lineHeight: 1.7 }}>{lead}</p>
    )}
    <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>
      記事一覧({articles.length}件)
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
    {footer && <div style={{ marginTop: "1.5rem" }}>{footer}</div>}
    <div style={{ marginTop: "1.5rem" }}>
      <RelatedLinks current={path} />
    </div>
  </div>
)
