import { Link } from "@/components/elements/link"
import { ComponentProps, FC, ReactNode } from "react"
import { getI18n, type Texts } from "@/lib/i18n"

const NAV_ITEMS: { href: string; label: Texts }[] = [
  { href: "/", label: { ja: "最新情報", en: "Latest", "zh-cn": "最新资讯" } },
  { href: "/events", label: { ja: "イベント", en: "Events", "zh-cn": "活动" } },
  {
    href: "/new-stores",
    label: { ja: "新店舗", en: "New Shops", "zh-cn": "新店" },
  },
  { href: "/closures", label: { ja: "閉店", en: "Closures", "zh-cn": "闭店" } },
  { href: "/sales", label: { ja: "セール", en: "Sales", "zh-cn": "促销" } },
  { href: "/popup", label: { ja: "POP UP", en: "Pop-ups", "zh-cn": "快闪店" } },
  {
    href: "/exhibitions",
    label: { ja: "展示・アート", en: "Exhibitions", "zh-cn": "展览・艺术" },
  },
  { href: "/stores", label: { ja: "店舗", en: "Shops", "zh-cn": "店铺" } },
  {
    href: "/spots",
    label: { ja: "施設・スポット", en: "Places", "zh-cn": "设施・景点" },
  },
]

export const Nav: FC = async () => {
  const { t } = await getI18n()
  return (
    <nav
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: ".25rem .75rem",
        marginTop: ".5rem",
        fontSize: ".8125rem",
        fontWeight: 400,
      }}
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            color: "#c0483a",
            textDecoration: "none",
          }}
        >
          {t(item.label)}
        </Link>
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
      fontSize: "3.5rem",
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
      background: "transparent",
      color: "#c0483a",
      borderBottom: "1px solid #c0483a",
      position: "relative",
    }}
  >
    <div
      style={{ maxWidth: "75rem", margin: "0 auto", padding: ".875rem 1.5rem" }}
    >
      {children}
    </div>
  </header>
)

export const Main: FC<{ children: ReactNode }> = ({ children }) => (
  <main
    style={{
      background: "#fff",
      minHeight: "calc(100dvh - 5.625rem)",
    }}
  >
    <div
      style={{ maxWidth: "75rem", margin: "0 auto", padding: "2rem 1.5rem" }}
    >
      {children}
    </div>
  </main>
)

export const Footer: FC<{ children: ReactNode }> = ({ children }) => (
  <footer
    style={{
      background: "#111",
      color: "#fff",
      fontSize: ".75rem",
      textAlign: "center",
    }}
  >
    <div
      style={{ maxWidth: "75rem", margin: "0 auto", padding: "1.25rem 1.5rem" }}
    >
      {children}
    </div>
  </footer>
)
