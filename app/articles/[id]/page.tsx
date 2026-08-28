import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FC } from "react"
import { ArticleBody } from "@/components/elements/article-body"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getArticle, getEvent, getRelatedArticles, getSpot, getStore, news } from "@/lib/data"
import { formatDateJp } from "@/lib/date"
import { absoluteUrl, jsonLdString, SITE_NAME, SITE_URL } from "@/lib/seo"
import { CATEGORY_LABELS, Category } from "@/lib/types"

// 一覧ページを持つカテゴリのみ。それ以外はパンくずでリンクなし表示。
const CATEGORY_PATHS: Partial<Record<Category, string>> = {
  new_opening: "/new-stores",
  closing: "/closures",
  sale: "/sales",
  campaign: "/sales",
  popup: "/popup",
  exhibition: "/exhibitions",
}

export const generateStaticParams = () => news.map((n) => ({ id: n.id }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> => {
  const { id } = await params
  const article = getArticle(id)
  if (!article) return {}
  const url = absoluteUrl(`/articles/${article.id}`)
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.summary,
      siteName: SITE_NAME,
      publishedTime: article.publishedAt,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
    twitter: {
      card: "summary",
      title: article.title,
      description: article.summary,
    },
  }
}

const Page: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params
  const article = getArticle(id)
  if (!article) notFound()

  const relatedStores = article.relatedStoreIds.map(getStore).filter(Boolean)
  const relatedSpots = article.relatedSpotIds.map(getSpot).filter(Boolean)
  const relatedEvents = article.relatedEventIds.map(getEvent).filter(Boolean)
  const relatedArticles = getRelatedArticles(article)

  const url = absoluteUrl(`/articles/${article.id}`)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    image: [absoluteUrl(article.imageUrl ?? "/images/placeholder.jpg")],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    articleSection: CATEGORY_LABELS[article.category],
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  }

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "75rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: CATEGORY_LABELS[article.category], href: CATEGORY_PATHS[article.category] },
          { label: article.title },
        ]}
      />
      <span
        style={{
          display: "inline-block",
          fontSize: ".75rem",
          fontWeight: 700,
          background: "#f7e6e1",
          color: "#c0483a",
          borderRadius: "999px",
          padding: ".125rem .75rem",
          width: "fit-content",
        }}
      >
        {CATEGORY_LABELS[article.category]}
      </span>
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt=""
          style={{ width: "100%", borderRadius: ".75rem", objectFit: "cover" }}
        />
      )}
      <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{article.title}</h2>
      <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>
        {formatDateJp(article.publishedAt)} ・ {article.area}
      </p>

      <ArticleBody body={article.body} />

      {(relatedStores.length > 0 || relatedSpots.length > 0 || relatedEvents.length > 0) && (
        <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}>
          <h3 style={{ fontSize: ".9375rem", marginBottom: ".5rem" }}>関連情報</h3>
          <ul style={{ listStyle: "none", padding: 0, fontSize: ".875rem" }}>
            {relatedStores.map((s) => (
              <li key={s!.id}>
                <Link href={`/stores/${s!.id}`} style={{ color: "#c0483a" }}>
                  店舗: {s!.name}
                </Link>
              </li>
            ))}
            {relatedSpots.map((s) => (
              <li key={s!.id}>
                <Link href={`/spots/${s!.id}`} style={{ color: "#c0483a" }}>
                  施設: {s!.name}
                </Link>
              </li>
            ))}
            {relatedEvents.map((e) => (
              <li key={e!.id}>イベント: {e!.name}</li>
            ))}
          </ul>
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}>
          <h3 style={{ fontSize: ".9375rem", marginBottom: ".75rem" }}>関連記事</h3>
          <CardGrid>
            {relatedArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        </div>
      )}

      <div style={{ fontSize: ".75rem", color: "#a39c8c" }}>
        情報源:{" "}
        {article.sources.map((url, i) => (
          <span key={url}>
            {i > 0 && "、"}
            <a href={url} target="_blank" rel="noreferrer" style={{ color: "#c0483a" }}>
              {url}
            </a>
          </span>
        ))}
      </div>
    </article>
  )
}

export default Page
