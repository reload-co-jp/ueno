import type { Metadata } from "next"
import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { getArticlesByCategory } from "@/lib/data"
import { formatMonth, thisMonthRange } from "@/lib/date"
import { getI18n, type Locale, type Texts } from "@/lib/i18n"
import { absoluteUrl, jsonLdString, pageMetadata } from "@/lib/seo"

const textsOf = (locale: Locale): Texts<{ title: string; description: string }> => {
  const month = formatMonth(thisMonthRange().start, locale)
  return {
    ja: { title: `${month}の新店舗`, description: `${month}に上野エリアでオープンした新店舗情報をまとめて紹介。` },
    en: { title: `New Shops in Ueno: ${month}`, description: `New shops that opened in the Ueno area in ${month}.` },
    "zh-cn": { title: `${month}上野新店`, description: `汇总${month}在上野地区开业的新店信息。` },
  }
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { locale, t } = await getI18n()
  return pageMetadata({ ...t(textsOf(locale)), path: "/features/monthly-openings" })
}

const Page: FC = async () => {
  const i18n = await getI18n()
  const { locale, t } = i18n
  const { start, end } = thisMonthRange()
  const articles = getArticlesByCategory("new_opening").filter((a) => {
    const d = a.publishedAt.slice(0, 10)
    return d >= start && d <= end
  })
  const { title } = t(textsOf(locale))

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
