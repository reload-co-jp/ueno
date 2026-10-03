import { FC, ReactNode } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { Breadcrumb, BreadcrumbItem } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { getI18n } from "@/lib/i18n"
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
}> = async ({
  title,
  articles,
  breadcrumbItems = [{ label: title }],
  lead,
  path,
  footer,
}) => {
  const { t } = await getI18n()
  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <h1
        style={{
          fontSize: "1.125rem",
          paddingBottom: ".5rem",
          marginBottom: "1.25rem",
          borderBottom: "0.1875rem solid var(--text)",
        }}
      >
        {title}
      </h1>
      {lead && (
        <p
          style={{
            fontSize: ".875rem",
            color: "var(--secondary)",
            margin: "0 0 1.25rem",
            lineHeight: 1.7,
          }}
        >
          {lead}
        </p>
      )}
      <div style={{ marginBottom: "1.25rem" }}>
        <InArticleAd />
      </div>
      <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>
        {t({
          ja: `記事一覧(${articles.length}件)`,
          en: `Articles (${articles.length})`,
          "zh-cn": `文章列表(${articles.length}篇)`,
        })}
      </h2>
      {articles.length === 0 ? (
        <p style={{ color: "var(--secondary)" }}>
          {t({
            ja: "該当する記事はまだない。",
            en: "No articles yet.",
            "zh-cn": "暂无相关文章。",
          })}
        </p>
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
}
