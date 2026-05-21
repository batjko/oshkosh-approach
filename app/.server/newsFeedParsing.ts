import { createHash } from 'node:crypto'
import { XMLParser } from 'fast-xml-parser'

import type { NewsItem, NewsSource, RssItemRecord } from './newsFeed.types'
import { SNIPPET_MAX_CHARS } from './newsFeedSources'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: true
})

export const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' ? value as Record<string, unknown> : null

const asArray = <T>(value: T | T[] | undefined | null): T[] => {
  if (Array.isArray(value)) return value
  return value === undefined || value === null ? [] : [value]
}

const textOf = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim()
  }

  const record = asRecord(value)
  if (!record) return ''
  return textOf(record['#text'])
}

const decodeEntities = (value: string): string =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '-')
    .replace(/&#8220;|&#8221;/g, '"')

const stripHtml = (value: string): string =>
  decodeEntities(
    value
      .replace(/<\s*br\s*\/?\s*>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  )

const truncate = (value: string): string =>
  value.length <= SNIPPET_MAX_CHARS
    ? value
    : `${value.slice(0, SNIPPET_MAX_CHARS - 1).trimEnd()}...`

const categoriesOf = (value: unknown): string[] =>
  asArray(value)
    .map(textOf)
    .filter(Boolean)
    .filter((category, index, categories) => categories.indexOf(category) === index)

const parseDate = (value: unknown): string => {
  const raw = textOf(value)
  if (!raw) return ''
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

const canonicalizeUrl = (raw: string): string => {
  try {
    const url = new URL(raw)
    url.hash = ''
    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith('utm_') || key === '') {
        url.searchParams.delete(key)
      }
    }
    return url.toString().replace(/\/$/, '')
  } catch {
    return raw.trim()
  }
}

const hash = (value: string): string =>
  createHash('sha256').update(value).digest('hex').slice(0, 16)

const attr = (value: unknown, name: string): string => {
  const record = asRecord(value)
  return record ? textOf(record[`@_${name}`]) : ''
}

const imageFromMedia = (value: unknown): string => {
  for (const candidate of asArray(value)) {
    const url = attr(candidate, 'url')
    if (url) return url
  }
  return ''
}

const imageFromEnclosure = (value: unknown): string => {
  for (const candidate of asArray(value)) {
    const type = attr(candidate, 'type')
    const url = attr(candidate, 'url')
    if (url && (!type || type.startsWith('image/'))) return url
  }
  return ''
}

export const imageFromHtml = (html: string): string => {
  const match = html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)
  return match?.[1]?.trim() ?? ''
}

const extractImageUrl = (item: RssItemRecord): string | undefined => {
  const contentHtml = textOf(item['content:encoded'] ?? item.content)
  const imageUrl =
    imageFromMedia(item['media:content']) ||
    imageFromMedia(item['media:thumbnail']) ||
    imageFromEnclosure(item.enclosure) ||
    imageFromHtml(contentHtml)

  if (!imageUrl) return undefined
  try {
    return new URL(imageUrl).toString()
  } catch {
    return undefined
  }
}

const itemUrl = (item: RssItemRecord): string => {
  const link = textOf(item.link)
  if (link) return link

  const guid = asRecord(item.guid)
  if (guid?.['@_isPermaLink'] === 'true') return textOf(item.guid)

  return ''
}

const matchesSourceFilter = (
  source: NewsSource,
  item: Pick<NewsItem, 'title' | 'snippet' | 'url' | 'categories'>
): boolean => {
  if (!source.filterKeywords?.length) return true
  const haystack = [
    item.title,
    item.snippet,
    item.url,
    ...item.categories
  ].join(' ').toLowerCase()
  return source.filterKeywords.some((keyword) => haystack.includes(keyword))
}

export const normalizeItem = (
  source: NewsSource,
  item: RssItemRecord
): NewsItem | null => {
  const title = stripHtml(textOf(item.title))
  const url = canonicalizeUrl(itemUrl(item))
  if (!title || !url) return null

  const rawSnippet = textOf(
    item.description ??
    item.summary ??
    item['content:encoded'] ??
    item.content
  )
  const snippet = truncate(stripHtml(rawSnippet))
  const categories = categoriesOf(item.category)
  const publishedAt = parseDate(item.pubDate ?? item.published ?? item.updated)
  const normalized = {
    id: `${source.id}:${hash(url)}`,
    sourceId: source.id,
    sourceLabel: source.label,
    title,
    url,
    publishedAt,
    snippet,
    imageUrl: extractImageUrl(item),
    categories
  }

  return matchesSourceFilter(source, normalized) ? normalized : null
}

export const extractItems = (xml: string): RssItemRecord[] => {
  const parsed = parser.parse(xml) as unknown
  const root = asRecord(parsed)
  const rss = asRecord(root?.rss)
  const channel = asRecord(rss?.channel)
  const atomFeed = asRecord(root?.feed)
  const items = channel?.item ?? atomFeed?.entry

  return asArray(items)
    .map(asRecord)
    .filter((item): item is RssItemRecord => Boolean(item))
}
