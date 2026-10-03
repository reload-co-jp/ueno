import { Link } from "@/components/elements/link"
import { ComponentProps, FC, ReactNode } from "react"
import { SearchBox } from "@/components/elements/search-box"
import { getI18n, localePath, type Texts } from "@/lib/i18n"

type NavItem = { href: string; label: Texts }

// メインナビ。サブカテゴリはフッターのサイトマップに置き、既存ページへの内部リンクを維持する
const NAV_GROUPS: (NavItem & { children: NavItem[] })[] = [
  {
    href: "/events",
    label: { ja: "イベント", en: "Events", "zh-cn": "活动" },
    children: [
      { href: "/features/today-events", label: { ja: "今日", en: "Today", "zh-cn": "今天" } },
      { href: "/features/weekend-events", label: { ja: "今週末", en: "This weekend", "zh-cn": "本周末" } },
      { href: "/features/this-week", label: { ja: "今週", en: "This week", "zh-cn": "本周" } },
      { href: "/features/next-week-events", label: { ja: "来週", en: "Next week", "zh-cn": "下周" } },
      { href: "/features/month-events", label: { ja: "今月", en: "This month", "zh-cn": "本月" } },
      { href: "/features/free-events", label: { ja: "無料イベント", en: "Free events", "zh-cn": "免费活动" } },
    ],
  },
  {
    href: "/new-stores",
    label: { ja: "お店", en: "Shops", "zh-cn": "店铺" },
    children: [
      { href: "/new-stores", label: { ja: "新店舗", en: "New shops", "zh-cn": "新店" } },
      { href: "/popup", label: { ja: "POP UP", en: "Pop-ups", "zh-cn": "快闪店" } },
      { href: "/closures", label: { ja: "閉店", en: "Closures", "zh-cn": "闭店" } },
      { href: "/sales", label: { ja: "セール", en: "Sales", "zh-cn": "促销" } },
      { href: "/features/ongoing-sales", label: { ja: "開催中のセール", en: "Ongoing sales", "zh-cn": "正在进行的促销" } },
      { href: "/features/gourmet-new-stores", label: { ja: "グルメ", en: "Food & cafés", "zh-cn": "美食" } },
      { href: "/features/monthly-openings", label: { ja: "今月の新店舗", en: "New this month", "zh-cn": "本月新店" } },
      { href: "/stores", label: { ja: "店舗一覧", en: "All shops", "zh-cn": "店铺列表" } },
    ],
  },
  {
    href: "/exhibitions",
    label: { ja: "アート", en: "Art", "zh-cn": "艺术" },
    children: [
      { href: "/exhibitions", label: { ja: "展覧会", en: "Exhibitions", "zh-cn": "展览" } },
      { href: "/features/museums", label: { ja: "美術館・博物館", en: "Museums", "zh-cn": "美术馆・博物馆" } },
    ],
  },
  {
    href: "/spots",
    label: { ja: "スポット", en: "Places", "zh-cn": "景点" },
    children: [{ href: "/spots", label: { ja: "施設・スポット", en: "All places", "zh-cn": "设施・景点" } }],
  },
  {
    href: "/#news",
    label: { ja: "ニュース", en: "News", "zh-cn": "新闻" },
    children: [{ href: "/about", label: { ja: "このサイトについて", en: "About", "zh-cn": "关于本站" } }],
  },
]

export const Nav: FC = async () => {
  const { t } = await getI18n()
  return (
    <nav
      className="header-nav"
      style={{ display: "flex", flexWrap: "wrap", gap: ".25rem 1.25rem", fontSize: ".9375rem", fontWeight: 700 }}
    >
      {NAV_GROUPS.map((item) => (
        <Link key={item.href} href={item.href} style={{ color: "var(--text)", textDecoration: "none" }}>
          {t(item.label)}
        </Link>
      ))}
    </nav>
  )
}

// スマホ下部固定ナビ
export const BottomNav: FC = async () => {
  const { t } = await getI18n()
  return (
    <nav className="bottom-nav">
      <Link href="/">{t({ ja: "ホーム", en: "Home", "zh-cn": "首页" })}</Link>
      {NAV_GROUPS.slice(0, 4).map((item) => (
        <Link key={item.href} href={item.href}>
          {t(item.label)}
        </Link>
      ))}
    </nav>
  )
}

// サジェストはビルド時生成のインデックス(lib/search-index.ts)、Enterの全文検索はGoogleのサイト内検索に委ねる
export const SearchForm: FC = async () => {
  const { locale, t } = await getI18n()
  return (
    <SearchBox
      locale={locale}
      prefix={localePath(locale, "/").replace(/\/$/, "")}
      site="ueno.reload.co.jp"
      label={t({
        ja: "上野のイベント・店・スポットを検索",
        en: "Search events, shops & places in Ueno",
        "zh-cn": "搜索上野的活动・店铺・景点",
      })}
    />
  )
}

// フッターのサイトマップ。全サブカテゴリへのリンクを集約する
export const FooterNav: FC = async () => {
  const { t } = await getI18n()
  return (
    <nav
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
        gap: "1.5rem",
        textAlign: "left",
        marginBottom: "2rem",
      }}
    >
      {NAV_GROUPS.map((group) => (
        <div key={group.href}>
          <Link href={group.href} style={{ color: "#fff", fontWeight: 800, fontSize: ".875rem" }}>
            {t(group.label)}
          </Link>
          <ul style={{ listStyle: "none", padding: 0, margin: ".5rem 0 0" }}>
            {group.children.map((c) => (
              <li key={c.href} style={{ margin: ".25rem 0" }}>
                <Link href={c.href} style={{ color: "#bbb", textDecoration: "none" }}>
                  {t(c.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

// サイト名表示用。ページ固有の主題はh1で各ページが持つため、ここはpに留める。
export const Title: FC<ComponentProps<"p">> = ({
  style,
  children,
  ...props
}) => (
  <p
    style={{
      fontFamily: "var(--font-lubrifont)",
      fontSize: "2.25rem",
      fontWeight: 250,
      letterSpacing: "-0.02em",
      margin: 0,
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
)

export const Header: FC<{ children: ReactNode }> = ({ children }) => (
  <header
    style={{
      background: "#fff",
      color: "var(--text)",
      borderBottom: "1px solid var(--border)",
      position: "relative",
    }}
  >
    <div
      style={{
        maxWidth: "75rem",
        margin: "0 auto",
        padding: ".75rem 1rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: ".5rem 2rem",
      }}
    >
      {children}
    </div>
  </header>
)

export const Main: FC<{ children: ReactNode }> = ({ children }) => (
  <main
    style={{
      background: "var(--bg)",
      minHeight: "calc(100dvh - 5.625rem)",
    }}
  >
    <div
      style={{ maxWidth: "75rem", margin: "0 auto", padding: "2rem 1rem" }}
    >
      {children}
    </div>
  </main>
)

export const Footer: FC<{ children: ReactNode }> = ({ children }) => (
  <footer
    style={{
      background: "var(--text)",
      color: "#fff",
      fontSize: ".75rem",
      textAlign: "center",
    }}
  >
    <div
      style={{ maxWidth: "75rem", margin: "0 auto", padding: "2.5rem 1rem 1.5rem" }}
    >
      {children}
    </div>
  </footer>
)
