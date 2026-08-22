// 特集ページ(週/週末/月)の日付レンジ計算
const pad = (n: number) => String(n).padStart(2, "0")

export const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const todayStr = () => toDateStr(new Date())

export const thisWeekRange = () => {
  const now = new Date()
  const day = now.getDay() // 0=日
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: toDateStr(monday), end: toDateStr(sunday) }
}

export const thisWeekendRange = () => {
  const now = new Date()
  const day = now.getDay()
  const saturday = new Date(now)
  saturday.setDate(now.getDate() + ((6 - day + 7) % 7))
  const sunday = new Date(saturday)
  sunday.setDate(saturday.getDate() + 1)
  return { start: toDateStr(saturday), end: toDateStr(sunday) }
}

export const thisMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { start: toDateStr(start), end: toDateStr(end) }
}

export const formatDateJp = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export const formatDateRangeJp = (startIso: string, endIso: string) => {
  if (startIso === endIso) return formatDateJp(startIso)
  return `${formatDateJp(startIso)}〜${formatDateJp(endIso)}`
}
