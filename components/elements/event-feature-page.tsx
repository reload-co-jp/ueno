import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import type { EventFeature } from "@/lib/event-features"
import { eventListJsonLd, jsonLdString } from "@/lib/seo"

export const EventFeaturePage: FC<{ feature: EventFeature }> = ({
  feature,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    {feature.events.length > 0 && (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            eventListJsonLd(feature.heading, feature.events)
          ),
        }}
      />
    )}
    <Breadcrumb
      items={[{ label: "イベント", href: "/events" }, { label: feature.label }]}
    />
    <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{feature.heading}</h1>
    <p
      style={{
        fontSize: ".875rem",
        color: "#7a7468",
        margin: 0,
        lineHeight: 1.7,
      }}
    >
      {feature.lead}
    </p>

    <section>
      <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>
        開催中・開催予定のイベント({feature.events.length}件)
      </h2>
      {feature.events.length === 0 ? (
        <p style={{ color: "#999" }}>{feature.emptyMessage}</p>
      ) : (
        <CardGrid>
          {feature.events.map((e) => (
            <ArticleCard key={e.id} article={e} />
          ))}
        </CardGrid>
      )}
    </section>

    <RelatedLinks current={feature.path} />
  </div>
)
