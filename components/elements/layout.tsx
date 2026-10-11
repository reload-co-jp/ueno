import { Link } from "@/components/elements/link"
import { ComponentProps, FC, ReactNode } from "react"
import { SearchBox } from "@/components/elements/search-box"
import { getI18n, localePath, type Texts } from "@/lib/i18n"

type NavItem = { href: string; label: Texts }

// メインナビ。サブカテゴリはフッターのサイトマップに置き、既存ページへの内部リンクを維持する
const NAV_GROUPS: (NavItem & { short?: Texts; children: NavItem[] })[] = [
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
    label: { ja: "新しいお店", en: "New Shops", "zh-cn": "新店" },
    short: { ja: "お店", en: "Shops", "zh-cn": "店铺" },
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
    label: { ja: "アート・施設", en: "Art & Museums", "zh-cn": "艺术・设施" },
    short: { ja: "アート", en: "Art", "zh-cn": "艺术" },
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
    <nav className="header-nav" aria-label={t({ ja: "メインメニュー", en: "Main menu", "zh-cn": "主菜单" })}>
      {NAV_GROUPS.map((item) => (
        <Link key={item.href} href={item.href}>
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
          {t(item.short ?? item.label)}
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
    <nav className="footer-nav">
      {NAV_GROUPS.map((group) => (
        <div key={group.href}>
          <Link href={group.href}>{t(group.label)}</Link>
          <ul>
            {group.children.map((c) => (
              <li key={c.href}>
                <Link href={c.href}>{t(c.label)}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

// サイト名表示用。ページ固有の主題はh1で各ページが持つため、ここはpに留める。
export const Title: FC<ComponentProps<"p">> = ({ className, ...props }) => (
  <p className={`site-title ${className ?? ""}`} {...props} />
)

// スマホではチェックボックスでメニューを開閉する(静的export向けにCSSのみ)
export const Header: FC<{ title: ReactNode; menuLabel: string; children: ReactNode }> = ({
  title,
  menuLabel,
  children,
}) => (
  <header className="site-header">
    <div className="header-inner">
      {title}
      <input type="checkbox" id="menu-toggle" className="menu-toggle" />
      <label htmlFor="menu-toggle" className="menu-button">
        {menuLabel}
      </label>
      <div className="header-menu">{children}</div>
    </div>
  </header>
)

export const Main: FC<{ children: ReactNode }> = ({ children }) => (
  <main style={{ overflowX: "clip", minHeight: "calc(100dvh - 4rem)" }}>
    <div
      style={{
        maxWidth: "var(--content)",
        margin: "0 auto",
        padding: "2rem var(--gutter) var(--section-gap)",
      }}
    >
      {children}
    </div>
  </main>
)

export const Footer: FC<{ children: ReactNode }> = ({ children }) => (
  <footer className="site-footer">
    <div className="footer-inner">{children}</div>
  </footer>
)
