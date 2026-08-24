import type { Spot, Store } from "@/lib/types"
import { runClaudeText } from "./claude-cli"

// README「7. 重複管理」準拠
// 判定に使う要素: 店舗名・住所・電話番号・URL・緯度経度・LLMによる判定

// 表記ゆれ吸収のための正規化(全角/半角統一、スペース・記号除去、店舗接尾辞除去)
export const normalizeName = (name: string): string =>
  name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000・.,、。]/g, "")
    .replace(/(店|支店|shop|store)$/g, "")

// レーベンシュタイン距離ベースの類似度(0〜1)
export const similarity = (a: string, b: string): number => {
  const s1 = normalizeName(a)
  const s2 = normalizeName(b)
  if (!s1 || !s2) return 0
  if (s1 === s2) return 1

  const dp: number[][] = Array.from({ length: s1.length + 1 }, (_, i) =>
    Array.from({ length: s2.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      dp[i][j] =
        s1[i - 1] === s2[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  const distance = dp[s1.length][s2.length]
  return 1 - distance / Math.max(s1.length, s2.length)
}

// 「東京都美術館開館100周年記念 ○○展」のように片方が接頭辞付きの長いタイトルの場合、
// レーベンシュタイン類似度は低く出るため、正規化後の包含関係も別途チェックする
export const titleOverlaps = (a: string, b: string): boolean => {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  const MIN_OVERLAP_LENGTH = 8 // 短すぎる共通部分での誤マージを避ける
  if (na.length < MIN_OVERLAP_LENGTH || nb.length < MIN_OVERLAP_LENGTH) return false
  return na.includes(nb) || nb.includes(na)
}

// 「別ソースだが同一実体を指す記事タイトルか」の判定(表記ゆれ・接頭辞違いを吸収)
export const isSameArticle = (titleA: string, titleB: string): boolean =>
  similarity(titleA, titleB) >= 0.7 || titleOverlaps(titleA, titleB)

const normalizeUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "")

export type MatchLevel = "exact" | "likely" | "ambiguous" | "none"

export interface MatchResult {
  entity: Store | Spot
  level: MatchLevel
  reason: string
  nameSimilarity: number
}

// ルールベースの一致判定(README準拠の要素を優先順に確認)
export const matchEntity = (
  candidateName: string,
  candidateUrl: string | null,
  candidateAddress: string | null,
  existing: (Store | Spot)[]
): MatchResult[] => {
  return existing
    .map((entity) => {
      const nameSim = similarity(candidateName, entity.name)

      if (candidateUrl && normalizeUrl(candidateUrl) === normalizeUrl(entity.officialUrl)) {
        return { entity, level: "exact" as const, reason: "公式URL一致", nameSimilarity: nameSim }
      }
      if (
        candidateAddress &&
        "address" in entity &&
        candidateAddress.replace(/\s/g, "") === entity.address.replace(/\s/g, "")
      ) {
        return { entity, level: "exact" as const, reason: "住所一致", nameSimilarity: nameSim }
      }
      if (nameSim >= 0.85) {
        return { entity, level: "likely" as const, reason: "店舗名類似度高", nameSimilarity: nameSim }
      }
      if (nameSim >= 0.5) {
        return { entity, level: "ambiguous" as const, reason: "店舗名部分一致", nameSimilarity: nameSim }
      }
      return { entity, level: "none" as const, reason: "", nameSimilarity: nameSim }
    })
    .filter((r) => r.level !== "none")
    .sort((a, b) => b.nameSimilarity - a.nameSimilarity)
}

// ambiguousな候補のみLLMに最終判定を委ねる(README「LLMによる判定」)
export const llmJudgeDuplicate = async (
  candidateName: string,
  candidateContext: string,
  existingName: string,
  existingContext: string
): Promise<boolean> => {
  const prompt = `2つの店舗・施設情報が同一の実体を指すかを判定する。表記ゆれ(全角半角/スペース/支店表記など)は同一とみなす。
A: ${candidateName} (${candidateContext})
B: ${existingName} (${existingContext})
同一か？ yes か no のみで答えよ。`

  const result = await runClaudeText(prompt)
  return result?.trim().toLowerCase().startsWith("y") ?? false
}
