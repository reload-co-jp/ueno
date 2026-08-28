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
] as const

export const Nav: FC = () => (
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
  <h1
    style={{
      fontSize: "3.5rem",
      fontWeight: 250,
      letterSpacing: "-0.02em",
      margin: 0,
      ...style,
    }}
    {...props}
  >
    {children}
  </h1>
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
