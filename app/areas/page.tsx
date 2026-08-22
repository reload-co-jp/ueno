import Link from "next/link"
import { FC } from "react"
import { getAreas } from "@/lib/data"

export const metadata = { title: "エリア | 上野ナビ" }

const Page: FC = () => {
  const areas = getAreas()
  return (
    <div>
      <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>エリア</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
        {areas.map((area) => (
          <Link
            key={area}
            href={`/areas/${encodeURIComponent(area)}`}
            style={{
              border: "1px solid #555",
              borderRadius: "999px",
              padding: ".5rem 1rem",
              fontSize: ".875rem",
              color: "#f0f0f0",
              textDecoration: "none",
            }}
          >
            {area}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Page
