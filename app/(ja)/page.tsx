import { Link } from "@/components/elements/link"
import { FC, ReactNode } from "react"
import { AdSlot } from "@/components/elements/ad-slot"
import { badgeStyle, CompactCard } from "@/components/elements/card"
import {
  daysUntil,
  formatDotDate,
  formatEventDay,
  formatEventSpan,
  toDateStr,
  todayStr,
} from "@/lib/date"
import {
  compareArticles,
  getArticleImage,
  getArticleSpotIds,
  getArticlesBySpot,
  getFutureEvents,
  getOngoingEvents,
  getSpot,
  getStore,
  news,
  spots,
} from "@/lib/data"
import { getEventFeature } from "@/lib/event-features"
import { getI18n } from "@/lib/i18n"
import { isEventArticle, type NewsArticle } from "@/lib/types"

type EventArticle = NewsArticle & { eventStartDate: string; eventEndDate: string }

// イベント記事は正規URLの /events/[id] へリンクする
const articleHref = (article: NewsArticle) =>
  isEventArticle(article) ? `/events/${article.id}` : `/articles/${article.id}`

const MUSEUM_TYPES = ["美術館", "博物館"]
const isArtEvent = (e: NewsArticle) =>
  e.category === "exhibition" ||
  getArticleSpotIds(e).some((id) => MUSEUM_TYPES.includes(getSpot(id)?.type ?? ""))

// カード列は画像ありを先に並べ、行内の高さを揃える(sortは安定なので元の順序は維持)
const imageFirst = (a: NewsArticle, b: NewsArticle) =>
  Number(!getArticleImage(a)) - Number(!getArticleImage(b))

const SectionHead: FC<{
  eyebrow: string
  title: string
  more?: { href: string; label: string }
}> = ({ eyebrow, title, more }) => (
  <div className="section-head">
    <div>
      <span className="eyebrow">{eyebrow}</span>
      <h2 style={{ fontSize: "1.5rem", lineHeight: 1.3 }}>{title}</h2>
    </div>
    {more && (
      <Link href={more.href} className="more">
        {more.label} →
      </Link>
    )}
  </div>
)

const Section: FC<{ id?: string; children: ReactNode }> = ({ id, children }) => (
  <section id={id} className="section">
    {children}
  </section>
)

const Page: FC = async () => {
  const i18n = await getI18n()
  const { locale, t } = i18n
  const today = todayStr()
  const sep = t({ ja: "・", en: " · ", "zh-cn": "・" })

  const todayFeature = getEventFeature("today", locale)
  const weekendFeature = getEventFeature("weekend", locale)
  const todayEvents = todayFeature.events.slice(0, 6)
  const tomorrowDate = new Date(`${today}T00:00:00`)
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = toDateStr(tomorrowDate)
  const tomorrowEvents = getOngoingEvents(tomorrow).slice(0, 6)
  const shownIds = new Set(todayEvents.map((e) => e.id))
  const weekendEvents = weekendFeature.events
    .filter((e) => !shownIds.has(e.id))
    .sort(imageFirst)
    .slice(0, 4)
  const upcoming = getFutureEvents(today).slice(0, 5)
  const art = [...getOngoingEvents(today), ...getFutureEvents(today)]
    .filter(isArtEvent)
    .sort(imageFirst)
    .slice(0, 4)
  const shops = news
    .filter((n) => n.category === "new_opening" || n.category === "popup")
    .sort(compareArticles)
    .sort(imageFirst)
    .slice(0, 8)
  const pickedSpots = spots.filter((s) => s.imageUrl).slice(0, 8)
  // 開催日の無いイベント・展示会記事もニュースには混ぜない(イベントとニュースの分離)
  const latestNews = news
    .filter((n) => !isEventArticle(n) && n.category !== "event" && n.category !== "exhibition")
    .sort(compareArticles)
    .slice(0, 8)

  const localized = <T extends NewsArticle>(a: T) => ({
    ...i18n.article(a),
    image: i18n.image(a),
  })

  // 「いつまで？」の補助表示。本日のみ / あとN日 / 〜MM/DD
  const remaining = (e: EventArticle, from = today) => {
    const days = daysUntil(e.eventEndDate, from)
    if (days <= 0) return t({ ja: "本日まで", en: "Ends today", "zh-cn": "今天结束" })
    if (days <= 7)
      return t({ ja: `あと${days}日`, en: `${days} days left`, "zh-cn": `还剩${days}天` })
    return formatEventSpan(e.eventStartDate, e.eventEndDate)
  }

  // 指定日に開催中のイベントを終了が近い順に並べた時系列リスト
  const eventRows = (events: EventArticle[], date: string, empty: string) =>
    events.length === 0 ? (
      <p style={{ color: "var(--secondary)", padding: "1rem 0" }}>{empty}</p>
    ) : (
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {events.map((original) => {
          const e = localized(original)
          return (
            <li key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <Link
                href={`/events/${e.id}`}
                className="row event-row"
                style={{
                  gap: "1rem",
                  padding: ".875rem 0",
                  color: "var(--text)",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: ".8125rem", fontWeight: 800, color: "var(--accent)" }}>
                  {remaining(original, date)}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={badgeStyle}>{i18n.category(e.category)}</span>
                  <span style={{ display: "block", fontWeight: 800, lineHeight: 1.4 }}>{e.title}</span>
                  <span style={{ display: "block", fontSize: ".75rem", color: "var(--secondary)" }}>
                    {e.eventLocation ?? e.area}
                  </span>
                </span>
                {e.image && (
                  <img
                    src={e.image.url}
                    alt={e.image.alt}
                    loading="lazy"
                    style={{ width: "5rem", aspectRatio: "1", objectFit: "cover", borderRadius: ".375rem" }}
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ol>
    )

  const eventCard = (original: EventArticle) => {
    const e = localized(original)
    return (
      <CompactCard
        key={e.id}
        href={`/events/${e.id}`}
        image={e.image}
        label={i18n.category(e.category)}
        title={e.title}
        meta={formatEventSpan(e.eventStartDate, e.eventEndDate)}
        note={e.eventLocation ?? e.area}
      />
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
      {/* Hero */}
      <section
        style={{
          background: "var(--text)",
          color: "#fff",
          borderRadius: ".75rem",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        <div>
          <p style={{ fontSize: ".8125rem", letterSpacing: ".12em", fontWeight: 700, opacity: 0.7 }}>
            {formatDotDate(today)} {formatEventDay(today).split(" ")[1]}
          </p>
          <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 2.75rem)", lineHeight: 1.2, margin: ".375rem 0 .5rem" }}>
            {t({ ja: "上野の「いま」を見つける。", en: "Find what's on in Ueno.", "zh-cn": "发现上野的「此刻」。" })}
          </h1>
          <p style={{ fontSize: ".875rem", opacity: 0.8 }}>
            {t({
              ja: "上野のイベント・展示・新店舗・スポットの最新情報",
              en: "Events, exhibitions, new shops and places in Ueno",
              "zh-cn": "上野的活动・展览・新店・景点最新资讯",
            })}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem", alignItems: "flex-start" }}>
          <p style={{ fontSize: ".75rem", fontWeight: 800, letterSpacing: ".12em" }}>
            {t({ ja: "今日の上野", en: "TODAY", "zh-cn": "今日上野" })}{" "}
            <span style={{ fontSize: "2rem", marginLeft: ".25rem" }}>{todayFeature.events.length}</span> EVENTS
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
            <Link href={todayFeature.path} className="btn primary">
              {t({ ja: "今日のイベントを見る", en: "Today's events", "zh-cn": "查看今日活动" })}
            </Link>
            <Link href={weekendFeature.path} className="btn" style={{ color: "#fff", borderColor: "#fff" }}>
              {t({ ja: "今週末を見る", en: "This weekend", "zh-cn": "查看本周末" })}
            </Link>
          </div>
        </div>
      </section>

      {/* 今日の上野 */}
      <Section>
        <SectionHead
          eyebrow="TODAY"
          title={t({ ja: "今日の上野", en: "Today in Ueno", "zh-cn": "今日上野" })}
          more={{
            href: todayFeature.path,
            label: t({ ja: "今日のイベントをすべて見る", en: "See all", "zh-cn": "查看全部" }),
          }}
        />
        <div className="tabs">
          <input type="radio" name="day" id="day-today" defaultChecked />
          <label htmlFor="day-today">{t({ ja: "今日", en: "Today", "zh-cn": "今天" })}</label>
          <input type="radio" name="day" id="day-tomorrow" />
          <label htmlFor="day-tomorrow">{t({ ja: "明日", en: "Tomorrow", "zh-cn": "明天" })}</label>
          <div className="tab-panel">{eventRows(todayEvents, today, todayFeature.emptyMessage)}</div>
          <div className="tab-panel">
            {eventRows(
              tomorrowEvents,
              tomorrow,
              t({ ja: "明日開催のイベントはない。", en: "No events tomorrow.", "zh-cn": "明天没有活动。" })
            )}
          </div>
        </div>
      </Section>

      {/* 今週末の上野 */}
      {weekendEvents.length > 0 && (
        <Section>
          <SectionHead
            eyebrow="THIS WEEKEND"
            title={t({ ja: "今週末の上野", en: "This Weekend in Ueno", "zh-cn": "本周末上野" })}
            more={{ href: weekendFeature.path, label: t({ ja: "もっと見る", en: "More", "zh-cn": "更多" }) }}
          />
          <div className="scroller">{weekendEvents.map(eventCard)}</div>
        </Section>
      )}

      <AdSlot />

      {/* 最新イベント(開催予定) */}
      {upcoming.length > 0 && (
        <Section>
          <SectionHead
            eyebrow="EVENT"
            title={t({ ja: "これからのイベント", en: "Upcoming Events", "zh-cn": "即将举办的活动" })}
            more={{ href: "/events", label: t({ ja: "イベントをもっと見る", en: "More events", "zh-cn": "更多活动" }) }}
          />
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {upcoming.map((original) => {
              const e = localized(original)
              return (
                <li key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <Link
                    href={`/events/${e.id}`}
                    className="row"
                    style={{
                      display: "flex",
                      gap: "1rem",
                      padding: ".75rem 0",
                      color: "var(--text)",
                      textDecoration: "none",
                    }}
                  >
                    <span style={{ flex: "0 0 5.5rem", fontSize: ".8125rem", fontWeight: 800, color: "var(--accent)" }}>
                      {formatEventDay(e.eventStartDate)}
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      {e.title}
                      <span style={{ display: "block", fontSize: ".75rem", fontWeight: 400, color: "var(--secondary)" }}>
                        {e.eventLocation ?? e.area}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      {/* 展示・アート */}
      {art.length > 0 && (
        <Section>
          <SectionHead
            eyebrow="ART & MUSEUM"
            title={t({ ja: "上野の美術館・博物館", en: "Ueno Museums & Exhibitions", "zh-cn": "上野美术馆・博物馆" })}
            more={{ href: "/exhibitions", label: t({ ja: "展示をもっと見る", en: "More exhibitions", "zh-cn": "更多展览" }) }}
          />
          <div className="scroller">
            {art.map((original) => {
              const e = localized(original)
              return (
                <CompactCard
                  key={e.id}
                  href={`/events/${e.id}`}
                  image={e.image}
                  label={i18n.category(e.category)}
                  title={e.title}
                  meta={`〜${formatEventDay(e.eventEndDate).split(" ")[0]}${
                    daysUntil(e.eventEndDate, today) <= 7 ? `（${remaining(original)}）` : ""
                  }`}
                  note={e.eventLocation ?? e.area}
                />
              )
            })}
          </div>
        </Section>
      )}

      {/* 新店舗・POP UP */}
      {shops.length > 0 && (
        <Section>
          <SectionHead
            eyebrow="NEW OPEN"
            title={t({ ja: "上野の新しいお店", en: "New Shops & Pop-ups", "zh-cn": "上野新店・快闪店" })}
            more={{ href: "/new-stores", label: t({ ja: "新店舗をもっと見る", en: "More shops", "zh-cn": "更多新店" }) }}
          />
          <div className="scroller">
            {shops.map((original) => {
              const a = localized(original)
              const openingDate = original.relatedStoreIds
                .map((id) => getStore(id)?.openingDate)
                .find(Boolean)
              const meta = isEventArticle(a)
                ? formatEventSpan(a.eventStartDate, a.eventEndDate)
                : openingDate
                  ? `${formatEventDay(openingDate).split(" ")[0]} OPEN`
                  : formatDotDate(a.publishedAt)
              return (
                <CompactCard
                  key={a.id}
                  href={articleHref(a)}
                  image={a.image}
                  label={i18n.category(a.category)}
                  title={a.title}
                  meta={meta}
                  note={a.area}
                />
              )
            })}
          </div>
        </Section>
      )}

      <AdSlot />

      {/* スポット */}
      {pickedSpots.length > 0 && (
        <Section>
          <SectionHead
            eyebrow="SPOTS"
            title={t({ ja: "上野のスポット", en: "Places in Ueno", "zh-cn": "上野景点" })}
            more={{ href: "/spots", label: t({ ja: "スポット一覧", en: "All places", "zh-cn": "全部景点" }) }}
          />
          <div className="scroller">
            {pickedSpots.map((original) => {
              const s = i18n.spot(original)
              const ongoing = getArticlesBySpot(s.id).filter(
                (a) => isEventArticle(a) && a.eventStartDate.slice(0, 10) <= today && today <= a.eventEndDate.slice(0, 10)
              ).length
              return (
                <CompactCard
                  key={s.id}
                  href={`/spots/${s.id}`}
                  image={s.imageUrl ? { url: s.imageUrl, alt: s.name } : null}
                  label={s.type}
                  title={s.name}
                  meta={
                    ongoing > 0
                      ? t({ ja: `開催中 ${ongoing}件`, en: `${ongoing} on now`, "zh-cn": `进行中 ${ongoing}项` })
                      : undefined
                  }
                  note={s.area}
                />
              )
            })}
          </div>
        </Section>
      )}

      {/* 上野ニュース */}
      <Section id="news">
        <SectionHead eyebrow="NEWS" title={t({ ja: "上野ニュース", en: "Ueno News", "zh-cn": "上野新闻" })} />
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {latestNews.map((original) => {
            const a = localized(original)
            return (
              <li key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <Link
                  href={articleHref(a)}
                  className="row"
                  style={{
                    display: "flex",
                    gap: "1rem",
                    padding: "1rem 0",
                    color: "var(--text)",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={badgeStyle}>{i18n.category(a.category)}</span>
                    <span style={{ display: "block", fontWeight: 800, lineHeight: 1.4 }}>{a.title}</span>
                    <span style={{ display: "block", fontSize: ".75rem", color: "var(--secondary)", marginTop: ".25rem" }}>
                      {formatDotDate(a.publishedAt)}
                      {sep}
                      {a.area}
                    </span>
                  </span>
                  {a.image && (
                    <img
                      src={a.image.url}
                      alt={a.image.alt}
                      loading="lazy"
                      style={{ width: "6rem", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: ".375rem", flexShrink: 0 }}
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </Section>
    </div>
  )
}

export default Page
