import { execFile } from "node:child_process"
import { promisify } from "node:util"

// APIキー課金ではなく、Claude Codeにログイン済みの認証(サブスクリプション)で
// `claude -p`(headlessモード)を子プロセスとして呼び出しLLM機能を使う。
const execFileAsync = promisify(execFile)

const MAX_BUFFER = 10 * 1024 * 1024 // headlessモードのパイプ上限に合わせる

interface ClaudeResultJson {
  is_error: boolean
  result: string
  structured_output?: unknown
}

const runClaude = async (prompt: string, extraArgs: string[] = []): Promise<ClaudeResultJson | null> => {
  try {
    const { stdout } = await execFileAsync(
      "claude",
      ["-p", prompt, "--output-format", "json", ...extraArgs],
      { maxBuffer: MAX_BUFFER }
    )
    const parsed: ClaudeResultJson = JSON.parse(stdout)
    if (parsed.is_error) {
      console.error("claude CLIがエラーを返した:", parsed.result)
      return null
    }
    return parsed
  } catch (err) {
    console.error("claude CLI呼び出し失敗:", err instanceof Error ? err.message : err)
    return null
  }
}

// 自由記述のテキスト生成(記事本文など)
export const runClaudeText = async (prompt: string): Promise<string | null> => {
  const res = await runClaude(prompt)
  return res?.result ?? null
}

// JSON Schemaを指定した構造化出力(情報抽出など)
export const runClaudeJson = async <T>(prompt: string, jsonSchema: object): Promise<T | null> => {
  const res = await runClaude(prompt, ["--json-schema", JSON.stringify(jsonSchema)])
  return (res?.structured_output as T) ?? null
}
