import type { Metadata } from "next"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { getI18n, type Locale, type Texts } from "@/lib/i18n"
import { pageMetadata, SITE_NAMES } from "@/lib/seo"

const TITLES: Texts = { ja: "このサイトについて", en: "About", "zh-cn": "关于本站" }

const descriptionOf = (locale: Locale) =>
  ({
    ja: `${SITE_NAMES.ja}は、上野エリアのイベント・新店舗・セール・展示会などの最新情報をまとめる地域メディア。`,
    en: `${SITE_NAMES.en} is a local media site covering the latest events, new shops, sales and exhibitions in Ueno, Tokyo.`,
    "zh-cn": `${SITE_NAMES["zh-cn"]}是汇总东京上野地区活动、新店、促销、展览等最新资讯的本地媒体。`,
  })[locale]

export const generateMetadata = async (): Promise<Metadata> => {
  const { locale } = await getI18n()
  return pageMetadata({ title: TITLES[locale], description: descriptionOf(locale), path: "/about" })
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1rem",
  margin: "0 0 .5rem",
}

const paragraphStyle: React.CSSProperties = {
  fontSize: ".875rem",
  color: "var(--secondary)",
  lineHeight: 1.7,
  margin: 0,
}

const Page: FC = async () => {
  const { locale, t } = await getI18n()
  const siteName = SITE_NAMES[locale]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Breadcrumb items={[{ label: TITLES[locale] }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{TITLES[locale]}</h1>

      <section>
        <h2 style={sectionTitleStyle}>
          {t({ ja: `${siteName}について`, en: `About ${siteName}`, "zh-cn": `关于${siteName}` })}
        </h2>
        <p style={paragraphStyle}>
          {t({
            ja: `${siteName}は、上野エリアのイベント・新店舗・閉店・セール・POP UP・展示会・施設などの最新情報をまとめる地域メディア。上野公園・上野駅周辺の話題を日々更新している。`,
            en: `${siteName} is a local media site covering the latest events, new openings, closures, sales, pop-ups, exhibitions and facilities in the Ueno area. We post news from around Ueno Park and Ueno Station every day.`,
            "zh-cn": `${siteName}是汇总上野地区活动、新店、闭店、促销、快闪店、展览、设施等最新资讯的本地媒体，每日更新上野公园及上野站周边的话题。`,
          })}
        </p>
      </section>

      <section>
        <h2 style={sectionTitleStyle}>{t({ ja: "運営", en: "Operator", "zh-cn": "运营" })}</h2>
        <p style={paragraphStyle}>
          {t({ ja: "運営: 株式会社Reload", en: "Operated by Reload Inc.", "zh-cn": "运营：株式会社Reload" })}
        </p>
      </section>

      <section>
        <h2 style={sectionTitleStyle}>
          {t({ ja: "掲載情報について", en: "About Our Content", "zh-cn": "关于刊登信息" })}
        </h2>
        <p style={paragraphStyle}>
          {t({
            ja: "掲載情報は独自取材および公開情報をもとに作成している。内容には注意を払っているが、店舗・イベントの詳細（日程・料金・営業時間など）は変更される場合があるため、利用の際は各店舗・主催者の公式情報もあわせて確認すること。",
            en: "Our content is based on our own reporting and publicly available information. While we take care to keep it accurate, details such as dates, prices and opening hours may change, so please also check the official information from each shop or organizer.",
            "zh-cn": "刊登信息基于独立采访及公开信息编写。我们力求内容准确，但店铺・活动的详情（日程、费用、营业时间等）可能发生变更，请同时确认各店铺・主办方的官方信息。",
          })}
        </p>
      </section>
      {locale !== "ja" && (
        <section>
          <h2 style={sectionTitleStyle}>{t({ ja: "", en: "Translations", "zh-cn": "关于翻译" })}</h2>
          <p style={paragraphStyle}>
            {t({
              ja: "",
              en: "Articles on this site are machine-translated from the original Japanese. In case of discrepancies, the Japanese version prevails.",
              "zh-cn": "本站文章由日文原文机器翻译而成。如有出入，以日文版为准。",
            })}
          </p>
        </section>
      )}
    </div>
  )
}

export default Page
