import Link from "next/link"
import { ComponentProps, FC, ReactNode } from "react"

const NAV_ITEMS = [
  { href: "/", label: "最新情報" },
  { href: "/events", label: "イベント" },
  { href: "/new-stores", label: "新店舗" },
  { href: "/closures", label: "閉店" },
  { href: "/sales", label: "セール" },
  { href: "/popup", label: "POP UP" },
  { href: "/exhibitions", label: "展示・アート" },
  { href: "/stores", label: "店舗" },
  { href: "/spots", label: "施設・スポット" },
  { href: "/areas", label: "エリア" },
] as const

export const Nav: FC = () => (
  <nav
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem",
      marginTop: ".5rem",
      fontSize: ".875rem",
    }}
  >
    {NAV_ITEMS.map((item) => (
      <Link key={item.href} href={item.href} style={{ color: "#f0f0f0" }}>
        {item.label}
      </Link>
    ))}
  </nav>
)

export const Title: FC<ComponentProps<"h1">> = ({
  style,
  children,
  ...props
}) => (
  <h1 style={{ fontSize: "1rem", margin: 0, ...style }} {...props}>
    {children}
  </h1>
)

export const Header: FC<{ children: ReactNode }> = ({ children }) => (
  <header
    style={{
      backgroundColor: "#333",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: ".5rem 1rem",
      position: "relative",
    }}
  >
    {children}
  </header>
)

export const Main: FC<{ children: ReactNode }> = ({ children }) => (
  <main
    style={{
      background: "#222",
      minHeight: "calc(100dvh - 5.625rem)",
      padding: "1rem",
    }}
  >
    {children}
  </main>
)

export const Footer: FC<{ children: ReactNode }> = ({ children }) => (
  <footer
    style={{
      backgroundColor: "#333",
      boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)",
      fontSize: ".75rem",
      padding: "1rem",
    }}
  >
    {children}
  </footer>
)
