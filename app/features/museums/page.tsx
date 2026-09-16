import type { Metadata } from "next"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid, SpotCard } from "@/components/elements/card"
import { getMuseumArticles, getMuseumSpots } from "@/lib/data"
import { absoluteUrl, jsonLdString, SITE_NAME } from "@/lib/seo"

const title = "上野の美術館まとめ"
const description =
  "上野エリアの美術館を一覧で紹介。東京都美術館・国立西洋美術館・上野の森美術館・東京藝術大学大学美術館など、開催中の展示・企画展情報もあわせてまとめている。"

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/features/museums" },
  openGraph: { type: "website", title, description, siteName: SITE_NAME },
  twitter: { card: "summary", title, description },
}

const Page: FC = () => {
  const museums = getMuseumSpots()
  const articles = getMuseumArticles()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListElement: museums.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/spots/${m.id}`),
      name: m.name,
    })),
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "特集" }, { label: title }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{title}</h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        上野公園周辺に集まる美術館をまとめて紹介している。東京都美術館、国立西洋美術館、
        上野の森美術館、東京藝術大学大学美術館など、それぞれの施設情報と開催中・開催予定の
        展示・企画展の最新情報をあわせて確認できる。
      </p>

      {museums.length === 0 ? (
        <p style={{ color: "#a39c8c" }}>該当する美術館はまだない。</p>
      ) : (
        <CardGrid>
          {museums.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </CardGrid>
      )}

      <div>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>展示・企画展の最新情報</h2>
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
    </div>
  )
}

export default Page
