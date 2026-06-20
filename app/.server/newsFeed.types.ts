export interface NewsSource {
  id: string
  label: string
  feedUrl: string
  homepageUrl: string
  format?: 'rss' | 'eaa-airventure-html'
  filterKeywords?: string[]
}

export interface NewsSourceStatus {
  id: string
  label: string
  feedUrl: string
  homepageUrl: string
  status: 'ok' | 'error'
  error?: string
}

export interface NewsItem {
  id: string
  sourceId: string
  sourceLabel: string
  title: string
  url: string
  publishedAt: string
  snippet: string
  imageUrl?: string
  categories: string[]
}

export interface NewsFeedResult {
  items: NewsItem[]
  fetchedAt: string
  sources: NewsSourceStatus[]
}

export interface RssItemRecord {
  [key: string]: unknown
  title?: unknown
  link?: unknown
  guid?: unknown
  pubDate?: unknown
  published?: unknown
  updated?: unknown
  description?: unknown
  summary?: unknown
  'content:encoded'?: unknown
  content?: unknown
  category?: unknown
  enclosure?: unknown
  'media:content'?: unknown
  'media:thumbnail'?: unknown
}
