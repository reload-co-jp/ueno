// README「3. 情報収集フロー」 Rawデータ保存 → 情報抽出
// 実行: pnpm extract [sourceId ...]
import { existsSync } from "node:fs"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { extractFromHtml } from "./lib/extract"
import type { RawRecord } from "./lib/fetch-raw"
import { getSource, SOURCES } from "./lib/sources"

const RAW_DIR = path.join(process.cwd(), "data", "raw")
const EXTRACTED_DIR = path.join(process.cwd(), "data", "extracted")

const main = async () => {
  const targetIds = process.argv.slice(2)
  const sourceIds = targetIds.length ? targetIds : SOURCES.map((s) => s.id)

  for (const sourceId of sourceIds) {
    const rawDir = path.join(RAW_DIR, sourceId)
    if (!existsSync(rawDir)) continue

    const files = (await readdir(rawDir)).filter((f) => f.endsWith(".json"))
    const outDir = path.join(EXTRACTED_DIR, sourceId)
    await mkdir(outDir, { recursive: true })

    for (const file of files) {
      const outPath = path.join(outDir, file)
      if (existsSync(outPath)) continue // 抽出済みはスキップ

      const raw: RawRecord = JSON.parse(await readFile(path.join(rawDir, file), "utf-8"))
      if (raw.status !== 200 || !raw.html) continue

      const source = getSource(sourceId)
      if (!source) continue

      process.stdout.write(`抽出中: ${raw.sourceName} (${file}) ... `)
      const items = await extractFromHtml(source, raw.html)
      await writeFile(
        outPath,
        JSON.stringify(
          { sourceId, sourceName: raw.sourceName, url: raw.url, fetchedAt: raw.fetchedAt, items },
          null,
          2
        ),
        "utf-8"
      )
      console.log(`${items.length}件抽出`)
    }
  }
}

main()
