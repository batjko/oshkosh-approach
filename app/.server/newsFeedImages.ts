import type { NewsItem } from './newsFeed.types'
import {
  ARTICLE_IMAGE_CACHE_TTL_MS,
  ARTICLE_IMAGE_FETCH_TIMEOUT_MS
} from './newsFeedSources'
import { imageFromHtml } from './newsFeedParsing'

const articleImageCache = new Map<
  string,
  { expiresAt: number, imageUrl: string | null }
>()

const USER_AGENT =
  'Mozilla/5.0 (compatible; OshkoshApproachNews/1.0; +https://www.oshkosh-approach.com/)'

const fetchTextWithTimeout = async (
  url: string,
  timeoutMs: number,
  accept: string
): Promise<string> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: accept, 'User-Agent': USER_AGENT }
    })
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)
    return await response.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

const resolveUrl = (raw: string, baseUrl: string): string | null => {
  try {
    return new URL(raw, baseUrl).toString()
  } catch {
    return null
  }
}

const imageFromMeta = (html: string, pageUrl: string): string | null => {
  const metaMatch = html.match(
    /<meta\b(?=[^>]*(?:property|name)=["'](?:og:image|og:image:secure_url|twitter:image)["'])[^>]*content=["']([^"']+)["'][^>]*>/i
  ) ?? html.match(
    /<meta\b(?=[^>]*content=["']([^"']+)["'])[^>]*(?:property|name)=["'](?:og:image|og:image:secure_url|twitter:image)["'][^>]*>/i
  )

  const imageUrl = metaMatch?.[1]?.trim()
  if (imageUrl) return resolveUrl(imageUrl, pageUrl)

  const firstImage = imageFromHtml(html)
  return firstImage ? resolveUrl(firstImage, pageUrl) : null
}

const getArticleImage = async (item: NewsItem): Promise<string | null> => {
  const now = Date.now()
  const cached = articleImageCache.get(item.url)
  if (cached && cached.expiresAt > now) return cached.imageUrl

  try {
    const html = await fetchTextWithTimeout(
      item.url,
      ARTICLE_IMAGE_FETCH_TIMEOUT_MS,
      'text/html,application/xhtml+xml'
    )
    const imageUrl = imageFromMeta(html, item.url)
    articleImageCache.set(item.url, {
      imageUrl,
      expiresAt: now + ARTICLE_IMAGE_CACHE_TTL_MS
    })
    return imageUrl
  } catch {
    articleImageCache.set(item.url, {
      imageUrl: null,
      expiresAt: now + ARTICLE_IMAGE_CACHE_TTL_MS
    })
    return null
  }
}

export const attachArticleImages = async (
  items: NewsItem[]
): Promise<NewsItem[]> =>
  Promise.all(
    items.map(async (item) => {
      if (item.imageUrl) return item
      const imageUrl = await getArticleImage(item)
      return imageUrl ? { ...item, imageUrl } : item
    })
  )
