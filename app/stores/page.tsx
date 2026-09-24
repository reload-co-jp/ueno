import type { Metadata } from "next"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { CardGrid, StoreCard } from "@/components/elements/card"
import { stores } from "@/lib/data"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "上野の店舗一覧",
  description:
    "上野・御徒町エリアの店舗一覧。営業時間・所在地と、各店舗の新規オープンやイベント関連ニュースを確認できる。",
  path: "/stores",
})

const Page: FC = () => (
  <div>
    <Breadcrumb items={[{ label: "店舗" }]} />
    <h1 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
      上野の店舗一覧
    </h1>
    <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>店舗一覧({stores.length}件)</h2>
    <CardGrid>
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </CardGrid>
  </div>
)

export default Page
