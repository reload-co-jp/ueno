import { notFound } from "next/navigation"
import { FC } from "react"
import { ArticleCard, CardGrid, SpotCard, StoreCard } from "@/components/elements/card"
import { getAreas, getArticlesByArea, getSpotsByArea, getStoresByArea } from "@/lib/data"

export const generateStaticParams = () =>
  getAreas().map((area) => ({ area: encodeURIComponent(area) }))

const Page: FC<{ params: Promise<{ area: string }> }> = async ({ params }) => {
  const { area: raw } = await params
  const area = decodeURIComponent(raw)
  if (!getAreas().includes(area)) notFound()

  const articles = getArticlesByArea(area)
  const areaStores = getStoresByArea(area)
  const areaSpots = getSpotsByArea(area)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{area}</h2>

      {areaSpots.length > 0 && (
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: ".75rem" }}>施設・スポット</h3>
          <CardGrid>
            {areaSpots.map((s) => (
              <SpotCard key={s.id} spot={s} />
            ))}
          </CardGrid>
        </div>
      )}

      {areaStores.length > 0 && (
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: ".75rem" }}>店舗</h3>
          <CardGrid>
            {areaStores.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </CardGrid>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: "1rem", marginBottom: ".75rem" }}>最新情報</h3>
        {articles.length === 0 ? (
          <p style={{ color: "#999" }}>該当する記事はまだない。</p>
        ) : (
          <CardGrid>
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </CardGrid>
        )}
      </div>
    </div>
  )
}

export default Page
