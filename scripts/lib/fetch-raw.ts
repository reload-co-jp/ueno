import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import type { Source } from "./sources"

// スクレイピング対象への配慮
// - User-Agent明示、連続アクセス時は必ずインターバルを空ける (see scripts/1-scrape.ts)
// - 各サイトのrobots.txt / 利用規約の許諾範囲内でのみ収集する
export const USER_AGENT = "UenoNaviBot/1.0 (+https://example.com/about; contact: yamamoto@reload.co.jp)"

export interface RawRecord {
  sourceId: string
  sourceName: string
  url: string
  fetchedAt: string
  status: number | "error"
  html: string
  error?: string
}

const RAW_DIR = path.join(process.cwd(), "data", "raw")

export const fetchRaw = async (source: Source): Promise<RawRecord> => {
  const fetchedAt = new Date().toISOString()
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.5" },
    })
    const html = await res.text()
    return {
      sourceId: source.id,
      sourceName: source.name,
      url: source.url,
      fetchedAt,
      status: res.status,
      html,
    }
  } catch (err) {
    return {
      sourceId: source.id,
      sourceName: source.name,
      url: source.url,
      fetchedAt,
      status: "error",
      html: "",
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// 詳細ページ個別fetch用(一覧ページに画像が無いサイトで、記事詳細ページから画像を拾う場合等)。
// 保存はせず、取得失敗時は空文字列を返す。
export const fetchHtml = async (url: string): Promise<string> => {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.5" },
    })
    return await res.text()
  } catch {
    return ""
  }
}

export const saveRaw = async (record: RawRecord) => {
  const dir = path.join(RAW_DIR, record.sourceId)
  await mkdir(dir, { recursive: true })
  const filename = `${record.fetchedAt.replace(/[:.]/g, "-")}.json`
  const filePath = path.join(dir, filename)
  await writeFile(filePath, JSON.stringify(record, null, 2), "utf-8")
  return filePath
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
