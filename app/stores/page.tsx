import { FC } from "react"
import { CardGrid, StoreCard } from "@/components/elements/card"
import { stores } from "@/lib/data"

export const metadata = { title: "店舗 | 上野ナビ" }

const Page: FC = () => (
  <div>
    <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>店舗</h2>
    <CardGrid>
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </CardGrid>
  </div>
)

export default Page
