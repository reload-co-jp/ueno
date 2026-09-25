import Link from "next/link"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { Breadcrumb, BreadcrumbItem } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import type { MonthArchive } from "@/lib/archives"
import { eventListJsonLd, jsonLdString } from "@/lib/seo"
import { isEventArticle } from "@/lib/types"

export const archivePath = (basePath: string, archive: MonthArchive) =>
  `${basePath}/${archive.year}/${archive.month}`

// 月別アーカイブ一覧へのリンク。当月は今月の特集ページへ誘導する
export const MonthArchiveNav: FC<{
  archives: MonthArchive[]
  basePath: string
  currentPath: string
  heading: string
  current?: MonthArchive
}> = ({ archives, basePath, currentPath, heading, current }) => (
  <section>
    <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>{heading}</h2>
    <ul
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexWrap: "wrap",
        gap: ".5rem",
        fontSize: ".8125rem",
      }}
    >
      {archives.map((a) => (
        <li key={`${a.year}-${a.month}`}>
          {a === current ? (
            <span style={{ fontWeight: 700 }}>{a.label}</span>
          ) : (
            <Link
              href={a.isCurrent ? currentPath : archivePath(basePath, a)}
              style={{ color: "#c0483a" }}
            >
              {a.label}({a.articles.length}件)
            </Link>
          )}
        </li>
      ))}
    </ul>
  </section>
)

export const MonthArchivePage: FC<{
  archive: MonthArchive
  archives: MonthArchive[]
  heading: string
  lead: string
  breadcrumbItems: BreadcrumbItem[]
  basePath: string
  currentPath: string
  navHeading: string
}> = ({ archive, archives, heading, lead, breadcrumbItems, basePath, currentPath, navHeading }) => {
  const events = archive.articles.filter(isEventArticle)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {events.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdString(eventListJsonLd(heading, events)),
          }}
        />
      )}
      <Breadcrumb items={breadcrumbItems} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{heading}</h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        {lead}
      </p>
      <InArticleAd />
      <section>
        <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>
          {archive.label}の掲載一覧({archive.articles.length}件)
        </h2>
        <CardGrid>
          {archive.articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </CardGrid>
      </section>
      <MonthArchiveNav
        archives={archives}
        basePath={basePath}
        currentPath={currentPath}
        heading={navHeading}
        current={archive}
      />
      <RelatedLinks />
    </div>
  )
}
