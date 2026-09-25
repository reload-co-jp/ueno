import type { Metadata } from "next"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { CardGrid, SpotCard } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { spots } from "@/lib/data"
import { pageMetadata } from "@/lib/seo"

const title = "上野の施設・スポット一覧"

// 表示順(美術館・博物館→公園等→商業施設)。未定義の種別は末尾
const TYPE_ORDER = ["美術館", "博物館", "動物園", "公園", "庭園", "寺院", "文化施設", "図書館", "商業施設", "百貨店"]

export const metadata: Metadata = pageMetadata({
  title,
  description:
    "上野の美術館・博物館・動物園・公園・商業施設を一覧で紹介。東京国立博物館・東京都美術館・国立西洋美術館・上野動物園など、施設ごとの開催中イベントや展示情報を確認できる。",
  path: "/spots",
})

const Page: FC = () => {
  const types = Array.from(new Set(spots.map((s) => s.type))).sort(
    (a, b) =>
      (TYPE_ORDER.indexOf(a) + 1 || Infinity) -
      (TYPE_ORDER.indexOf(b) + 1 || Infinity)
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <Breadcrumb items={[{ label: "施設・スポット" }]} />
        <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{title}</h1>
      </div>
      <InArticleAd />
      {types.map((type) => (
        <section key={type}>
          <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>{type}</h2>
          <CardGrid>
            {spots
              .filter((s) => s.type === type)
              .map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
          </CardGrid>
        </section>
      ))}
      <RelatedLinks current="/spots" />
    </div>
  )
}

export default Page
