import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getArticlesByStore, getStore, stores } from "@/lib/data"
import { formatDate } from "@/lib/date"
import { getI18n } from "@/lib/i18n"
import { jsonLdString, pageMetadata } from "@/lib/seo"

export const generateStaticParams = () => stores.map((s) => ({ id: s.id }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> => {
  const { id } = await params
  const original = getStore(id)
  if (!original) return {}
  const i18n = await getI18n()
  const store = i18n.store(original)
  return pageMetadata({
    title: store.name,
    description: i18n.t({
      ja: `${store.name}（${store.category}）の店舗情報。所在地: ${store.address}`,
      en: `Shop information for ${store.name} (${store.category}). Address: ${store.address}`,
      "zh-cn": `${store.name}（${store.category}）店铺信息。地址：${store.address}`,
    }),
    path: `/stores/${store.id}`,
  })
}

const Page: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params
  const original = getStore(id)
  if (!original) notFound()
  const i18n = await getI18n()
  const { locale, t } = i18n
  const store = i18n.store(original)
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
      <Breadcrumb
        items={[{ label: t({ ja: "店舗", en: "Shops", "zh-cn": "店铺" }), href: "/stores" }, { label: store.name }]}
      />
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
        <h1 style={{ fontSize: "1.25rem", margin: "0 0 1rem" }}>{store.name}</h1>
        <ul style={{ listStyle: "none", padding: 0, fontSize: ".875rem", color: "#ccc" }}>
          <li>
            {t({ ja: "住所", en: "Address", "zh-cn": "地址" })}: {store.address}
          </li>
          <li>
            {t({ ja: "営業時間", en: "Hours", "zh-cn": "营业时间" })}: {store.hours}
          </li>
          {store.openingDate && (
            <li>
              {t({ ja: "オープン日", en: "Opened", "zh-cn": "开业日期" })}: {formatDate(store.openingDate, locale)}
            </li>
          )}
          <li>
            {t({ ja: "エリア", en: "Area", "zh-cn": "区域" })}: {store.area}
          </li>
          <li>
            {t({ ja: "公式サイト", en: "Official website", "zh-cn": "官方网站" })}:{" "}
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
          <li>
            {t({ ja: "情報源", en: "Source", "zh-cn": "信息来源" })}: {store.source}
          </li>
        </ul>
      </div>

      {articles.length > 0 && (
        <div>
          <h2 style={{ fontSize: "1rem", marginBottom: ".75rem" }}>
            {t({ ja: "関連記事", en: "Related articles", "zh-cn": "相关文章" })}
          </h2>
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
