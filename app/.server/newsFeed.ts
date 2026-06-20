import type {
  NewsFeedResult,
  NewsItem,
  NewsSource,
  NewsSourceStatus
} from './newsFeed.types'
import {
  MAX_NEWS_ITEMS,
  NEWS_CACHE_TTL_MS,
  NEWS_FETCH_TIMEOUT_MS,
  NEWS_SOURCES
} from './newsFeedSources'
import {
  extractEaaAirVentureHtmlItems,
  extractItems,
  normalizeItem
} from './newsFeedParsing'
export { attachArticleImages } from './newsFeedImages'

let cachedNews: { expiresAt: number, result: NewsFeedResult } | null = null

const fetchWithTimeout = async (url: string): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), NEWS_FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (compatible; OshkoshApproachNews/1.0; +https://www.oshkosh-approach.com/)'
      }
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

const fetchSource = async (
  source: NewsSource
): Promise<{ source: NewsSourceStatus, items: NewsItem[] }> => {
  const response = await fetchWithTimeout(source.feedUrl)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }

  const xml = await response.text()
  const items =
    source.format === 'eaa-airventure-html'
      ? extractEaaAirVentureHtmlItems(xml, source)
      : extractItems(xml)
        .map((item) => normalizeItem(source, item))
        .filter((item): item is NewsItem => Boolean(item))

  return {
    source: {
      id: source.id,
      label: source.label,
      feedUrl: source.feedUrl,
      homepageUrl: source.homepageUrl,
      status: 'ok'
    },
    items
  }
}

const compareItemsNewestFirst = (a: NewsItem, b: NewsItem): number =>
  (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0)

const mergeItems = (groups: NewsItem[][]): NewsItem[] => {
  const byUrl = new Map<string, NewsItem>()
  for (const item of groups.flat()) {
    const existing = byUrl.get(item.url)
    if (!existing || compareItemsNewestFirst(item, existing) < 0) {
      byUrl.set(item.url, item)
    }
  }
  return [...byUrl.values()]
    .sort(compareItemsNewestFirst)
    .slice(0, MAX_NEWS_ITEMS)
}

const sourceError = (source: NewsSource, error: unknown): NewsSourceStatus => ({
  id: source.id,
  label: source.label,
  feedUrl: source.feedUrl,
  homepageUrl: source.homepageUrl,
  status: 'error',
  error: error instanceof Error ? error.message : 'Unknown feed error'
})

export const getAirVentureNews = async ({
  forceRefresh = false
}: { forceRefresh?: boolean } = {}): Promise<NewsFeedResult> => {
  const now = Date.now()
  if (!forceRefresh && cachedNews && cachedNews.expiresAt > now) {
    return cachedNews.result
  }

  const settled = await Promise.allSettled(
    NEWS_SOURCES.map(async (source) => ({
      source,
      result: await fetchSource(source)
    }))
  )

  const sources: NewsSourceStatus[] = []
  const itemGroups: NewsItem[][] = []

  settled.forEach((entry, index) => {
    const fallbackSource = NEWS_SOURCES[index]
    if (entry.status === 'fulfilled') {
      sources.push(entry.value.result.source)
      itemGroups.push(entry.value.result.items)
      return
    }
    sources.push(sourceError(fallbackSource, entry.reason))
  })

  const result = {
    items: mergeItems(itemGroups),
    fetchedAt: new Date().toISOString(),
    sources
  }

  cachedNews = {
    result,
    expiresAt: now + NEWS_CACHE_TTL_MS
  }

  return result
}
