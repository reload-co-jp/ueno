import { FC } from "react"
import { getI18n } from "@/lib/i18n"

// 緯度経度を囲む OpenStreetMap 埋め込みの表示範囲
const LNG_SPAN = 0.003
const LAT_SPAN = 0.002

export const googleMapsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

export const osmEmbedUrl = (lat: number, lng: number) => {
  const bbox = [lng - LNG_SPAN, lat - LAT_SPAN, lng + LNG_SPAN, lat + LAT_SPAN]
    .map((n) => n.toFixed(6))
    .join(",")
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
}

// 場所の地図（OpenStreetMap埋め込み＋Googleマップへのリンク）
export const PlaceMap: FC<{ lat: number; lng: number; name: string }> = async ({ lat, lng, name }) => {
  const { t } = await getI18n()
  return (
    <div style={{ marginTop: ".75rem" }}>
      <iframe
        loading="lazy"
        src={osmEmbedUrl(lat, lng)}
        style={{ aspectRatio: "4 / 3", border: 0, display: "block", width: "100%", maxHeight: "420px" }}
        title={t({ ja: `${name}の地図`, en: `Map of ${name}`, "zh-cn": `${name}地图` })}
      />
      <p style={{ fontSize: ".85rem", margin: ".5rem 0 0" }}>
        <a href={googleMapsUrl(lat, lng)} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
          {t({ ja: "Googleマップで開く →", en: "Open in Google Maps →", "zh-cn": "在Google地图中打开 →" })}
        </a>
      </p>
    </div>
  )
}
