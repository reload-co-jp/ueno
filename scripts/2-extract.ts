// README「3. 情報収集フロー」 Rawデータ保存 → 情報抽出
// 実行: pnpm extract [sourceId ...]
import { existsSync } from "node:fs"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { type ExtractedItem, extractFromHtml, extractInputHash } from "./lib/extract"
import type { RawRecord } from "./lib/fetch-raw"
import { getSource, SOURCES } from "./lib/sources"

const RAW_DIR = path.join(process.cwd(), "data", "raw")
const EXTRACTED_DIR = path.join(process.cwd(), "data", "extracted")

interface ExtractedFile {
  sourceId: string
  sourceName: string
  url: string
  fetchedAt: string
  inputHash?: string
  items: ExtractedItem[]
}

const readJson = async <T>(p: string): Promise<T> => JSON.parse(await readFile(p, "utf-8"))
const writeJson = (p: string, data: unknown) => writeFile(p, JSON.stringify(data, null, 2), "utf-8")

const main = async () => {
  const targetIds = process.argv.slice(2)
  const sourceIds = targetIds.length ? targetIds : SOURCES.map((s) => s.id)

  for (const sourceId of sourceIds) {
    const rawDir = path.join(RAW_DIR, sourceId)
    const source = getSource(sourceId)
    if (!existsSync(rawDir) || !source) continue

    const files = (await readdir(rawDir)).filter((f) => f.endsWith(".json")).sort()
    const outDir = path.join(EXTRACTED_DIR, sourceId)
    await mkdir(outDir, { recursive: true })

    // 抽出済み結果をLLM入力ハッシュで索引化。ハッシュ未記録の旧ファイルはRawから算出して追記する。
    const itemsByHash = new Map<string, ExtractedItem[]>()
    for (const file of (await readdir(outDir)).filter((f) => f.endsWith(".json"))) {
      const outPath = path.join(outDir, file)
      const data = await readJson<ExtractedFile>(outPath)
      const rawPath = path.join(rawDir, file)
      if (!data.inputHash && existsSync(rawPath)) {
        const raw = await readJson<RawRecord>(rawPath)
        if (raw.html) {
          data.inputHash = extractInputHash(source, raw.html, raw.url)
          await writeJson(outPath, data)
        }
      }
      if (data.inputHash && !itemsByHash.has(data.inputHash)) itemsByHash.set(data.inputHash, data.items)
    }

    for (const file of files) {
      const outPath = path.join(outDir, file)
      if (existsSync(outPath)) continue // 抽出済みはスキップ

      const raw = await readJson<RawRecord>(path.join(rawDir, file))
      if (raw.status !== 200 || !raw.html) continue

      const inputHash = extractInputHash(source, raw.html, raw.url)
      const known = itemsByHash.get(inputHash)
      process.stdout.write(`抽出中: ${raw.sourceName} (${file}) ... `)
      // 同一内容を抽出済みなら結果を再利用(LLM呼び出し・詳細ページfetchなし)
      const items = known ?? (await extractFromHtml(source, raw.html, raw.url))
      itemsByHash.set(inputHash, items)
      await writeJson(outPath, {
        sourceId,
        sourceName: raw.sourceName,
        url: raw.url,
        fetchedAt: raw.fetchedAt,
        inputHash,
        items,
      })
      console.log(known ? `同一内容のため再利用 ${items.length}件` : `${items.length}件抽出`)
    }
  }
}

main()
