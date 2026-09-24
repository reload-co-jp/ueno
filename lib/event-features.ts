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
  formatDateJp,
  formatDayPairJp,
  formatMonthJp,
  formatShortRangeJp,
  nextWeekRange,
  thisMonthRange,
  thisWeekendRange,
  todayStr,
} from "@/lib/date"

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

export const getEventFeature = (key: EventFeatureKey): EventFeature => {
  const today = todayStr()
  switch (key) {
    case "today": {
      const date = formatDateJp(today)
      const events = getOngoingEvents(today)
      return {
        key,
        path: "/features/today-events",
        label: "今日の上野イベント",
        title: `上野の今日のイベント｜${date}`,
        heading: `${date}の上野イベント`,
        description: `${date}に上野で開催中のイベント${events.length}件を紹介。上野公園・上野駅・御徒町周辺の展示会・マルシェ・催し物を開催日時・会場・料金つきで毎日更新。`,
        lead: "上野公園・上野駅・御徒町駅周辺で本日開催中のイベントを、開催日時・会場・料金とあわせてまとめている。毎日更新。",
        emptyMessage: "本日開催中のイベントはない。",
        events,
      }
    }
    case "weekend": {
      const { start, end } = thisWeekendRange()
      const dates = formatDayPairJp(start, end)
      const events = sortBySchedule(getEventsInRange(start, end))
      return {
        key,
        path: "/features/weekend-events",
        label: "今週末の上野イベント",
        title: `上野の今週末イベント｜${dates}`,
        heading: `今週末(${dates})の上野イベント`,
        description: `${dates}の週末に上野で開催されるイベント${events.length}件を紹介。上野公園・美術館・博物館の展示やマルシェなど、土日のお出かけ先探しに。`,
        lead: "今週末に上野エリアで開催されるイベント・展示をまとめている。土日のお出かけ先探しに活用できる。",
        emptyMessage: "今週末開催のイベントはない。",
        events,
      }
    }
    case "next-week": {
      const { start, end } = nextWeekRange()
      const range = formatShortRangeJp(start, end)
      const events = sortBySchedule(getEventsInRange(start, end))
      return {
        key,
        path: "/features/next-week-events",
        label: "来週の上野イベント",
        title: `上野の来週のイベント｜${range}`,
        heading: `来週(${range})の上野イベント`,
        description: `${range}に上野で開催されるイベント${events.length}件を紹介。上野公園・美術館・博物館の展示や催し物の予定を事前にチェックできる。`,
        lead: "来週上野エリアで開催予定・開催中のイベントをまとめている。予定を立てる際に活用できる。",
        emptyMessage: "来週開催のイベントはない。",
        events,
      }
    }
    case "month": {
      const { start, end } = thisMonthRange()
      const month = formatMonthJp(start)
      const events = sortBySchedule(getEventsInRange(start, end))
      return {
        key,
        path: "/features/month-events",
        label: "今月の上野イベント",
        title: `${month}の上野イベント・展示会`,
        heading: `${month}の上野イベント・展示会`,
        description: `${month}に上野で開催されるイベント・展示会${events.length}件を紹介。上野公園・東京国立博物館・東京都美術館などの展覧会や催し物を開催日時・会場つきでまとめている。`,
        lead: `${month}に上野エリアで開催中・開催予定のイベントと展示会をまとめている。`,
        emptyMessage: `${month}開催のイベントはない。`,
        events,
      }
    }
    case "free": {
      const events = [
        ...getOngoingEvents(today),
        ...getFutureEvents(today),
      ].filter(isFreeEvent)
      return {
        key,
        path: "/features/free-events",
        label: "上野の無料イベント",
        title: "上野の無料イベント",
        heading: "上野の無料イベント",
        description: `上野で開催中・開催予定の入場無料・参加無料イベント${events.length}件を紹介。上野公園のマルシェや無料で楽しめる催し物を開催日時・会場つきでまとめている。`,
        lead: "上野エリアで開催中・開催予定のイベントのうち、入場無料・参加無料のものをまとめている。",
        emptyMessage: "現在開催予定の無料イベントはない。",
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
