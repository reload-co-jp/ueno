import type { Metadata } from "next"
import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"
import { getI18n, type Texts } from "@/lib/i18n"
import { absoluteUrl, jsonLdString, pageMetadata } from "@/lib/seo"

const TITLES: Texts = { ja: "現在開催中のセール", en: "Ongoing Sales in Ueno", "zh-cn": "正在进行的促销" }
const DESCRIPTIONS: Texts = {
  ja: "上野エリアで現在開催中のセール・キャンペーン情報をまとめて紹介。",
  en: "Sales and promotions currently running in the Ueno area.",
  "zh-cn": "汇总上野地区正在进行的促销及优惠活动信息。",
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n()
  return pageMetadata({ title: t(TITLES), description: t(DESCRIPTIONS), path: "/features/ongoing-sales" })
}

const Page: FC = async () => {
  const i18n = await getI18n()
  const { t } = i18n
  const title = t(TITLES)
  const articles = getArticlesByCategory(["sale", "campaign"])

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListElement: articles.map(i18n.article).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(i18n.path(`/articles/${a.id}`)),
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
        breadcrumbItems={[{ label: t({ ja: "特集", en: "Features", "zh-cn": "专题" }) }, { label: title }]}
      />
    </>
  )
}

export default Page
