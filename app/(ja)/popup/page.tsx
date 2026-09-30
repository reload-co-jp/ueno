import type { Metadata } from "next"
import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"
import { getI18n, type Texts } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"

const TITLES: Texts = { ja: "上野のPOP UP・期間限定ショップ情報", en: "Pop-up & Limited-Time Shops in Ueno", "zh-cn": "上野快闪店・限时店铺资讯" }

const DESCRIPTIONS: Texts = {
  ja: "上野・御徒町エリアで開催中・開催予定のPOP UPストア、期間限定ショップの情報をまとめて紹介。上野マルイ・エキュート上野・松坂屋上野店などのPOP UPを随時更新。",
  en: "Current and upcoming pop-up stores and limited-time shops in the Ueno and Okachimachi area, including Ueno Marui, ecute Ueno and Matsuzakaya Ueno.",
  "zh-cn": "汇总上野・御徒町地区正在举办及即将举办的快闪店、限时店铺信息，随时更新上野丸井、ecute上野、松坂屋上野店等地的快闪活动。",
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n()
  return pageMetadata({ title: t(TITLES), description: t(DESCRIPTIONS), path: "/popup" })
}

const Page: FC = async () => {
  const { t } = await getI18n()
  return (
    <ArticleListPage
      title={t(TITLES)}
      breadcrumbItems={[{ label: t({ ja: "POP UP", en: "Pop-ups", "zh-cn": "快闪店" }) }]}
      path="/popup"
      articles={getArticlesByCategory("popup")}
    />
  )
}

export default Page
