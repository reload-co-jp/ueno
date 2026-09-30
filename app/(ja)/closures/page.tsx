import type { Metadata } from "next"
import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"
import { getI18n, type Texts } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"

const TITLES: Texts = { ja: "上野の閉店情報", en: "Shop Closures in Ueno", "zh-cn": "上野闭店资讯" }

const DESCRIPTIONS: Texts = {
  ja: "上野・御徒町エリアで閉店・営業終了した店舗の情報をまとめて紹介。",
  en: "Shops and restaurants that have closed in the Ueno and Okachimachi area.",
  "zh-cn": "汇总上野・御徒町地区已闭店・停止营业的店铺信息。",
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n()
  return pageMetadata({ title: t(TITLES), description: t(DESCRIPTIONS), path: "/closures" })
}

const Page: FC = async () => {
  const { t } = await getI18n()
  return (
    <ArticleListPage
      title={t(TITLES)}
      breadcrumbItems={[{ label: t({ ja: "閉店", en: "Closures", "zh-cn": "闭店" }) }]}
      path="/closures"
      articles={getArticlesByCategory("closing")}
    />
  )
}

export default Page
