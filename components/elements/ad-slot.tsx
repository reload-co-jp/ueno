"use client"

import { FC, useEffect } from "react"

const ADSENSE_CLIENT_ID = "ca-pub-6542845006087970"

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

const usePushAd = () =>
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // 広告ブロック等で失敗しても無視
    }
  }, [])

// 共通ディスプレイ広告
export const AdSlot: FC<{ slot?: string }> = ({ slot = "4829146611" }) => {
  usePushAd()

  if (process.env.NODE_ENV !== "production") return null

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}

// 記事内広告
export const InArticleAd: FC<{ slot?: string }> = ({ slot = "4625326006" }) => {
  usePushAd()

  if (process.env.NODE_ENV !== "production") return null

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", textAlign: "center" }}
      data-ad-layout="in-article"
      data-ad-format="fluid"
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
    />
  )
}
