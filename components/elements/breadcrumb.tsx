import { Link } from "@/components/elements/link"
import { FC } from "react"
import { getI18n } from "@/lib/i18n"
import { jsonLdString, pageUrl } from "@/lib/seo"

export interface BreadcrumbItem {
  label: string
  href?: string
}

// ホームは自動で先頭に付与。最後の要素は現在ページとしてリンクなし表示。
// hrefを省略した中間要素（対応一覧ページがないカテゴリ等）はテキストのみ表示。
export const Breadcrumb: FC<{ items: BreadcrumbItem[] }> = async ({
  items,
}) => {
  const { t, path } = await getI18n()
  const allItems: BreadcrumbItem[] = [
    { label: t({ ja: "ホーム", en: "Home", "zh-cn": "首页" }), href: "/" },
    ...items,
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    // Google仕様: 最後の要素以外は"item"必須。リンク先のない中間要素（対応一覧ページがないカテゴリ等）は
    // itemListElementから除外し、positionを振り直す（表示上のパンくずには残す）。
    itemListElement: allItems
      .filter((item, i) => item.href || i === allItems.length - 1)
      .map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.label,
        ...(item.href ? { item: pageUrl(path(item.href)) } : {}),
      })),
  }

  return (
    <nav
      aria-label={t({
        ja: "パンくずリスト",
        en: "Breadcrumb",
        "zh-cn": "面包屑导航",
      })}
      style={{ fontSize: ".75rem", color: "var(--secondary)", marginBottom: "1rem" }}
    >
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
              <Link
                href={item.href}
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
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
