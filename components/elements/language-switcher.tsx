"use client"

import { usePathname } from "next/navigation"
import { FC } from "react"

// 静的exportのためサーバー側で現在パスを取れず、クライアントで各言語版の同一ページURLを組み立てる
const LANGUAGES = [
  { prefix: "", label: "日本語", hreflang: "ja" },
  { prefix: "/en", label: "English", hreflang: "en" },
  { prefix: "/zh-cn", label: "简体中文", hreflang: "zh-Hans" },
]

export const LanguageSwitcher: FC = () => {
  const pathname = usePathname()
  const current = LANGUAGES.find(
    (l) =>
      l.prefix && (pathname === l.prefix || pathname.startsWith(`${l.prefix}/`))
  )
  const basePath = current
    ? pathname.slice(current.prefix.length) || "/"
    : pathname

  return (
    <nav
      aria-label="Language"
      style={{
        display: "flex",
        gap: ".75rem",
        fontSize: ".75rem",
      }}
    >
      {LANGUAGES.map((l) =>
        l === (current ?? LANGUAGES[0]) ? (
          <span key={l.hreflang} style={{ fontWeight: 700 }}>
            {l.label}
          </span>
        ) : (
          // 言語ごとにルートレイアウトが異なり全画面遷移になるため<a>で十分
          <a
            key={l.hreflang}
            href={`${l.prefix}${basePath === "/" && l.prefix ? "/" : basePath}`}
            hrefLang={l.hreflang}
            lang={l.hreflang}
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            {l.label}
          </a>
        )
      )}
    </nav>
  )
}
