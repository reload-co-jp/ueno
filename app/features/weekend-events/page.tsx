import type { Metadata } from "next"
import { FC } from "react"
import { EventFeaturePage } from "@/components/elements/event-feature-page"
import { getEventFeature } from "@/lib/event-features"
import { pageMetadata } from "@/lib/seo"

export const generateMetadata = (): Metadata => {
  const feature = getEventFeature("weekend")
  return pageMetadata({ ...feature, noindex: feature.events.length === 0 })
}

const Page: FC = () => <EventFeaturePage feature={getEventFeature("weekend")} />

export default Page
