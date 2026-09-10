import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { ArticleCard, CardGrid } from "@/components/elements/card"
import { getEventsInRange, getEventsOnDate } from "@/lib/data"
import { thisWeekRange, todayStr } from "@/lib/date"
import { GENRES, genreSlug, matchesGenre, parseGenreSlug, PERIODS } from "@/lib/genres"

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
  const title = `${period.label}の${genre.label}`
  return {
    title,
    description: `${period.label}開催の上野エリアの${genre.label}情報`,
  }
}

const Page: FC<{ params: Promise<{ slug: string }> }> = async ({ params }) => {
  const { slug } = await params
  const parsed = parseGenreSlug(slug)
  if (!parsed) notFound()
  const { period, genre } = parsed

  const candidates =
    period.key === "today"
      ? getEventsOnDate(todayStr())
      : getEventsInRange(thisWeekRange().start, thisWeekRange().end)
  const events = candidates.filter((e) => matchesGenre(e, genre))
  const title = `${period.label}の${genre.label}`

  return (
    <div>
      <Breadcrumb items={[{ label: "特集" }, { label: title }]} />
      <h1 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>{title}</h1>
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
