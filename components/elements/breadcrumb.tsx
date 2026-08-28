import Link from "next/link"
import { FC } from "react"
import { absoluteUrl, jsonLdString } from "@/lib/seo"

export interface BreadcrumbItem {
  label: string
  href?: string
}

// ホームは自動で先頭に付与。最後の要素は現在ページとしてリンクなし表示。
// hrefを省略した中間要素（対応一覧ページがないカテゴリ等）はテキストのみ表示。
export const Breadcrumb: FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const allItems: BreadcrumbItem[] = [{ label: "ホーム", href: "/" }, ...items]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  }

  return (
    <nav aria-label="パンくずリスト" style={{ fontSize: ".75rem", color: "#a39c8c", marginBottom: "1rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      {allItems.map((item, i) => {
        const isCurrent = i === allItems.length - 1
        return (
          <span key={i}>
            {i > 0 && <span style={{ margin: "0 .375rem" }}>/</span>}
            {item.href && !isCurrent ? (
              <Link href={item.href} style={{ color: "#c0483a", textDecoration: "none" }}>
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
