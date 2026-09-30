import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FC } from "react"
import { InArticleAd } from "@/components/elements/ad-slot"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { GENRES, genreEvents, genreSlug, parseGenreSlug, PERIODS, type Genre, type Period } from "@/lib/genres"
import { getI18n, type Locale, type Texts } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"

const textsOf = (
  period: Period,
  genre: Genre,
  count: number,
  locale: Locale
): Texts<{ title: string; description: string; empty: string }> => {
  const p = period.label[locale]
  const g = genre.label[locale]
  return {
    ja: {
      title: `上野で${p}開催の${g}`,
      description: `上野エリアで${p}開催中の${g}${count}件を紹介。上野公園・美術館・博物館周辺の${g}情報を開催日時・会場つきでまとめている。`,
      empty: `${p}開催中の${g}はない。`,
    },
    en: {
      title: `${g} in Ueno ${p}`,
      description: `${count} ${g.toLowerCase()} happening in the Ueno area ${p}, around Ueno Park and its museums, with dates and venues.`,
      empty: `No ${g.toLowerCase()} ${p}.`,
    },
    "zh-cn": {
      title: `上野${p}举办的${g}`,
      description: `介绍上野地区${p}正在举办的${count}场${g}。汇总上野公园、美术馆、博物馆周边的${g}信息，附举办时间及会场。`,
      empty: `${p}没有正在举办的${g}。`,
    },
  }
}

export const generateStaticParams = () =>
  PERIODS.flatMap((period) => GENRES.map((genre) => ({ slug: genreSlug(period, genre) })))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> => {
  const { slug } = await params
  const parsed = parseGenreSlug(slug)
  if (!parsed) return {}
  const { period, genre } = parsed
  const events = genreEvents(period, genre)
  const { locale, t } = await getI18n()
  const { title, description } = t(textsOf(period, genre, events.length, locale))
  return pageMetadata({
    title,
    description,
    path: `/features/genre/${slug}`,
    noindex: events.length === 0,
  })
}

const Page: FC<{ params: Promise<{ slug: string }> }> = async ({ params }) => {
  const { slug } = await params
  const parsed = parseGenreSlug(slug)
  if (!parsed) notFound()
  const { period, genre } = parsed

  const events = genreEvents(period, genre)
  const { locale, t } = await getI18n()
  const { title, empty } = t(textsOf(period, genre, events.length, locale))

  return (
    <div>
      <Breadcrumb
        items={[{ label: t({ ja: "イベント", en: "Events", "zh-cn": "活动" }), href: "/events" }, { label: title }]}
      />
      <h1 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>{title}</h1>
      <div style={{ marginBottom: "1.25rem" }}>
        <InArticleAd />
      </div>
      <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>
        {t({
          ja: `開催中のイベント(${events.length}件)`,
          en: `Happening now (${events.length})`,
          "zh-cn": `正在举办的活动(${events.length}场)`,
        })}
      </h2>
      {events.length === 0 ? (
        <p style={{ color: "#999" }}>{empty}</p>
      ) : (
        <CardGrid>
          {events.map((e) => (
            <ArticleCard key={e.id} article={e} />
          ))}
        </CardGrid>
      )}
    </div>
  )
}

export default Page
