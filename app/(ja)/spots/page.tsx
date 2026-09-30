import type { Metadata } from "next"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { CardGrid, SpotCard } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { spots } from "@/lib/data"
import { getI18n, type Texts } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"

const TITLES: Texts = { ja: "上野の施設・スポット一覧", en: "Places to Visit in Ueno", "zh-cn": "上野设施・景点列表" }

// 表示順(美術館・博物館→公園等→商業施設)。未定義の種別は末尾
const TYPE_ORDER = ["美術館", "博物館", "動物園", "公園", "庭園", "寺院", "文化施設", "図書館", "商業施設", "百貨店"]

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n()
  return pageMetadata({
    title: t(TITLES),
    description: t({
      ja: "上野の美術館・博物館・動物園・公園・商業施設を一覧で紹介。東京国立博物館・東京都美術館・国立西洋美術館・上野動物園など、施設ごとの開催中イベントや展示情報を確認できる。",
      en: "Art museums, museums, the zoo, parks and shopping facilities in Ueno, including the Tokyo National Museum, Tokyo Metropolitan Art Museum, National Museum of Western Art and Ueno Zoo, with current events and exhibitions at each.",
      "zh-cn": "一览上野的美术馆、博物馆、动物园、公园及商业设施。可查看东京国立博物馆、东京都美术馆、国立西洋美术馆、上野动物园等各设施正在举办的活动与展览。",
    }),
    path: "/spots",
  })
}

const Page: FC = async () => {
  const i18n = await getI18n()
  const { t } = i18n
  const types = Array.from(new Set(spots.map((s) => s.type))).sort(
    (a, b) =>
      (TYPE_ORDER.indexOf(a) + 1 || Infinity) -
      (TYPE_ORDER.indexOf(b) + 1 || Infinity)
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <Breadcrumb items={[{ label: t({ ja: "施設・スポット", en: "Places", "zh-cn": "设施・景点" }) }]} />
        <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{t(TITLES)}</h1>
      </div>
      <InArticleAd />
      {types.map((type) => (
        <section key={type}>
          <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>
            {i18n.spot(spots.find((s) => s.type === type)).type}
          </h2>
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
