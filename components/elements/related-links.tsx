import Link from "next/link"
import { FC } from "react"

// 検索流入用ハブページ間の内部リンク。孤立ページを作らないよう各一覧・特集・記事ページ下部に置く
export const HUB_LINKS = [
  { href: "/events", label: "上野のイベント情報" },
  { href: "/features/today-events", label: "今日の上野イベント" },
  { href: "/features/weekend-events", label: "今週末の上野イベント" },
  { href: "/features/this-week", label: "今週の上野" },
  { href: "/features/next-week-events", label: "来週の上野イベント" },
  { href: "/features/month-events", label: "今月の上野イベント" },
  { href: "/features/free-events", label: "上野の無料イベント" },
  { href: "/exhibitions", label: "上野の展示・展覧会" },
  { href: "/features/museums", label: "上野の美術館まとめ" },
  { href: "/new-stores", label: "上野の新店舗" },
  { href: "/features/monthly-openings", label: "今月の上野新店舗" },
  { href: "/features/gourmet-new-stores", label: "上野のグルメ・カフェ新店" },
  { href: "/spots", label: "上野の施設・スポット" },
]

export const RelatedLinks: FC<{ current?: string; heading?: string }> = ({
  current,
  heading = "関連する上野情報",
}) => (
  <nav
    aria-label={heading}
    style={{ borderTop: "1px solid #e8e1d3", paddingTop: "1rem" }}
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
              color: "#c0483a",
              border: "1px solid #e8c9c1",
              borderRadius: "999px",
              padding: ".25rem .75rem",
              textDecoration: "none",
            }}
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
)
