import { buildSearchIndex } from "@/lib/search-index"

export const dynamic = "force-static"

export const GET = () => Response.json(buildSearchIndex("zh-cn"))
