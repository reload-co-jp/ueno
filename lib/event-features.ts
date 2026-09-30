// 「上野 今日 イベント」「上野 今週末 イベント」等の検索意図別イベント特集ページ定義。
// ページ本体とsitemapで共有し、該当イベントが無い日は noindex + sitemap除外にする
import {
  compareEventsBySchedule,
  getEventsInRange,
  getEventsOnDate,
  getOngoingEvents,
  getFutureEvents,
  isFreeEvent,
} from "@/lib/data"
import {
  formatDate,
  formatDayPair,
  formatMonth,
  formatShortRange,
  nextWeekRange,
  thisMonthRange,
  thisWeekendRange,
  todayStr,
} from "@/lib/date"
import type { Locale, Texts } from "@/lib/i18n"

export type EventFeatureKey =
  "today" | "weekend" | "next-week" | "month" | "free"

export interface EventFeature {
  key: EventFeatureKey
  path: string
  // 内部リンク・パンくず用の短い名称
  label: string
  title: string
  heading: string
  description: string
  lead: string
  emptyMessage: string
  events: ReturnType<typeof getEventsOnDate>
}

const sortBySchedule = (events: ReturnType<typeof getEventsOnDate>) => {
  const today = todayStr()
  return [...events].sort((a, b) => compareEventsBySchedule(a, b, today))
}

export const getEventFeature = (key: EventFeatureKey, locale: Locale = "ja"): EventFeature => {
  const today = todayStr()
  const t = <T>(texts: Texts<T>) => texts[locale]
  switch (key) {
    case "today": {
      const date = formatDate(today, locale)
      const events = getOngoingEvents(today)
      const n = events.length
      return {
        key,
        path: "/features/today-events",
        label: t({ ja: "今日の上野イベント", en: "Today in Ueno", "zh-cn": "今日上野活动" }),
        title: t({
          ja: `上野の今日のイベント｜${date}`,
          en: `Events in Ueno Today | ${date}`,
          "zh-cn": `上野今日活动｜${date}`,
        }),
        heading: t({ ja: `${date}の上野イベント`, en: `Ueno Events on ${date}`, "zh-cn": `${date}上野活动` }),
        description: t({
          ja: `${date}に上野で開催中のイベント${n}件を紹介。上野公園・上野駅・御徒町周辺の展示会・マルシェ・催し物を開催日時・会場・料金つきで毎日更新。`,
          en: `${n} events happening in Ueno on ${date}. Exhibitions, markets and events around Ueno Park, Ueno Station and Okachimachi with dates, venues and admission, updated daily.`,
          "zh-cn": `介绍${date}在上野举办的${n}场活动。上野公园、上野站、御徒町周边的展览、市集等活动，附举办时间、会场及费用，每日更新。`,
        }),
        lead: t({
          ja: "上野公園・上野駅・御徒町駅周辺で本日開催中のイベントを、開催日時・会場・料金とあわせてまとめている。毎日更新。",
          en: "Events happening today around Ueno Park, Ueno Station and Okachimachi Station, with dates, venues and admission. Updated daily.",
          "zh-cn": "汇总今天在上野公园、上野站、御徒町站周边举办的活动，附举办时间、会场及费用。每日更新。",
        }),
        emptyMessage: t({
          ja: "本日開催中のイベントはない。",
          en: "No events today.",
          "zh-cn": "今天没有正在举办的活动。",
        }),
        events,
      }
    }
    case "weekend": {
      const { start, end } = thisWeekendRange()
      const dates = formatDayPair(start, end, locale)
      const events = sortBySchedule(getEventsInRange(start, end))
      const n = events.length
      return {
        key,
        path: "/features/weekend-events",
        label: t({ ja: "今週末の上野イベント", en: "This Weekend in Ueno", "zh-cn": "本周末上野活动" }),
        title: t({
          ja: `上野の今週末イベント｜${dates}`,
          en: `Events in Ueno This Weekend | ${dates}`,
          "zh-cn": `上野本周末活动｜${dates}`,
        }),
        heading: t({
          ja: `今週末(${dates})の上野イベント`,
          en: `Ueno Events This Weekend (${dates})`,
          "zh-cn": `本周末(${dates})上野活动`,
        }),
        description: t({
          ja: `${dates}の週末に上野で開催されるイベント${n}件を紹介。上野公園・美術館・博物館の展示やマルシェなど、土日のお出かけ先探しに。`,
          en: `${n} events in Ueno on the weekend of ${dates}. Exhibitions at Ueno Park's museums, markets and more for your weekend plans.`,
          "zh-cn": `介绍${dates}周末在上野举办的${n}场活动。上野公园、美术馆、博物馆的展览及市集等，周末出行好去处。`,
        }),
        lead: t({
          ja: "今週末に上野エリアで開催されるイベント・展示をまとめている。土日のお出かけ先探しに活用できる。",
          en: "Events and exhibitions in the Ueno area this weekend. Handy for planning your weekend outing.",
          "zh-cn": "汇总本周末在上野地区举办的活动与展览，方便规划周末出行。",
        }),
        emptyMessage: t({
          ja: "今週末開催のイベントはない。",
          en: "No events this weekend.",
          "zh-cn": "本周末没有活动。",
        }),
        events,
      }
    }
    case "next-week": {
      const { start, end } = nextWeekRange()
      const range = formatShortRange(start, end, locale)
      const events = sortBySchedule(getEventsInRange(start, end))
      const n = events.length
      return {
        key,
        path: "/features/next-week-events",
        label: t({ ja: "来週の上野イベント", en: "Next Week in Ueno", "zh-cn": "下周上野活动" }),
        title: t({
          ja: `上野の来週のイベント｜${range}`,
          en: `Events in Ueno Next Week | ${range}`,
          "zh-cn": `上野下周活动｜${range}`,
        }),
        heading: t({
          ja: `来週(${range})の上野イベント`,
          en: `Ueno Events Next Week (${range})`,
          "zh-cn": `下周(${range})上野活动`,
        }),
        description: t({
          ja: `${range}に上野で開催されるイベント${n}件を紹介。上野公園・美術館・博物館の展示や催し物の予定を事前にチェックできる。`,
          en: `${n} events in Ueno from ${range}. Check upcoming exhibitions and events at Ueno Park and its museums in advance.`,
          "zh-cn": `介绍${range}在上野举办的${n}场活动。提前了解上野公园、美术馆、博物馆的展览及活动安排。`,
        }),
        lead: t({
          ja: "来週上野エリアで開催予定・開催中のイベントをまとめている。予定を立てる際に活用できる。",
          en: "Events scheduled or running in the Ueno area next week. Useful for making plans.",
          "zh-cn": "汇总下周在上野地区举办或即将举办的活动，方便安排行程。",
        }),
        emptyMessage: t({
          ja: "来週開催のイベントはない。",
          en: "No events next week.",
          "zh-cn": "下周没有活动。",
        }),
        events,
      }
    }
    case "month": {
      const { start, end } = thisMonthRange()
      const month = formatMonth(start, locale)
      const events = sortBySchedule(getEventsInRange(start, end))
      const n = events.length
      return {
        key,
        path: "/features/month-events",
        label: t({ ja: "今月の上野イベント", en: "This Month in Ueno", "zh-cn": "本月上野活动" }),
        title: t({
          ja: `${month}の上野イベント・展示会`,
          en: `Ueno Events & Exhibitions in ${month}`,
          "zh-cn": `${month}上野活动・展览`,
        }),
        heading: t({
          ja: `${month}の上野イベント・展示会`,
          en: `Ueno Events & Exhibitions in ${month}`,
          "zh-cn": `${month}上野活动・展览`,
        }),
        description: t({
          ja: `${month}に上野で開催されるイベント・展示会${n}件を紹介。上野公園・東京国立博物館・東京都美術館などの展覧会や催し物を開催日時・会場つきでまとめている。`,
          en: `${n} events and exhibitions in Ueno in ${month}, including shows at Ueno Park, the Tokyo National Museum and the Tokyo Metropolitan Art Museum, with dates and venues.`,
          "zh-cn": `介绍${month}在上野举办的${n}场活动・展览。汇总上野公园、东京国立博物馆、东京都美术馆等地的展览与活动，附举办时间及会场。`,
        }),
        lead: t({
          ja: `${month}に上野エリアで開催中・開催予定のイベントと展示会をまとめている。`,
          en: `Current and upcoming events and exhibitions in the Ueno area in ${month}.`,
          "zh-cn": `汇总${month}在上野地区正在举办及即将举办的活动与展览。`,
        }),
        emptyMessage: t({
          ja: `${month}開催のイベントはない。`,
          en: `No events in ${month}.`,
          "zh-cn": `${month}没有活动。`,
        }),
        events,
      }
    }
    case "free": {
      const events = [...getOngoingEvents(today), ...getFutureEvents(today)].filter(isFreeEvent)
      const n = events.length
      const title = t({ ja: "上野の無料イベント", en: "Free Events in Ueno", "zh-cn": "上野免费活动" })
      return {
        key,
        path: "/features/free-events",
        label: title,
        title,
        heading: title,
        description: t({
          ja: `上野で開催中・開催予定の入場無料・参加無料イベント${n}件を紹介。上野公園のマルシェや無料で楽しめる催し物を開催日時・会場つきでまとめている。`,
          en: `${n} current and upcoming free events in Ueno, from markets in Ueno Park to other free activities, with dates and venues.`,
          "zh-cn": `介绍上野正在举办及即将举办的${n}场免费活动。汇总上野公园市集等可免费参与的活动，附举办时间及会场。`,
        }),
        lead: t({
          ja: "上野エリアで開催中・開催予定のイベントのうち、入場無料・参加無料のものをまとめている。",
          en: "Free-admission events currently running or coming up in the Ueno area.",
          "zh-cn": "汇总上野地区正在举办及即将举办的活动中可免费入场・参与的活动。",
        }),
        emptyMessage: t({
          ja: "現在開催予定の無料イベントはない。",
          en: "No free events are currently scheduled.",
          "zh-cn": "目前没有免费活动。",
        }),
        events,
      }
    }
  }
}

export const EVENT_FEATURE_KEYS: EventFeatureKey[] = [
  "today",
  "weekend",
  "next-week",
  "month",
  "free",
]
