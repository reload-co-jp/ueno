import type { Metadata } from "next"
import { FC } from "react"
import { EventFeaturePage } from "@/components/elements/event-feature-page"
import { getEventFeature } from "@/lib/event-features"
import { pageMetadata } from "@/lib/seo"

export const generateMetadata = (): Metadata => {
  const feature = getEventFeature("free")
  return pageMetadata({ ...feature, noindex: feature.events.length === 0 })
}

const Page: FC = () => <EventFeaturePage feature={getEventFeature("free")} />

export default Page
