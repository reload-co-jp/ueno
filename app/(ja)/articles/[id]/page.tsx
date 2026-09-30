import type { Metadata } from "next"
import { Link } from "@/components/elements/link"
import { notFound } from "next/navigation"
import { FC } from "react"
import { AdSlot, InArticleAd } from "@/components/elements/ad-slot"
import { ArticleBody } from "@/components/elements/article-body"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { SpotEvents } from "@/components/elements/spot-events"
import {
  getArticle,
  getArticleImageUrl,
  getRelatedArticles,
  getArticleSpots,
  getStore,
  allArticles,
  getPrimaryArticle,
} from "@/lib/data"
import { formatDate } from "@/lib/date"
import { getI18n, isArticleTranslated, LOCALE_META } from "@/lib/i18n"
import { absoluteUrl, articleDescription, jsonLdString, localeAlternates, pageUrl, SITE_NAMES } from "@/lib/seo"
import { Category, isEventArticle } from "@/lib/types"

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

export const generateStaticParams = () => allArticles.map((n) => ({ id: n.id }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> => {
  const { id } = await params
  const original = getArticle(id)
  if (!original) return {}
  const i18n = await getI18n()
  const { locale } = i18n
  const article = i18n.article(original)
  // イベント記事は /events/[id] と同内容のため、そちらを正規URLとする
  // 重複記事は先行記事を正規URLとする
  const primary = getPrimaryArticle(original) ?? original
  const alternates = localeAlternates(
    locale,
    isEventArticle(primary) ? `/events/${primary.id}` : `/articles/${primary.id}`
  )
  const imageUrl = getArticleImageUrl(original)
  const description = articleDescription(original, locale)
  return {
    title: article.title,
    description,
    alternates,
    // 未翻訳の英語・簡体字版は日本語版と重複するため検索対象外
    robots: isArticleTranslated(original.id, locale) ? undefined : { index: false, follow: true },
    openGraph: {
      type: "article",
      url: alternates.canonical,
      title: article.title,
      description,
      siteName: SITE_NAMES[locale],
      locale: LOCALE_META[locale].og,
      publishedTime: article.publishedAt,
      images: imageUrl ? [imageUrl] : undefined,
    },
    twitter: {
      card: "summary",
      title: article.title,
      description,
    },
  }
}

const Page: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params
  const original = getArticle(id)
  if (!original) notFound()
  const i18n = await getI18n()
  const { locale, t, path } = i18n
  const article = i18n.article(original)
  const siteName = SITE_NAMES[locale]

  const relatedStores = original.relatedStoreIds.map(getStore).filter(Boolean)
  const relatedSpots = getArticleSpots(original)
  const relatedArticles = getRelatedArticles(original)
  const image = i18n.image(original)
  const imageUrl = image?.url

  const url = pageUrl(path(`/articles/${article.id}`))
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    // ページ上に表示している画像のみ(プレースホルダは含めない)
    image: imageUrl ? [absoluteUrl(imageUrl)] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    articleSection: i18n.category(article.category),
    author: { "@type": "Organization", name: siteName, url: pageUrl(path("/")) },
    publisher: { "@type": "Organization", name: siteName },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: LOCALE_META[locale].hreflang,
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
            label: i18n.category(article.category),
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
        {i18n.category(article.category)}
      </span>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={image?.alt}
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
        {formatDate(article.publishedAt, locale)}
        {t({ ja: " ・ ", en: " · ", "zh-cn": " · " })}
        {article.area}
      </p>

      <InArticleAd />

      <ArticleBody body={article.body} />

      <AdSlot />

      {(relatedStores.length > 0 || relatedSpots.length > 0) && (
        <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}>
          <h2 style={{ fontSize: ".9375rem", marginBottom: ".5rem" }}>
            {t({ ja: "関連情報", en: "Related", "zh-cn": "相关信息" })}
          </h2>
          <ul style={{ listStyle: "none", padding: 0, fontSize: ".875rem" }}>
            {relatedStores.map(i18n.store).map((s) => (
              <li key={s.id}>
                <Link href={`/stores/${s.id}`} style={{ color: "#c0483a" }}>
                  {t({ ja: "店舗", en: "Shop", "zh-cn": "店铺" })}: {s.name}
                </Link>
              </li>
            ))}
            {relatedSpots.map(i18n.spot).map((s) => (
              <li key={s.id}>
                <Link href={`/spots/${s.id}`} style={{ color: "#c0483a" }}>
                  {t({ ja: "施設", en: "Place", "zh-cn": "设施" })}: {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedArticles.length > 0 && (
        <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}>
          <h2 style={{ fontSize: ".9375rem", marginBottom: ".75rem" }}>
            {t({ ja: "関連記事", en: "Related articles", "zh-cn": "相关文章" })}
          </h2>
          <CardGrid>
            {relatedArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        </div>
      )}

      <SpotEvents article={original} spots={relatedSpots} />

      <RelatedLinks />

      <div style={{ fontSize: ".75rem", color: "#a39c8c" }}>
        {t({ ja: "情報源", en: "Sources", "zh-cn": "信息来源" })}:{" "}
        {article.sources.map((url, i) => (
          <span key={url}>
            {i > 0 && t({ ja: "、", en: ", ", "zh-cn": "、" })}
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
