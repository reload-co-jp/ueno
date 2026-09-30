import { Link } from "@/components/elements/link"
import { FC, Fragment } from "react"
import { AdSlot } from "@/components/elements/ad-slot"
import { badgeStyle } from "@/components/elements/card"
import { formatDate } from "@/lib/date"
import { getLatestArticles } from "@/lib/data"
import { getI18n, type Texts } from "@/lib/i18n"
import { isEventArticle, type NewsArticle } from "@/lib/types"

// 一覧に広告を挟む間隔（記事数）
const AD_INTERVAL = 3

const FEATURES: { href: string; label: Texts }[] = [
  { href: "/features/this-week", label: { ja: "今週の上野", en: "This week in Ueno", "zh-cn": "本周上野" } },
  { href: "/features/gourmet-new-stores", label: { ja: "グルメ・カフェ新店", en: "New restaurants & cafés", "zh-cn": "美食・咖啡新店" } },
  { href: "/features/museums", label: { ja: "上野の美術館まとめ", en: "Ueno art museums", "zh-cn": "上野美术馆汇总" } },
  { href: "/features/today-events", label: { ja: "今日の上野イベント", en: "Today in Ueno", "zh-cn": "今日上野活动" } },
  { href: "/features/weekend-events", label: { ja: "今週末の上野イベント", en: "This weekend in Ueno", "zh-cn": "本周末上野活动" } },
  { href: "/features/month-events", label: { ja: "今月の上野イベント", en: "This month in Ueno", "zh-cn": "本月上野活动" } },
  { href: "/features/free-events", label: { ja: "上野の無料イベント", en: "Free events in Ueno", "zh-cn": "上野免费活动" } },
  { href: "/features/monthly-openings", label: { ja: "今月の新店舗", en: "New shops this month", "zh-cn": "本月新店" } },
  { href: "/features/ongoing-sales", label: { ja: "現在開催中のセール", en: "Ongoing sales", "zh-cn": "正在进行的促销" } },
]

// イベント記事は正規URLの /events/[id] へリンクする
const articleHref = (article: NewsArticle) =>
  isEventArticle(article) ? `/events/${article.id}` : `/articles/${article.id}`

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1.125rem",
  paddingBottom: ".5rem",
  marginBottom: "1.25rem",
  borderBottom: "0.1875rem solid #111",
}

const Page: FC = async () => {
  const i18n = await getI18n()
  const { locale, t } = i18n
  const [hero, ...rest] = getLatestArticles(12).map((a) => ({
    ...i18n.article(a),
    image: i18n.image(a),
  }))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {hero && (
        <section>
          <Link
            href={articleHref(hero)}
            style={{ display: "block", color: "#111", textDecoration: "none" }}
          >
            <img
              src={hero.image?.url ?? "/images/placeholder.jpg"}
              alt={hero.image?.alt ?? ""}
              style={{
                width: "100%",
                aspectRatio: "21 / 9",
                objectFit: "contain",
                borderRadius: ".5rem",
                marginBottom: "1.25rem",
              }}
            />
            <span style={badgeStyle}>{i18n.category(hero.category)}</span>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                lineHeight: 1.25,
                margin: ".5rem 0",
              }}
            >
              {hero.title}
            </h2>
            <p style={{ fontSize: ".875rem", color: "#666", margin: 0 }}>
              {formatDate(hero.publishedAt, locale)}
              {t({ ja: " ・ ", en: " · ", "zh-cn": " · " })}
              {hero.area}
            </p>
          </Link>
        </section>
      )}

      <AdSlot />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem" }}>
        <section style={{ flex: "3 1 22rem" }}>
          <h1 style={sectionTitleStyle}>
            {t({ ja: "上野の最新情報", en: "Latest News from Ueno", "zh-cn": "上野最新资讯" })}
          </h1>
          <div>
            {rest.map((article, i) => (
              <Fragment key={article.id}>
                {i > 0 && i % AD_INTERVAL === 0 && <AdSlot />}
                <Link
                  href={articleHref(article)}
                  style={{
                    display: "flex",
                    gap: "1.25rem",
                    padding: "1.25rem 0",
                    borderBottom: "1px solid #e5e5e5",
                    color: "#111",
                    textDecoration: "none",
                  }}
                >
                  <img
                    src={article.image?.url ?? "/images/placeholder.jpg"}
                    alt={article.image?.alt ?? ""}
                    style={{
                      width: "9rem",
                      aspectRatio: "4 / 3",
                      objectFit: "contain",
                      borderRadius: ".375rem",
                      flexShrink: 0,
                      maxHeight: "9rem",
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <span style={badgeStyle}>
                      {i18n.category(article.category)}
                    </span>
                    <h2
                      style={{
                        fontSize: "1.0625rem",
                        margin: ".125rem 0 .375rem",
                      }}
                    >
                      {article.title}
                    </h2>
                    <p
                      style={{
                        fontSize: ".875rem",
                        color: "#666",
                        margin: "0 0 .5rem",
                      }}
                    >
                      {article.summary}
                    </p>
                    <p style={{ fontSize: ".75rem", color: "#999", margin: 0 }}>
                      {formatDate(article.publishedAt, locale)}
                      {t({ ja: " ・ ", en: " · ", "zh-cn": " · " })}
                      {article.area}
                    </p>
                  </div>
                </Link>
              </Fragment>
            ))}
          </div>
        </section>

        <aside style={{ flex: "1 1 14rem" }}>
          <h2 style={sectionTitleStyle}>{t({ ja: "特集", en: "Features", "zh-cn": "专题" })}</h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}
          >
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="pill"
                style={{
                  display: "block",
                  background: "#f7e6e1",
                  borderRadius: ".5rem",
                  padding: ".75rem 1rem",
                  fontSize: ".875rem",
                  fontWeight: 800,
                  color: "#c0483a",
                  textDecoration: "none",
                }}
              >
                {t(f.label)}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Page
