// README「3. 情報収集フロー」 Webサイト → スクレイピング → Rawデータ保存
// 実行: pnpm scrape [sourceId ...]（引数省略時は全ソース）
import { SOURCES } from "./lib/sources"
import { fetchRaw, saveRaw, sleep } from "./lib/fetch-raw"

const REQUEST_INTERVAL_MS = 2000 // 対象サイトへの負荷配慮

const main = async () => {
  const targetIds = process.argv.slice(2)
  const targets = targetIds.length
    ? SOURCES.filter((s) => targetIds.includes(s.id))
    : SOURCES

  if (targets.length === 0) {
    console.error("対象ソースが見つからない。指定idを確認。")
    process.exit(1)
  }

  console.log(`${targets.length}件のソースを収集する。`)

  for (const [i, source] of targets.entries()) {
    process.stdout.write(`[${i + 1}/${targets.length}] ${source.name} ... `)
    const record = await fetchRaw(source)
    const filePath = await saveRaw(record)
    if (record.status === "error") {
      console.log(`失敗 (${record.error})`)
    } else {
      console.log(`${record.status} -> ${filePath}`)
    }
    if (i < targets.length - 1) await sleep(REQUEST_INTERVAL_MS)
  }
}

main()
