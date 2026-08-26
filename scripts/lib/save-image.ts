// 記事画像のダウンロード・サイズ検証・自前保存。
// 他サイトへのホットリンクを避け、public/images/articles/ 配下に保存したローカルパスを返す。
import { existsSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { createHash } from "node:crypto"
import { imageSize } from "image-size"
import { USER_AGENT } from "./fetch-raw"

// 実サイズでの確定採用基準(extract.tsの属性ベース足切り MIN_ATTR_SIZE=100 より厳しい)。
// これ未満は記事画像として採用しない(アイコン/バナー除外)
const MIN_SIZE = 200
const SAVE_DIR = path.join(process.cwd(), "public", "images", "articles")

const EXT_BY_TYPE: Record<string, string> = {
  jpg: "jpg",
  jpeg: "jpg",
  png: "png",
  gif: "gif",
  webp: "webp",
}

// 画像URLを取得しサイズ検証する。小さすぎる/デコード不能なら null。
export const fetchAndValidateImage = async (
  url: string
): Promise<{ buffer: Buffer; width: number; height: number; ext: string } | null> => {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.5" },
    })
    if (!res.ok) return null
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const dimensions = imageSize(new Uint8Array(buffer))
    const ext = EXT_BY_TYPE[dimensions.type ?? ""]
    if (!ext) return null
    if (dimensions.width < MIN_SIZE || dimensions.height < MIN_SIZE) return null

    return { buffer, width: dimensions.width, height: dimensions.height, ext }
  } catch {
    return null
  }
}

const hashUrl = (url: string) => createHash("sha1").update(url).digest("hex").slice(0, 16)

// public/images/articles/ 配下に保存。同一URLのファイルが既にあれば再ダウンロードせずそのパスを返す。
// 呼び出し元は先に fetchAndValidateImage() を通した buffer/ext を渡すため、ここではI/Oのみ行う。
export const saveImageToPublic = async (
  url: string,
  buffer: Buffer,
  ext: string
): Promise<string> => {
  const filename = `${hashUrl(url)}.${ext}`
  const filePath = path.join(SAVE_DIR, filename)
  if (!existsSync(filePath)) {
    await mkdir(SAVE_DIR, { recursive: true })
    await writeFile(filePath, buffer)
  }
  return `/images/articles/${filename}`
}

// 既にローカル保存済みかどうか(このモジュールが払い出したパスかどうか)を判定する。
export const isLocalArticleImage = (imageUrl: string | null): boolean =>
  !!imageUrl && imageUrl.startsWith("/images/articles/")

// 画像URLを取得・検証・保存までまとめて行う。失敗時は null。
export const downloadAndSaveImage = async (url: string): Promise<string | null> => {
  const validated = await fetchAndValidateImage(url)
  if (!validated) return null
  return saveImageToPublic(url, validated.buffer, validated.ext)
}
