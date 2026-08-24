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
          color: "#fff",
          background: "rgba(255, 255, 255, 0.16)",
          borderRadius: "999px",
          padding: ".25rem .875rem",
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
  <h1 style={{ fontSize: "1.375rem", margin: 0, ...style }} {...props}>
    {children}
  </h1>
)

export const Header: FC<{ children: ReactNode }> = ({ children }) => (
  <header
    style={{
      background: "#c0483a",
      color: "#fff",
      position: "relative",
    }}
  >
    <div style={{ maxWidth: "75rem", margin: "0 auto", padding: ".75rem 1.5rem" }}>
      {children}
    </div>
  </header>
)

export const Main: FC<{ children: ReactNode }> = ({ children }) => (
  <main
    style={{
      background: "#fdfbf7",
      minHeight: "calc(100dvh - 5.625rem)",
    }}
  >
    <div style={{ maxWidth: "75rem", margin: "0 auto", padding: "1.5rem" }}>
      {children}
    </div>
  </main>
)

export const Footer: FC<{ children: ReactNode }> = ({ children }) => (
  <footer
    style={{
      background: "#3a3530",
      color: "#fdfbf7",
      fontSize: ".75rem",
      textAlign: "center",
    }}
  >
    <div style={{ maxWidth: "75rem", margin: "0 auto", padding: "1rem 1.5rem" }}>
      {children}
    </div>
  </footer>
)
