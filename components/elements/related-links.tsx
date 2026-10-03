import { Link } from "@/components/elements/link"
import { FC } from "react"
import { getI18n, type Texts } from "@/lib/i18n"

// 検索流入用ハブページ間の内部リンク。孤立ページを作らないよう各一覧・特集・記事ページ下部に置く
export const HUB_LINKS: { href: string; label: Texts }[] = [
  {
    href: "/events",
    label: {
      ja: "上野のイベント情報",
      en: "Ueno events",
      "zh-cn": "上野活动资讯",
    },
  },
  {
    href: "/features/today-events",
    label: {
      ja: "今日の上野イベント",
      en: "Today in Ueno",
      "zh-cn": "今日上野活动",
    },
  },
  {
    href: "/features/weekend-events",
    label: {
      ja: "今週末の上野イベント",
      en: "This weekend in Ueno",
      "zh-cn": "本周末上野活动",
    },
  },
  {
    href: "/features/this-week",
    label: { ja: "今週の上野", en: "This week in Ueno", "zh-cn": "本周上野" },
  },
  {
    href: "/features/next-week-events",
    label: {
      ja: "来週の上野イベント",
      en: "Next week in Ueno",
      "zh-cn": "下周上野活动",
    },
  },
  {
    href: "/features/month-events",
    label: {
      ja: "今月の上野イベント",
      en: "This month in Ueno",
      "zh-cn": "本月上野活动",
    },
  },
  {
    href: "/features/free-events",
    label: {
      ja: "上野の無料イベント",
      en: "Free events in Ueno",
      "zh-cn": "上野免费活动",
    },
  },
  {
    href: "/exhibitions",
    label: {
      ja: "上野の展示・展覧会",
      en: "Ueno exhibitions",
      "zh-cn": "上野展览",
    },
  },
  {
    href: "/features/museums",
    label: {
      ja: "上野の美術館まとめ",
      en: "Ueno art museums",
      "zh-cn": "上野美术馆汇总",
    },
  },
  {
    href: "/new-stores",
    label: { ja: "上野の新店舗", en: "New shops in Ueno", "zh-cn": "上野新店" },
  },
  {
    href: "/features/monthly-openings",
    label: {
      ja: "今月の上野新店舗",
      en: "New this month",
      "zh-cn": "本月上野新店",
    },
  },
  {
    href: "/features/gourmet-new-stores",
    label: {
      ja: "上野のグルメ・カフェ新店",
      en: "New restaurants & cafés",
      "zh-cn": "上野美食・咖啡新店",
    },
  },
  {
    href: "/spots",
    label: {
      ja: "上野の施設・スポット",
      en: "Places in Ueno",
      "zh-cn": "上野设施・景点",
    },
  },
]

export const RelatedLinks: FC<{ current?: string; heading?: string }> = async ({
  current,
  heading: headingProp,
}) => {
  const { t } = await getI18n()
  const heading =
    headingProp ??
    t({
      ja: "関連する上野情報",
      en: "More about Ueno",
      "zh-cn": "更多上野资讯",
    })
  return (
    <nav
      aria-label={heading}
      style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}
    >
      <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>{heading}</h2>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: ".5rem",
          fontSize: ".8125rem",
        }}
      >
        {HUB_LINKS.filter((l) => l.href !== current).map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              style={{
                display: "inline-block",
                color: "var(--accent)",
                border: "1px solid var(--border)",
                borderRadius: "999px",
                padding: ".25rem .75rem",
                textDecoration: "none",
              }}
            >
              {t(l.label)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
