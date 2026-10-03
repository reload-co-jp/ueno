import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { RelatedLinks } from "@/components/elements/related-links"
import type { EventFeature } from "@/lib/event-features"
import { getI18n } from "@/lib/i18n"
import { eventListJsonLd, jsonLdString } from "@/lib/seo"

export const EventFeaturePage: FC<{ feature: EventFeature }> = async ({
  feature,
}) => {
  const { locale, t } = await getI18n()
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {feature.events.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdString(
              eventListJsonLd(feature.heading, feature.events, locale)
            ),
          }}
        />
      )}
      <Breadcrumb
        items={[
          {
            label: t({ ja: "イベント", en: "Events", "zh-cn": "活动" }),
            href: "/events",
          },
          { label: feature.label },
        ]}
      />
      <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{feature.heading}</h1>
      <p
        style={{
          fontSize: ".875rem",
          color: "var(--secondary)",
          margin: 0,
          lineHeight: 1.7,
        }}
      >
        {feature.lead}
      </p>

      <InArticleAd />
      <section>
        <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>
          {t({
            ja: `開催中・開催予定のイベント(${feature.events.length}件)`,
            en: `Current & upcoming events (${feature.events.length})`,
            "zh-cn": `正在举办・即将举办的活动(${feature.events.length}场)`,
          })}
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
}
