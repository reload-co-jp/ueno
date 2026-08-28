import { ImageResponse } from "next/og"

export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

const Icon = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#c0483a",
          color: "#fff",
          fontSize: 22,
          fontWeight: 700,
          borderRadius: "50%",
        }}
      >
        上
      </div>
    ),
    size,
  )

export default Icon
