import type { Metadata } from "next"
import Link from "next/link"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { getArticlesByCategory, getFutureEvents, getOngoingEvents } from "@/lib/data"
import { todayStr } from "@/lib/date"
import { eventListJsonLd, jsonLdString, pageMetadata } from "@/lib/seo"

const title = "上野の展示・展覧会情報"

const getExhibitions = () => {
  const today = todayStr()
  const isExhibition = (e: { category: string }) => e.category === "exhibition"
  const ongoing = getOngoingEvents(today).filter(isExhibition)
  const future = getFutureEvents(today).filter(isExhibition)
  const listed = new Set([...ongoing, ...future].map((e) => e.id))
  // 終了済・会期情報なしの展示記事も検索流入資産としてリンクを残す
  const others = getArticlesByCategory("exhibition").filter((a) => !listed.has(a.id))
  return { ongoing, future, others }
}

export const generateMetadata = (): Metadata => {
  const { ongoing, future } = getExhibitions()
  return pageMetadata({
    title,
    description: `上野で開催中の展覧会${ongoing.length}件・開催予定${future.length}件を紹介。東京国立博物館・東京都美術館・国立西洋美術館・上野の森美術館など上野の美術館・博物館の展示会情報を会期つきでまとめている。`,
    path: "/exhibitions",
  })
}

const sectionHeadingStyle = { fontSize: "1rem", margin: "0 0 .75rem" }

const Page: FC = () => {
  const { ongoing, future, others } = getExhibitions()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {ongoing.length + future.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(eventListJsonLd(title, [...ongoing, ...future])) }}
        />
      )}
      <Breadcrumb items={[{ label: "展示・アート" }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{title}</h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        上野公園周辺の美術館・博物館で開催中・開催予定の展覧会をまとめて紹介。
        <Link href="/features/museums">上野の美術館まとめ</Link>や
        <Link href="/features/month-events">今月の上野イベント・展示会</Link>もあわせて確認できる。
      </p>

      <section>
        <h2 style={sectionHeadingStyle}>開催中の展示・展覧会({ongoing.length}件)</h2>
        {ongoing.length === 0 ? (
          <p style={{ color: "#999" }}>現在開催中の展示はない。</p>
        ) : (
          <CardGrid>
            {ongoing.map((e) => (
              <ArticleCard key={e.id} article={e} />
            ))}
          </CardGrid>
        )}
      </section>

      {future.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>今後開催の展示・展覧会({future.length}件)</h2>
          <CardGrid>
            {future.map((e) => (
              <ArticleCard key={e.id} article={e} />
            ))}
          </CardGrid>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>その他の展示・アート記事</h2>
          <CardGrid>
            {others.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        </section>
      )}

      <RelatedLinks current="/exhibitions" />
    </div>
  )
}

export default Page
