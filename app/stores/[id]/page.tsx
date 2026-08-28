import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getArticlesByStore, getStore, stores } from "@/lib/data"
import { formatDateJp } from "@/lib/date"
import { absoluteUrl, jsonLdString, SITE_NAME } from "@/lib/seo"

export const generateStaticParams = () => stores.map((s) => ({ id: s.id }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> => {
  const { id } = await params
  const store = getStore(id)
  if (!store) return {}
  const url = absoluteUrl(`/stores/${store.id}`)
  const description = `${store.name}（${store.category}）の店舗情報。所在地: ${store.address}`
  return {
    title: store.name,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: store.name, description, siteName: SITE_NAME },
  }
}

const Page: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params
  const store = getStore(id)
  if (!store) notFound()
  const articles = getArticlesByStore(store.id)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: store.name,
    address: { "@type": "PostalAddress", streetAddress: store.address, addressLocality: store.area },
    geo: { "@type": "GeoCoordinates", latitude: store.lat, longitude: store.lng },
    url: store.officialUrl,
    openingHours: store.hours,
    sameAs: store.sns,
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "店舗", href: "/stores" }, { label: store.name }]} />
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
          {store.category}
        </span>
        <h2 style={{ fontSize: "1.25rem", margin: "0 0 1rem" }}>{store.name}</h2>
        <ul style={{ listStyle: "none", padding: 0, fontSize: ".875rem", color: "#ccc" }}>
          <li>住所: {store.address}</li>
          <li>営業時間: {store.hours}</li>
          {store.openingDate && <li>オープン日: {formatDateJp(store.openingDate)}</li>}
          <li>エリア: {store.area}</li>
          <li>
            公式サイト:{" "}
            <a href={store.officialUrl} target="_blank" rel="noreferrer" style={{ color: "#8ecbff" }}>
              {store.officialUrl}
            </a>
          </li>
          {store.sns && store.sns.length > 0 && (
            <li>
              SNS:{" "}
              {store.sns.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#8ecbff", marginRight: ".5rem" }}
                >
                  {url}
                </a>
              ))}
            </li>
          )}
          <li>情報源: {store.source}</li>
        </ul>
      </div>

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
