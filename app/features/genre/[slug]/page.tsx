import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { GENRES, genreEvents, genreSlug, parseGenreSlug, PERIODS } from "@/lib/genres"
import { pageMetadata } from "@/lib/seo"

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
  return pageMetadata({
    title: `上野で${period.label}開催の${genre.label}`,
    description: `上野エリアで${period.label}開催中の${genre.label}${events.length}件を紹介。上野公園・美術館・博物館周辺の${genre.label}情報を開催日時・会場つきでまとめている。`,
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
  const title = `上野で${period.label}開催の${genre.label}`

  return (
    <div>
      <Breadcrumb items={[{ label: "イベント", href: "/events" }, { label: title }]} />
      <h1 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>{title}</h1>
      <h2 style={{ fontSize: "1rem", margin: "0 0 .75rem" }}>
        開催中のイベント({events.length}件)
      </h2>
      {events.length === 0 ? (
        <p style={{ color: "#999" }}>{period.label}開催中の{genre.label}はない。</p>
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
