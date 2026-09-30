import type { Metadata } from "next"
import { Link } from "@/components/elements/link"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import { getArticlesByCategory, getFutureEvents, getOngoingEvents } from "@/lib/data"
import { todayStr } from "@/lib/date"
import { getI18n, type Texts } from "@/lib/i18n"
import { eventListJsonLd, jsonLdString, pageMetadata } from "@/lib/seo"

const TITLES: Texts = { ja: "上野の展示・展覧会情報", en: "Exhibitions in Ueno", "zh-cn": "上野展览资讯" }

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

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getI18n()
  const { ongoing, future } = getExhibitions()
  return pageMetadata({
    title: t(TITLES),
    description: t({
      ja: `上野で開催中の展覧会${ongoing.length}件・開催予定${future.length}件を紹介。東京国立博物館・東京都美術館・国立西洋美術館・上野の森美術館など上野の美術館・博物館の展示会情報を会期つきでまとめている。`,
      en: `${ongoing.length} current and ${future.length} upcoming exhibitions in Ueno at the Tokyo National Museum, Tokyo Metropolitan Art Museum, National Museum of Western Art, Ueno Royal Museum and more, with exhibition periods.`,
      "zh-cn": `介绍上野正在举办的${ongoing.length}场展览及即将举办的${future.length}场展览。汇总东京国立博物馆、东京都美术馆、国立西洋美术馆、上野之森美术馆等上野美术馆・博物馆的展览信息，附展期。`,
    }),
    path: "/exhibitions",
  })
}

const sectionHeadingStyle = { fontSize: "1rem", margin: "0 0 .75rem" }

const Page: FC = async () => {
  const { locale, t } = await getI18n()
  const title = t(TITLES)
  const { ongoing, future, others } = getExhibitions()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {ongoing.length + future.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(eventListJsonLd(title, [...ongoing, ...future], locale)) }}
        />
      )}
      <Breadcrumb items={[{ label: t({ ja: "展示・アート", en: "Exhibitions", "zh-cn": "展览・艺术" }) }]} />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{title}</h1>
      <p style={{ fontSize: ".875rem", color: "#7a7468", margin: 0, lineHeight: 1.7 }}>
        {t({
          ja: (
            <>
              上野公園周辺の美術館・博物館で開催中・開催予定の展覧会をまとめて紹介。
              <Link href="/features/museums">上野の美術館まとめ</Link>や
              <Link href="/features/month-events">今月の上野イベント・展示会</Link>もあわせて確認できる。
            </>
          ),
          en: (
            <>
              Current and upcoming exhibitions at the art museums and museums around Ueno Park. See also{" "}
              <Link href="/features/museums">Ueno art museums</Link> and{" "}
              <Link href="/features/month-events">this month&apos;s events & exhibitions</Link>.
            </>
          ),
          "zh-cn": (
            <>
              汇总上野公园周边美术馆・博物馆正在举办及即将举办的展览。也可查看
              <Link href="/features/museums">上野美术馆汇总</Link>和
              <Link href="/features/month-events">本月上野活动・展览</Link>。
            </>
          ),
        })}
      </p>

      <InArticleAd />
      <section>
        <h2 style={sectionHeadingStyle}>
          {t({
            ja: `開催中の展示・展覧会(${ongoing.length}件)`,
            en: `Current exhibitions (${ongoing.length})`,
            "zh-cn": `正在举办的展览(${ongoing.length}场)`,
          })}
        </h2>
        {ongoing.length === 0 ? (
          <p style={{ color: "#999" }}>
            {t({ ja: "現在開催中の展示はない。", en: "No exhibitions are currently running.", "zh-cn": "目前没有正在举办的展览。" })}
          </p>
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
          <h2 style={sectionHeadingStyle}>
            {t({
              ja: `今後開催の展示・展覧会(${future.length}件)`,
              en: `Upcoming exhibitions (${future.length})`,
              "zh-cn": `即将举办的展览(${future.length}场)`,
            })}
          </h2>
          <CardGrid>
            {future.map((e) => (
              <ArticleCard key={e.id} article={e} />
            ))}
          </CardGrid>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <h2 style={sectionHeadingStyle}>
            {t({ ja: "その他の展示・アート記事", en: "More exhibition & art articles", "zh-cn": "其他展览・艺术文章" })}
          </h2>
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
