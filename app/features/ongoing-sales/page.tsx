import type { Metadata } from "next"
import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"
import { absoluteUrl, jsonLdString, SITE_NAME } from "@/lib/seo"

const title = "現在開催中のセール"
const description = "上野エリアで現在開催中のセール・キャンペーン情報をまとめて紹介。"

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/features/ongoing-sales" },
  openGraph: { type: "website", title, description, siteName: SITE_NAME },
  twitter: { card: "summary", title, description },
}

const Page: FC = () => {
  const articles = getArticlesByCategory(["sale", "campaign"])

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListElement: articles.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/articles/${a.id}`),
      name: a.title,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <ArticleListPage
        title={title}
        articles={articles}
        breadcrumbItems={[{ label: "特集" }, { label: title }]}
      />
    </>
  )
}

export default Page
