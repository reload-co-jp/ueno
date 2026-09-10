import type { Metadata } from "next"
import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"
import { thisMonthRange } from "@/lib/date"
import { absoluteUrl, jsonLdString, SITE_NAME } from "@/lib/seo"

const monthLabel = () => {
  const { start } = thisMonthRange()
  return `${start.slice(0, 4)}年${Number(start.slice(5, 7))}月`
}

export const metadata: Metadata = {
  title: `${monthLabel()}の新店舗`,
  description: `${monthLabel()}に上野エリアでオープンした新店舗情報をまとめて紹介。`,
  alternates: { canonical: "/features/monthly-openings" },
  openGraph: { type: "website", siteName: SITE_NAME },
  twitter: { card: "summary" },
}

const Page: FC = () => {
  const { start, end } = thisMonthRange()
  const articles = getArticlesByCategory("new_opening").filter((a) => {
    const d = a.publishedAt.slice(0, 10)
    return d >= start && d <= end
  })
  const title = `${monthLabel()}の新店舗`

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
