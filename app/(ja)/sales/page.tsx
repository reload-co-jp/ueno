import type { Metadata } from "next"
import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"
import { getI18n, type Texts } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"

const TITLES: Texts = { ja: "上野のセール・キャンペーン情報", en: "Sales & Promotions in Ueno", "zh-cn": "上野促销・优惠活动资讯" }

const DESCRIPTIONS: Texts = {
  ja: "上野・御徒町エリアの商業施設・店舗で開催中のセール、キャンペーン情報をまとめて紹介。上野マルイ・松坂屋上野店・エキュート上野などのお得な情報を随時更新。",
  en: "Ongoing sales and promotions at shops and malls in the Ueno and Okachimachi area, including Ueno Marui, Matsuzakaya Ueno and ecute Ueno.",
  "zh-cn": "汇总上野・御徒町地区商业设施・店铺正在进行的促销及优惠活动，随时更新上野丸井、松坂屋上野店、ecute上野等地的优惠信息。",
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n()
  return pageMetadata({ title: t(TITLES), description: t(DESCRIPTIONS), path: "/sales" })
}

const Page: FC = async () => {
  const { t } = await getI18n()
  return (
    <ArticleListPage
      title={t(TITLES)}
      breadcrumbItems={[{ label: t({ ja: "セール", en: "Sales", "zh-cn": "促销" }) }]}
      path="/sales"
      articles={getArticlesByCategory(["sale", "campaign"])}
    />
  )
}

export default Page
