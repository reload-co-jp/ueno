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
      gap: ".5rem",
      marginTop: ".75rem",
      fontSize: ".875rem",
    }}
  >
    {NAV_ITEMS.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className="pill"
        style={{
          color: "#2d2a26",
          background: "#fff",
          borderRadius: "999px",
          padding: ".25rem .875rem",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0.125rem 0.125rem 0 #2d2a26",
        }}
      >
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
  <h1 style={{ fontSize: "1.5rem", margin: 0, ...style }} {...props}>
    {children}
  </h1>
)

export const Header: FC<{ children: ReactNode }> = ({ children }) => (
  <header
    style={{
      background: "linear-gradient(90deg, #ff8fa3, #ffd93d)",
      color: "#2d2a26",
      padding: ".75rem 1.25rem",
      position: "relative",
    }}
  >
    {children}
  </header>
)

export const Main: FC<{ children: ReactNode }> = ({ children }) => (
  <main
    style={{
      background: "#fffaf0",
      minHeight: "calc(100dvh - 5.625rem)",
      padding: "1.5rem 1rem",
    }}
  >
    {children}
  </main>
)

export const Footer: FC<{ children: ReactNode }> = ({ children }) => (
  <footer
    style={{
      background: "#2d2a26",
      color: "#fffaf0",
      fontSize: ".75rem",
      padding: "1rem",
      textAlign: "center",
    }}
  >
    {children}
  </footer>
)
