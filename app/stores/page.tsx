import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { CardGrid, StoreCard } from "@/components/elements/card"
import { stores } from "@/lib/data"

export const metadata = {
  title: "店舗",
  description: "上野エリアの店舗一覧",
}

const Page: FC = () => (
  <div>
    <Breadcrumb items={[{ label: "店舗" }]} />
    <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>店舗</h2>
    <CardGrid>
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </CardGrid>
  </div>
)

export default Page
