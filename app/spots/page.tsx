import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { CardGrid, SpotCard } from "@/components/elements/card"
import { spots } from "@/lib/data"

export const metadata = {
  title: "施設・スポット",
  description: "上野エリアの施設・観光スポット一覧",
}

const Page: FC = () => (
  <div>
    <Breadcrumb items={[{ label: "施設・スポット" }]} />
    <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>施設・スポット</h2>
    <CardGrid>
      {spots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} />
      ))}
    </CardGrid>
  </div>
)

export default Page
