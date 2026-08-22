import { notFound } from "next/navigation"
import { FC } from "react"
import { ArticleCard, CardGrid, EventCard } from "@/components/elements/card"
import { events, getArticlesBySpot, getSpot, spots } from "@/lib/data"

export const generateStaticParams = () => spots.map((s) => ({ id: s.id }))

const Page: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params
  const spot = getSpot(id)
  if (!spot) notFound()
  const articles = getArticlesBySpot(spot.id)
  const spotEvents = events.filter((e) => e.relatedSpotId === spot.id)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <span
          style={{
            display: "inline-block",
            fontSize: ".75rem",
            background: "#555",
            borderRadius: ".25rem",
            padding: ".125rem .5rem",
            marginBottom: ".5rem",
          }}
        >
          {spot.type}
        </span>
        <h2 style={{ fontSize: "1.25rem", margin: "0 0 1rem" }}>{spot.name}</h2>
        <ul style={{ listStyle: "none", padding: 0, fontSize: ".875rem", color: "#ccc" }}>
          <li>住所: {spot.address}</li>
          <li>エリア: {spot.area}</li>
          <li>
            公式サイト:{" "}
            <a href={spot.officialUrl} target="_blank" rel="noreferrer" style={{ color: "#8ecbff" }}>
              {spot.officialUrl}
            </a>
          </li>
        </ul>
      </div>

      {spotEvents.length > 0 && (
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: ".75rem" }}>開催中・開催予定イベント</h3>
          <CardGrid>
            {spotEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </CardGrid>
        </div>
      )}

      {articles.length > 0 && (
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: ".75rem" }}>関連記事</h3>
          <CardGrid>
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        </div>
      )}
    </div>
  )
}

export default Page
