import type { Metadata } from "next"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid, SpotCard } from "@/components/elements/card"
import { getMuseumArticles, getMuseumSpots } from "@/lib/data"
import { getI18n, type Texts } from "@/lib/i18n"
import { absoluteUrl, jsonLdString, pageMetadata } from "@/lib/seo"

const TITLES: Texts = { ja: "上野の美術館まとめ", en: "Art Museums in Ueno", "zh-cn": "上野美术馆汇总" }
const DESCRIPTIONS: Texts = {
  ja: "上野エリアの美術館を一覧で紹介。東京都美術館・国立西洋美術館・上野の森美術館・東京藝術大学大学美術館など、開催中の展示・企画展情報もあわせてまとめている。",
  en: "A guide to the art museums of Ueno — the Tokyo Metropolitan Art Museum, National Museum of Western Art, Ueno Royal Museum, The University Art Museum of Tokyo University of the Arts and more — with current exhibitions.",
  "zh-cn": "一览上野地区的美术馆，包括东京都美术馆、国立西洋美术馆、上野之森美术馆、东京艺术大学大学美术馆等，并汇总正在举办的展览・企划展信息。",
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n()
  return pageMetadata({ title: t(TITLES), description: t(DESCRIPTIONS), path: "/features/museums" })
}

const Page: FC = async () => {
  const i18n = await getI18n()
  const { t } = i18n
  const title = t(TITLES)
  const museums = getMuseumSpots()
  const articles = getMuseumArticles()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListElement: museums.map(i18n.spot).map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(i18n.path(`/spots/${m.id}`)),
      name: m.name,
    })),
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Breadcrumb items={[{ label: t({ ja: "特集", en: "Features", "zh-cn": "专题" }) }, { label: title }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{title}</h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        {t({
          ja: "上野公園周辺に集まる美術館をまとめて紹介している。東京都美術館、国立西洋美術館、上野の森美術館、東京藝術大学大学美術館など、それぞれの施設情報と開催中・開催予定の展示・企画展の最新情報をあわせて確認できる。",
          en: "The art museums clustered around Ueno Park, including the Tokyo Metropolitan Art Museum, National Museum of Western Art, Ueno Royal Museum and The University Art Museum of Tokyo University of the Arts, with visitor information and the latest current and upcoming exhibitions.",
          "zh-cn": "汇总集中在上野公园周边的美术馆，包括东京都美术馆、国立西洋美术馆、上野之森美术馆、东京艺术大学大学美术馆等，可查看各设施信息以及正在举办・即将举办的展览最新资讯。",
        })}
      </p>

      <InArticleAd />

      <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>
        {t({ ja: "上野の美術館一覧", en: "Art museums in Ueno", "zh-cn": "上野美术馆列表" })}
      </h2>
      {museums.length === 0 ? (
        <p style={{ color: "#a39c8c" }}>
          {t({ ja: "該当する美術館はまだない。", en: "No museums yet.", "zh-cn": "暂无相关美术馆。" })}
        </p>
      ) : (
        <CardGrid>
          {museums.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </CardGrid>
      )}

      <div>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>
          {t({ ja: "展示・企画展の最新情報", en: "Latest exhibitions", "zh-cn": "展览・企划展最新资讯" })}
        </h2>
        {articles.length === 0 ? (
          <p style={{ color: "#a39c8c" }}>
            {t({ ja: "該当する記事はまだない。", en: "No articles yet.", "zh-cn": "暂无相关文章。" })}
          </p>
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
