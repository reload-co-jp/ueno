import type { Metadata } from "next"
import Link from "next/link"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getGourmetNewOpenings } from "@/lib/data"
import { absoluteUrl, jsonLdString, SITE_NAME } from "@/lib/seo"

const title = "上野のグルメ・カフェ新店舗まとめ"
const description =
  "上野エリアで新しくオープンしたグルメ・カフェ・飲食店の最新情報をまとめて紹介。ラーメン・焼肉・居酒屋・カフェなど、上野駅周辺で話題の新店舗オープン情報を随時更新。"

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/features/gourmet-new-stores" },
  openGraph: { type: "website", title, description, siteName: SITE_NAME },
  twitter: { card: "summary", title, description },
}

const Page: FC = () => {
  const articles = getGourmetNewOpenings()

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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "特集" }, { label: title }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{title}</h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        上野駅・御徒町駅周辺で新規オープンしたグルメ・カフェ・飲食店の情報をまとめている。
        ラーメン、焼肉、居酒屋、カフェ、スイーツなど、上野で今話題の新店舗を随時更新中。
        気になる店舗の記事から、住所・営業時間・関連情報もあわせて確認できる。
      </p>

      {articles.length === 0 ? (
        <p style={{ color: "#a39c8c" }}>該当する記事はまだない。</p>
      ) : (
        <CardGrid>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </CardGrid>
      )}

      <div style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem", fontSize: ".875rem" }}>
        <Link href="/new-stores" style={{ color: "#c0483a" }}>
          上野の新店舗情報一覧を見る
        </Link>
        {" ・ "}
        <Link href="/sales" style={{ color: "#c0483a" }}>
          セール・キャンペーン情報を見る
        </Link>
      </div>
    </div>
  )
}

export default Page
