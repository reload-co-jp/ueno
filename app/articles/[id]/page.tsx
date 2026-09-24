import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FC } from "react"
import { AdSlot } from "@/components/elements/ad-slot"
import { ArticleBody } from "@/components/elements/article-body"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import {
  getArticle,
  getArticleImageUrl,
  getRelatedArticles,
  getSpot,
  getStore,
  news,
} from "@/lib/data"
import { formatDateJp } from "@/lib/date"
import { absoluteUrl, jsonLdString, pageUrl, SITE_NAME, SITE_URL } from "@/lib/seo"
import { CATEGORY_LABELS, Category, isEventArticle } from "@/lib/types"

// 一覧ページを持つカテゴリのみ。それ以外はパンくずでリンクなし表示。
const CATEGORY_PATHS: Partial<Record<Category, string>> = {
  event: "/events",
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
  // イベント記事は /events/[id] と同内容のため、そちらを正規URLとする
  const url = pageUrl(isEventArticle(article) ? `/events/${article.id}` : `/articles/${article.id}`)
  const imageUrl = getArticleImageUrl(article)
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
      images: imageUrl ? [imageUrl] : undefined,
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
  const relatedArticles = getRelatedArticles(article)
  const imageUrl = getArticleImageUrl(article)

  const url = pageUrl(`/articles/${article.id}`)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    image: [absoluteUrl(imageUrl ?? "/images/placeholder.jpg")],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    articleSection: CATEGORY_LABELS[article.category],
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  }

  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: "75rem",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Breadcrumb
        items={[
          {
            label: CATEGORY_LABELS[article.category],
            href: CATEGORY_PATHS[article.category],
          },
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
      {imageUrl && (
        <img
          src={imageUrl}
          alt={article.title}
          style={{
            width: "100%",
            maxHeight: "min(60vh, 480px)",
            borderRadius: ".75rem",
            objectFit: "contain",
            background: "#f4efe5",
          }}
        />
      )}
      <h1 style={{ fontSize: "1.25rem", margin: 0 }}>{article.title}</h1>
      <p style={{ fontSize: ".75rem", color: "#a39c8c", margin: 0 }}>
        {formatDateJp(article.publishedAt)} ・ {article.area}
      </p>

      <ArticleBody body={article.body} />

      <AdSlot />

      {(relatedStores.length > 0 || relatedSpots.length > 0) && (
        <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}>
          <h2 style={{ fontSize: ".9375rem", marginBottom: ".5rem" }}>
            関連情報
          </h2>
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
          </ul>
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}>
          <h2 style={{ fontSize: ".9375rem", marginBottom: ".75rem" }}>
            関連記事
          </h2>
          <CardGrid>
            {relatedArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        </div>
      )}

      <RelatedLinks />

      <div style={{ fontSize: ".75rem", color: "#a39c8c" }}>
        情報源:{" "}
        {article.sources.map((url, i) => (
          <span key={url}>
            {i > 0 && "、"}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#c0483a" }}
            >
              {url}
            </a>
          </span>
        ))}
      </div>
    </article>
  )
}

export default Page
