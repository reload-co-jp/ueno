import type { Metadata } from "next"
import { Link } from "@/components/elements/link"
import { FC } from "react"
import { ArticleListPage } from "@/components/elements/article-list-page"
import { MonthArchiveNav } from "@/components/elements/month-archive-page"
import { getNewStoreArchives } from "@/lib/archives"
import { getArticlesByCategory } from "@/lib/data"
import { getI18n, type Texts } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"

const TITLES: Texts = {
  ja: "上野の新店舗・新規オープン情報",
  en: "New Shops & Openings in Ueno",
  "zh-cn": "上野新店・开业资讯",
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n()
  const n = getArticlesByCategory("new_opening").length
  return pageMetadata({
    title: t(TITLES),
    description: t({
      ja: `上野・御徒町エリアの新店舗・新規オープン情報${n}件を紹介。上野駅周辺のグルメ・カフェ・ショップの新店をオープン日・場所つきで毎日更新。`,
      en: `${n} new shops and openings in the Ueno and Okachimachi area. New restaurants, cafés and stores around Ueno Station with opening dates and locations, updated daily.`,
      "zh-cn": `介绍上野・御徒町地区${n}家新店・开业资讯。每日更新上野站周边美食、咖啡、商店的新店信息，附开业日期及地点。`,
    }),
    path: "/new-stores",
  })
}

const Page: FC = async () => {
  const { t } = await getI18n()
  return (
    <ArticleListPage
      title={t(TITLES)}
      articles={getArticlesByCategory("new_opening")}
      breadcrumbItems={[{ label: t({ ja: "新店舗", en: "New Shops", "zh-cn": "新店" }) }]}
      path="/new-stores"
      footer={
        <MonthArchiveNav
          archives={getNewStoreArchives()}
          basePath="/new-stores"
          currentPath="/features/monthly-openings"
          heading={t({ ja: "月別の上野新店舗", en: "New shops by month", "zh-cn": "按月份查看上野新店" })}
        />
      }
      lead={t({
        ja: (
          <>
            上野駅・御徒町駅・上野公園周辺で新しくオープンした店舗・オープン予定の新店をまとめて紹介。
            <Link href="/features/monthly-openings">今月オープンの新店舗</Link>や
            <Link href="/features/gourmet-new-stores">グルメ・カフェの新店</Link>もあわせて確認できる。
          </>
        ),
        en: (
          <>
            New and upcoming shops around Ueno Station, Okachimachi Station and Ueno Park. See also{" "}
            <Link href="/features/monthly-openings">shops opening this month</Link> and{" "}
            <Link href="/features/gourmet-new-stores">new restaurants & cafés</Link>.
          </>
        ),
        "zh-cn": (
          <>
            汇总上野站、御徒町站、上野公园周边新开业及即将开业的店铺。也可查看
            <Link href="/features/monthly-openings">本月开业的新店</Link>和
            <Link href="/features/gourmet-new-stores">美食・咖啡新店</Link>。
          </>
        ),
      })}
    />
  )
}

export default Page
