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

export interface NewsFeedResponse {
  items: NewsItem[]
  total: number
  hasMore: boolean
  fetchedAt: string
  sources: NewsSourceStatus[]
}

export type NewsFeedStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'loadingMore'
  | 'error'
