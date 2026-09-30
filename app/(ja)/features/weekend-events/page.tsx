import type { Metadata } from "next"
import { FC } from "react"
import { EventFeaturePage } from "@/components/elements/event-feature-page"
import { getEventFeature } from "@/lib/event-features"
import { getLocale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"

export const generateMetadata = async (): Promise<Metadata> => {
  const feature = getEventFeature("weekend", await getLocale())
  return pageMetadata({ ...feature, noindex: feature.events.length === 0 })
}

const Page: FC = async () => <EventFeaturePage feature={getEventFeature("weekend", await getLocale())} />

export default Page
