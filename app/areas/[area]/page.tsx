import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FC } from "react"
import { ArticleCard, CardGrid, SpotCard, StoreCard } from "@/components/elements/card"
import { getAreas, getArticlesByArea, getSpotsByArea, getStoresByArea } from "@/lib/data"
import { absoluteUrl } from "@/lib/seo"

export const generateStaticParams = () => getAreas().map((area) => ({ area }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ area: string }>
}): Promise<Metadata> => {
  const { area } = await params
  if (!getAreas().includes(area)) return {}
  const url = absoluteUrl(`/areas/${encodeURIComponent(area)}`)
  const description = `${area}エリアの店舗・施設・最新情報一覧`
  return {
    title: area,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: area, description },
  }
}

const Page: FC<{ params: Promise<{ area: string }> }> = async ({ params }) => {
  const { area } = await params
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
