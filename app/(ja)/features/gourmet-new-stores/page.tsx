import type { Metadata } from "next"
import { Link } from "@/components/elements/link"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getGourmetNewOpenings } from "@/lib/data"
import { getI18n, type Texts } from "@/lib/i18n"
import { absoluteUrl, jsonLdString, pageMetadata } from "@/lib/seo"

const TITLES: Texts = {
  ja: "上野のグルメ・カフェ新店舗まとめ",
  en: "New Restaurants & Cafés in Ueno",
  "zh-cn": "上野美食・咖啡新店汇总",
}
const DESCRIPTIONS: Texts = {
  ja: "上野エリアで新しくオープンしたグルメ・カフェ・飲食店の最新情報をまとめて紹介。ラーメン・焼肉・居酒屋・カフェなど、上野駅周辺で話題の新店舗オープン情報を随時更新。",
  en: "The latest new restaurants, cafés and eateries in the Ueno area — ramen, yakiniku, izakaya, cafés and more around Ueno Station, updated regularly.",
  "zh-cn": "汇总上野地区新开业的美食、咖啡及餐饮店最新资讯。随时更新上野站周边拉面、烤肉、居酒屋、咖啡等热门新店开业信息。",
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n()
  return pageMetadata({ title: t(TITLES), description: t(DESCRIPTIONS), path: "/features/gourmet-new-stores" })
}

const Page: FC = async () => {
  const i18n = await getI18n()
  const { t } = i18n
  const title = t(TITLES)
  const articles = getGourmetNewOpenings()

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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Breadcrumb items={[{ label: t({ ja: "特集", en: "Features", "zh-cn": "专题" }) }, { label: title }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{title}</h1>
      <p style={{ fontSize: ".875rem", color: "var(--secondary)", margin: 0, lineHeight: 1.7 }}>
        {t({
          ja: "上野駅・御徒町駅周辺で新規オープンしたグルメ・カフェ・飲食店の情報をまとめている。ラーメン、焼肉、居酒屋、カフェ、スイーツなど、上野で今話題の新店舗を随時更新中。気になる店舗の記事から、住所・営業時間・関連情報もあわせて確認できる。",
          en: "New restaurants, cafés and eateries around Ueno Station and Okachimachi Station — ramen, yakiniku, izakaya, cafés, sweets and more. Each article includes the address, opening hours and related information.",
          "zh-cn": "汇总上野站・御徒町站周边新开业的美食、咖啡及餐饮店信息。随时更新拉面、烤肉、居酒屋、咖啡、甜品等上野热门新店，可在各店铺文章中查看地址、营业时间及相关信息。",
        })}
      </p>

      <InArticleAd />

      <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>
        {t({
          ja: `グルメ・カフェの新店舗(${articles.length}件)`,
          en: `New restaurants & cafés (${articles.length})`,
          "zh-cn": `美食・咖啡新店(${articles.length}家)`,
        })}
      </h2>
      {articles.length === 0 ? (
        <p style={{ color: "var(--secondary)" }}>
          {t({ ja: "該当する記事はまだない。", en: "No articles yet.", "zh-cn": "暂无相关文章。" })}
        </p>
      ) : (
        <CardGrid>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </CardGrid>
      )}

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", fontSize: ".875rem" }}>
        <Link href="/new-stores" style={{ color: "var(--accent)" }}>
          {t({ ja: "上野の新店舗情報一覧を見る", en: "All new shops in Ueno", "zh-cn": "查看上野全部新店资讯" })}
        </Link>
        {" ・ "}
        <Link href="/sales" style={{ color: "var(--accent)" }}>
          {t({ ja: "セール・キャンペーン情報を見る", en: "Sales & promotions", "zh-cn": "查看促销・优惠活动资讯" })}
        </Link>
      </div>
    </div>
  )
}

export default Page
