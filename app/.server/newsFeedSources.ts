import type { NewsSource } from './newsFeed.types'

export const NEWS_FETCH_TIMEOUT_MS = 8_000
export const ARTICLE_IMAGE_FETCH_TIMEOUT_MS = 4_000
export const NEWS_CACHE_TTL_MS = 10 * 60 * 1000
export const ARTICLE_IMAGE_CACHE_TTL_MS = 60 * 60 * 1000
export const MAX_NEWS_ITEMS = 60
export const SNIPPET_MAX_CHARS = 220

const AIRVENTURE_KEYWORDS = [
  'airventure',
  'oshkosh',
  'eaa',
  'kosh',
  'notam'
]

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'avweb',
    label: 'AVweb',
    feedUrl: 'https://avweb.com/topics/air-shows-events/airventure/feed/',
    homepageUrl: 'https://avweb.com/topics/air-shows-events/airventure/'
  },
  {
    id: 'flying',
    label: 'FLYING',
    feedUrl: 'https://www.flyingmag.com/airshows/eaa-airventure/feed/',
    homepageUrl: 'https://www.flyingmag.com/airshows/eaa-airventure/'
  },
  {
    id: 'aopa',
    label: 'AOPA',
    feedUrl: 'https://www.aopa.org/rss',
    homepageUrl: 'https://www.aopa.org/news-and-media/news-by-topic/events/eaa-airventure',
    filterKeywords: AIRVENTURE_KEYWORDS
  },
  {
    id: 'eaa-hangar',
    label: 'EAA Hangar Flying',
    feedUrl: 'https://inspire.eaa.org/category/airventure/feed/',
    homepageUrl: 'https://inspire.eaa.org/category/airventure/'
  }
]
