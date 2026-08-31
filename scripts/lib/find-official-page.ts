import { execFile } from "node:child_process"
import { promisify } from "node:util"

// 一覧ページ(kensetsu.metro.tokyo.lg.jp/.../event等)に詳細ページ・画像が一切無いイベント向け。
// イベント名・主催者からWeb検索し、主催団体側の公式詳細ページ(サイトまたはSNS告知)を特定する。
// URLはLLMに創作させず、Web検索結果に実在するものだけを返させる(幻覚防止)。
const execFileAsync = promisify(execFile)

const MAX_BUFFER = 10 * 1024 * 1024

const SCHEMA = {
  type: "object",
  properties: {
    official_url: { type: ["string", "null"] },
  },
  required: ["official_url"],
}

interface ClaudeResultJson {
  is_error: boolean
  structured_output?: unknown
}

// Web検索でイベントの公式詳細ページURLを1件特定する。見つからなければnull。
export const findOfficialUrl = async (
  eventName: string,
  organizer: string | null,
  area: string
): Promise<string | null> => {
  const prompt = `Web検索で次のイベントの公式詳細ページURLを1件特定する。
イベント名: ${eventName}
主催者: ${organizer ?? "不明"}
エリア: ${area}

ルール:
- 検索結果に実在するURLのみを返す。自分で生成・推測したURLは絶対に返さない。
- 主催団体の公式サイトを優先する。無ければ公式SNS(Instagram/X等)の該当イベント告知投稿でもよい。
- 該当イベントについて確信を持てるページが見つからなければofficial_urlをnullにする。`

  try {
    const { stdout } = await execFileAsync(
      "claude",
      [
        "-p",
        prompt,
        "--output-format",
        "json",
        "--allowedTools",
        "WebSearch",
        "--json-schema",
        JSON.stringify(SCHEMA),
      ],
      { maxBuffer: MAX_BUFFER }
    )
    const parsed: ClaudeResultJson = JSON.parse(stdout)
    if (parsed.is_error) return null
    const result = parsed.structured_output as { official_url: string | null } | undefined
    return result?.official_url ?? null
  } catch (err) {
    console.error("公式URL検索失敗:", err instanceof Error ? err.message : err)
    return null
  }
}
