import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'

import { attachArticleImages, getAirVentureNews } from '../.server/newsFeed'

const NEWS_HEADERS = {
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
}

const REFRESH_NEWS_HEADERS = {
  'Cache-Control': 'no-store'
}

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 24
const MAX_OFFSET = 60

const readBoundedInteger = (
  value: string | null,
  fallback: number,
  min: number,
  max: number
): number => {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, parsed))
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const offset = readBoundedInteger(url.searchParams.get('offset'), 0, 0, MAX_OFFSET)
  const limit = readBoundedInteger(
    url.searchParams.get('limit'),
    DEFAULT_LIMIT,
    1,
    MAX_LIMIT
  )
  const forceRefresh = url.searchParams.get('refresh') === '1'

  const feed = await getAirVentureNews({ forceRefresh })
  const items = await attachArticleImages(feed.items.slice(offset, offset + limit))

  return json(
    {
      items,
      total: feed.items.length,
      hasMore: offset + items.length < feed.items.length,
      fetchedAt: feed.fetchedAt,
      sources: feed.sources
    },
    { headers: forceRefresh ? REFRESH_NEWS_HEADERS : NEWS_HEADERS }
  )
}
