import { Link } from "@/components/elements/link"
import { FC, ReactNode } from "react"
import { AdSlot } from "@/components/elements/ad-slot"
import { CompactCard, Media } from "@/components/elements/card"
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
      <h2>{title}</h2>
    </div>
    {more && (
      <Link href={more.href} className="more">
        {more.label} →
      </Link>
    )}
  </div>
)

const Section: FC<{ id?: string; className?: string; children: ReactNode }> = ({
  id,
  className,
  children,
}) => (
  <section id={id} className={`section ${className ?? ""}`}>
    {children}
  </section>
)

// ファーストビューの写真(既存のスポット画像を使用)
const HERO_SPOT_IDS = ["nmwa", "ueno-zoo", "tobikan"]

const Page: FC = async () => {
  const i18n = await getI18n()
  const { locale, t } = i18n
  const today = todayStr()
  const seeAll = t({ ja: "すべて見る", en: "See all", "zh-cn": "查看全部" })

  const todayFeature = getEventFeature("today", locale)
  const weekendFeature = getEventFeature("weekend", locale)
  const tomorrowDate = new Date(`${today}T00:00:00`)
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = toDateStr(tomorrowDate)
  const tomorrowEvents = getOngoingEvents(tomorrow).slice(0, 6)
  const weekendEvents = weekendFeature.events.slice(0, 6)
  const featuredEvent =
    todayFeature.events.find((e) => getArticleImage(e)) ??
    todayFeature.events[0] ??
    getFutureEvents(today)[0]
  // 注目枠に出した記事はリストで繰り返さない
  const todayEvents = todayFeature.events.filter((e) => e !== featuredEvent).slice(0, 6)
  const art = [...getOngoingEvents(today), ...getFutureEvents(today)]
    .filter(isArtEvent)
    .sort(imageFirst)
    .slice(0, 4)
  const shops = news
    .filter((n) => n.category === "new_opening" || n.category === "popup")
    .sort(compareArticles)
    .sort(imageFirst)
    .slice(0, 5)
  const heroSpots = HERO_SPOT_IDS.map(getSpot)
    .filter((s) => s?.imageUrl)
    .map((s) => i18n.spot(s!))
  const pickedSpots = spots
    .filter((s) => s.imageUrl && !HERO_SPOT_IDS.includes(s.id))
    .slice(0, 8)
  // 開催日の無いイベント・展示会記事もニュースには混ぜない(イベントとニュースの分離)
  const latestNews = news
    .filter((n) => !isEventArticle(n) && n.category !== "event" && n.category !== "exhibition")
    .sort(compareArticles)
    .slice(0, 7)
  const featuredNews = latestNews.find((n) => getArticleImage(n)) ?? latestNews[0]
  const otherNews = latestNews.filter((n) => n !== featuredNews).slice(0, 6)

  const localized = <T extends NewsArticle>(a: T) => ({
    ...i18n.article(a),
    image: i18n.image(a),
  })

  // 開催状況はデータ(開始日・終了日)からのみ判定する
  const status = (e: EventArticle, date: string) => {
    const start = e.eventStartDate.slice(0, 10)
    const end = e.eventEndDate.slice(0, 10)
    const isToday = date === today
    if (start === date && end === date)
      return t({ ja: "1日限り", en: "One day only", "zh-cn": "仅限一天" })
    if (end === date)
      return isToday
        ? t({ ja: "本日終了", en: "Ends today", "zh-cn": "今天结束" })
        : t({ ja: "明日終了", en: "Ends tomorrow", "zh-cn": "明天结束" })
    if (start === date)
      return isToday
        ? t({ ja: "本日開始", en: "Starts today", "zh-cn": "今天开始" })
        : t({ ja: "明日開始", en: "Starts tomorrow", "zh-cn": "明天开始" })
    const days = daysUntil(end, date)
    if (days <= 7)
      return t({ ja: `開催中・あと${days}日`, en: `On now · ${days} days left`, "zh-cn": `进行中・还剩${days}天` })
    return t({ ja: "開催中", en: "On now", "zh-cn": "进行中" })
  }

  const eventRows = (events: EventArticle[], label: (e: EventArticle) => string, empty: string) =>
    events.length === 0 ? (
      <p style={{ color: "var(--secondary)", padding: "1.5rem 0" }}>{empty}</p>
    ) : (
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {events.map((original) => {
          const e = localized(original)
          return (
            <li key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <Link href={`/events/${e.id}`} className="row event-row">
                <span className="event-when">
                  <span className="tag">{label(original)}</span>
                  {formatEventSpan(e.eventStartDate, e.eventEndDate)}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span className="card-label">{i18n.category(e.category)}</span>
                  <span className="row-title">{e.title}</span>
                  <span className="card-meta" style={{ display: "block" }}>
                    {e.eventLocation ?? e.area}
                  </span>
                </span>
                {e.image ? (
                  <img src={e.image.url} alt={e.image.alt} width={88} height={88} loading="lazy" decoding="async" />
                ) : (
                  <span />
                )}
              </Link>
            </li>
          )
        })}
      </ol>
    )

  const fe = featuredEvent && localized(featuredEvent)

  return (
    <div className="top-sections">
      {/* ファーストビュー */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div>
            <p className="hero-date">
              {formatDotDate(today)} {formatEventDay(today).split(" ")[1]} — UENO, TOKYO
            </p>
            <h1 id="hero-title">
              {t<ReactNode>({
                ja: (
                  <>
                    <span>上野の「いま」を、</span>
                    <span>歩こう。</span>
                  </>
                ),
                en: "Walk Ueno, as it is now.",
                "zh-cn": "漫步上野的「此刻」。",
              })}
            </h1>
            <p className="hero-lead">
              {t({
                ja: "美術館の企画展から、アメ横の新しいお店まで。上野の街のイベント・新店舗・文化施設の最新情報を届けるローカルマガジン。",
                en: "From museum exhibitions to new shops in Ameyoko — the latest events, openings and culture in Ueno.",
                "zh-cn": "从美术馆特展到阿美横的新店，为你带来上野的活动・新店・文化设施最新资讯。",
              })}
            </p>
          </div>
          <ul className="hero-links">
            <li>
              <Link href={todayFeature.path}>
                <span>
                  {t({ ja: "今日のイベント", en: "Today's events", "zh-cn": "今日活动" })}
                  <strong>{todayFeature.events.length}</strong>
                  <small>{t({ ja: "件開催中", en: "on now", "zh-cn": "项进行中" })}</small>
                </span>
              </Link>
            </li>
            <li>
              <Link href={weekendFeature.path}>
                <span>
                  {t({ ja: "今週末のイベント", en: "This weekend", "zh-cn": "本周末活动" })}
                  <strong>{weekendFeature.events.length}</strong>
                  <small>{t({ ja: "件", en: "events", "zh-cn": "项" })}</small>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/new-stores">{t({ ja: "新しいお店", en: "New shops", "zh-cn": "新店" })}</Link>
            </li>
            <li>
              <Link href="/features/museums">
                {t({ ja: "美術館・博物館", en: "Museums", "zh-cn": "美术馆・博物馆" })}
              </Link>
            </li>
          </ul>
        </div>
        <div className="hero-photos">
          {heroSpots.length > 0 ? (
            heroSpots.map((s, i) => (
              <figure key={s.id}>
                <img
                  src={s.imageUrl!}
                  alt={s.name}
                  loading="eager"
                  fetchPriority={i === 0 ? "high" : undefined}
                  decoding="async"
                />
                <figcaption>{s.name}</figcaption>
              </figure>
            ))
          ) : (
            <figure>
              <img src="/images/brand.jpeg" alt="" />
            </figure>
          )}
        </div>
      </section>

      {/* イベント: 今日・明日・今週末 */}
      <Section>
        <SectionHead
          eyebrow="EVENTS"
          title={t({ ja: "今日・明日・今週末のイベント", en: "Events: Today, Tomorrow & This Weekend", "zh-cn": "今天・明天・本周末的活动" })}
          more={{ href: "/events", label: seeAll }}
        />
        <div className="events-layout">
          {fe && featuredEvent && (
            <Link href={`/events/${fe.id}`} className="card feature-card">
              <Media
                image={fe.image}
                fallback={i18n.category(fe.category)}
                badge={<span className="tag solid">PICK UP</span>}
              />
              <div className="card-body" style={{ paddingTop: "1.25rem" }}>
                <span className="card-date" style={{ fontSize: ".9375rem" }}>
                  {formatEventSpan(fe.eventStartDate, fe.eventEndDate)}
                  <span className="tag" style={{ marginLeft: ".75rem", verticalAlign: "middle" }}>
                    {status(featuredEvent, today)}
                  </span>
                </span>
                <h3 className="card-title">{fe.title}</h3>
                <p className="card-summary">{fe.summary}</p>
                <p className="card-meta">{fe.eventLocation ?? fe.area}</p>
              </div>
            </Link>
          )}
          <div className="tabs">
            <input type="radio" name="day" id="day-today" defaultChecked />
            <label htmlFor="day-today">{t({ ja: "今日", en: "Today", "zh-cn": "今天" })}</label>
            <input type="radio" name="day" id="day-tomorrow" />
            <label htmlFor="day-tomorrow">{t({ ja: "明日", en: "Tomorrow", "zh-cn": "明天" })}</label>
            <input type="radio" name="day" id="day-weekend" />
            <label htmlFor="day-weekend">{t({ ja: "今週末", en: "This weekend", "zh-cn": "本周末" })}</label>
            <div className="tab-panel">
              {eventRows(todayEvents, (e) => status(e, today), todayFeature.emptyMessage)}
            </div>
            <div className="tab-panel">
              {eventRows(
                tomorrowEvents,
                (e) => status(e, tomorrow),
                t({ ja: "明日開催のイベントはない。", en: "No events tomorrow.", "zh-cn": "明天没有活动。" })
              )}
            </div>
            <div className="tab-panel">
              {eventRows(
                weekendEvents,
                () => t({ ja: "今週末", en: "Weekend", "zh-cn": "本周末" }),
                weekendFeature.emptyMessage
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* 新店舗・期間限定ショップ */}
      {shops.length > 0 && (
        <Section>
          <SectionHead
            eyebrow="NEW OPEN & POP UP"
            title={t({ ja: "上野の新しいお店", en: "New Shops & Pop-ups", "zh-cn": "上野新店・快闪店" })}
            more={{ href: "/new-stores", label: seeAll }}
          />
          <div className="mosaic">
            {shops.map((original) => {
              const a = localized(original)
              const store = original.relatedStoreIds.map(getStore).find(Boolean)
              const openingDate = original.relatedStoreIds
                .map((id) => getStore(id)?.openingDate)
                .find(Boolean)
              const isPopup = original.category === "popup"
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
                  label={[i18n.category(a.category), store && i18n.store(store).category]
                    .filter(Boolean)
                    .join(" / ")}
                  title={a.title}
                  meta={meta}
                  note={a.area}
                  badge={
                    <span className={isPopup ? "tag solid" : "tag solid green"}>
                      {isPopup
                        ? t({ ja: "期間限定", en: "Pop-up", "zh-cn": "期间限定" })
                        : "NEW OPEN"}
                    </span>
                  }
                />
              )
            })}
          </div>
        </Section>
      )}

      <AdSlot />

      {/* 美術館・博物館・文化イベント */}
      {art.length > 0 && (
        <Section className="band">
          <SectionHead
            eyebrow="ART & MUSEUM"
            title={t({ ja: "美術館・博物館・文化イベント", en: "Museums & Culture", "zh-cn": "美术馆・博物馆・文化活动" })}
            more={{ href: "/exhibitions", label: seeAll }}
          />
          <div className="h-cards">
            {art.map((original) => {
              const e = localized(original)
              const days = daysUntil(e.eventEndDate, today)
              return (
                <CompactCard
                  key={e.id}
                  href={`/events/${e.id}`}
                  image={e.image}
                  label={e.eventLocation ?? e.area}
                  title={e.title}
                  meta={`${formatEventSpan(e.eventStartDate, e.eventEndDate)}${
                    e.eventStartDate.slice(0, 10) > today || days > 7
                      ? ""
                      : days === 0
                        ? t({ ja: "（本日終了）", en: " (ends today)", "zh-cn": "（今天结束）" })
                        : t({ ja: `（あと${days}日）`, en: ` (${days} days left)`, "zh-cn": `（还剩${days}天）` })
                  }`}
                  note={i18n.category(e.category)}
                />
              )
            })}
          </div>
        </Section>
      )}

      {/* おすすめスポット */}
      {pickedSpots.length > 0 && (
        <Section>
          <SectionHead
            eyebrow="PLACES"
            title={t({ ja: "上野のおすすめスポット", en: "Places to Visit in Ueno", "zh-cn": "上野推荐景点" })}
            more={{ href: "/spots", label: seeAll }}
          />
          <div className="spot-grid">
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
                  label={`${s.type} — ${s.area}`}
                  title={s.name}
                  meta={
                    ongoing > 0
                      ? t({ ja: `開催中 ${ongoing}件`, en: `${ongoing} on now`, "zh-cn": `进行中 ${ongoing}项` })
                      : undefined
                  }
                />
              )
            })}
          </div>
        </Section>
      )}

      {/* 最新ニュース */}
      {featuredNews && (
        <Section id="news">
          <SectionHead eyebrow="NEWS" title={t({ ja: "最新ニュース", en: "Latest News", "zh-cn": "最新新闻" })} />
          <div className="news-layout">
            {(() => {
              const a = localized(featuredNews)
              return (
                <CompactCard
                  href={articleHref(a)}
                  image={a.image}
                  label={i18n.category(a.category)}
                  title={a.title}
                  meta={formatDotDate(a.publishedAt)}
                  note={a.summary}
                  className="feature-card"
                />
              )
            })()}
            <ul className="news-list">
              {otherNews.map((original) => {
                const a = localized(original)
                return (
                  <li key={a.id}>
                    <Link href={articleHref(a)} className="row">
                      <time dateTime={a.publishedAt.slice(0, 10)}>{formatDotDate(a.publishedAt)}</time>
                      <span className="card-label">{i18n.category(a.category)}</span>
                      <span className="row-title">{a.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </Section>
      )}
    </div>
  )
}

export default Page
