import { ImageResponse } from "next/og"
import { SITE_NAME } from "@/lib/seo"

export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"
export const alt = SITE_NAME

const OgImage = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#c0483a",
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "#fff",
            color: "#c0483a",
            fontSize: 96,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          上
        </div>
        <div style={{ fontSize: 64, fontWeight: 700 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 32, marginTop: 16 }}>上野地域メディア</div>
      </div>
    ),
    size,
  )

export default OgImage
