import type { Metadata } from "next"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { CardGrid, StoreCard } from "@/components/elements/card"
import { stores } from "@/lib/data"
import { getI18n, type Texts } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"

const TITLES: Texts = { ja: "上野の店舗一覧", en: "Shops in Ueno", "zh-cn": "上野店铺列表" }

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n()
  return pageMetadata({
    title: t(TITLES),
    description: t({
      ja: "上野・御徒町エリアの店舗一覧。営業時間・所在地と、各店舗の新規オープンやイベント関連ニュースを確認できる。",
      en: "Shops in the Ueno and Okachimachi area, with opening hours, addresses and related news on openings and events.",
      "zh-cn": "上野・御徒町地区店铺列表。可查看营业时间、地址以及各店铺的开业和活动相关资讯。",
    }),
    path: "/stores",
  })
}

const Page: FC = async () => {
  const { t } = await getI18n()
  return (
  <div>
    <Breadcrumb items={[{ label: t({ ja: "店舗", en: "Shops", "zh-cn": "店铺" }) }]} />
    <h1 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
      {t(TITLES)}
    </h1>
    <div style={{ marginBottom: "1.25rem" }}>
      <InArticleAd />
    </div>
    <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>
      {t({ ja: `店舗一覧(${stores.length}件)`, en: `All shops (${stores.length})`, "zh-cn": `店铺列表(${stores.length}家)` })}
    </h2>
    <CardGrid>
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </CardGrid>
  </div>
  )
}

export default Page
