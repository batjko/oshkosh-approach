import { useCallback, useEffect, useRef, useState } from 'react'
import { MdArticle, MdOpenInNew, MdRefresh } from 'react-icons/md'
import { SidePanel } from '~/components/panel/SidePanel'
import { useAppStore } from '~/store/useAppStore'
import { trackAppEvent, type NewsLoadMoreTrigger } from '~/utils/analytics'
import { NewsFeedList } from './NewsFeedList'
import type {
  NewsFeedResponse,
  NewsFeedStatus,
  NewsItem,
  NewsSourceStatus
} from './types'

const PAGE_SIZE = 12
const MAX_ITEMS = 60

const OFFICIAL_EAA_NEWS_URL =
  'https://www.eaa.org/airventure/eaa-airventure-news-and-multimedia/eaa-airventure-news'
const OFFICIAL_NOTICE_URL =
  'https://www.eaa.org/airventure/eaa-fly-in-flying-to-oshkosh/eaa-airventure-oshkosh-notam'

type NewsFeedTrigger = 'initial' | 'refresh' | 'retry' | 'load_more'

const isNewsFeedResponse = (value: unknown): value is NewsFeedResponse => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<NewsFeedResponse>
  return (
    Array.isArray(candidate.items) &&
    typeof candidate.total === 'number' &&
    typeof candidate.hasMore === 'boolean' &&
    typeof candidate.fetchedAt === 'string' &&
    Array.isArray(candidate.sources)
  )
}

const mergeItems = (existing: NewsItem[], incoming: NewsItem[]): NewsItem[] => {
  const seen = new Set(existing.map((item) => item.id))
  return [
    ...existing,
    ...incoming.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  ].slice(0, MAX_ITEMS)
}

const formatFetchedAt = (iso: string): string => {
  if (!iso) return 'Not loaded yet'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Not loaded yet'
  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 16)}Z`
}

const SourceSummary = ({
  sources,
  onSourceOpen
}: {
  sources: NewsSourceStatus[]
  onSourceOpen: (sourceId: string) => void
}) => {
  if (sources.length === 0) return null
  const available = sources.filter((source) => source.status === 'ok')

  return (
    <div className="flex min-w-0 flex-wrap gap-1">
      {available.map((source) => (
        <a
          key={source.id}
          href={source.homepageUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => onSourceOpen(source.id)}
          className="rounded-full border border-base-300 bg-base-100 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-base-content/70 hover:border-primary/40 hover:text-primary"
        >
          {source.id}
        </a>
      ))}
    </div>
  )
}

export const NewsPanel = () => {
  const open = useAppStore((s) => s.openSheet) === 'news'
  const currentPhase = useAppStore((s) => s.currentPhase)
  const [items, setItems] = useState<NewsItem[]>([])
  const [sources, setSources] = useState<NewsSourceStatus[]>([])
  const [status, setStatus] = useState<NewsFeedStatus>('idle')
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [fetchedAt, setFetchedAt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const loadingRef = useRef(false)

  const loadPage = useCallback(async (
    offset: number,
    trigger: NewsFeedTrigger,
    loadMoreTrigger?: NewsLoadMoreTrigger
  ) => {
    if (loadingRef.current) return
    loadingRef.current = true
    abortRef.current?.abort()

    const controller = new AbortController()
    const startedAt = Date.now()
    abortRef.current = controller
    setStatus(offset === 0 ? 'loading' : 'loadingMore')
    setError(null)

    try {
      const response = await fetch(`/api/news?offset=${offset}&limit=${PAGE_SIZE}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
      }

      const payload = (await response.json()) as unknown
      if (!isNewsFeedResponse(payload)) {
        throw new Error('Unexpected news response')
      }

      setItems((current) => (
        offset === 0 ? payload.items.slice(0, MAX_ITEMS) : mergeItems(current, payload.items)
      ))
      setHasMore(payload.hasMore && offset + payload.items.length < MAX_ITEMS)
      setTotal(Math.min(payload.total, MAX_ITEMS))
      setFetchedAt(payload.fetchedAt)
      setSources(payload.sources)
      setStatus('ready')

      const sourceOkCount = payload.sources.filter((source) => source.status === 'ok').length
      const sourceErrorCount = payload.sources.length - sourceOkCount
      trackAppEvent('news feed loaded', {
        status: 'success',
        trigger,
        offset,
        item_count: payload.items.length,
        total: Math.min(payload.total, MAX_ITEMS),
        source_ok_count: sourceOkCount,
        source_error_count: sourceErrorCount,
        elapsed_ms: Date.now() - startedAt
      })
      if (trigger === 'refresh') {
        trackAppEvent('news feed refreshed', { item_count: payload.items.length })
      }
      if (trigger === 'load_more' && loadMoreTrigger) {
        trackAppEvent('news load more', {
          trigger: loadMoreTrigger,
          offset,
          items_added: payload.items.length
        })
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        if (abortRef.current === controller) {
          setStatus(offset === 0 ? 'idle' : 'ready')
        }
        return
      }
      setError(err instanceof Error ? err.message : 'Unknown news feed error')
      setStatus(offset === 0 ? 'error' : 'ready')
      trackAppEvent('news feed loaded', {
        status: 'error',
        trigger,
        offset,
        item_count: 0,
        total: 0,
        source_ok_count: 0,
        source_error_count: 0,
        elapsed_ms: Date.now() - startedAt
      })
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        loadingRef.current = false
      }
    }
  }, [])

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort()
      abortRef.current = null
      loadingRef.current = false
      return
    }

    if (items.length === 0 && status === 'idle') {
      void loadPage(0, 'initial')
    }
  }, [items.length, loadPage, open, status])

  const retry = () => {
    abortRef.current?.abort()
    loadingRef.current = false
    setItems([])
    setHasMore(true)
    setTotal(0)
    void loadPage(0, status === 'error' ? 'retry' : 'refresh')
  }

  const loadMore = (trigger: NewsLoadMoreTrigger) => {
    if (!hasMore || items.length >= MAX_ITEMS) return
    void loadPage(items.length, 'load_more', trigger)
  }

  const trackExternalLink = (
    destination: 'official_eaa_news' | 'official_notice' | 'news_source_homepage',
    sourceId: string | null = null
  ) => {
    trackAppEvent('external link opened', {
      surface: destination === 'news_source_homepage' ? 'news_source_chip' : 'news_panel',
      destination,
      phase: currentPhase,
      source_id: sourceId
    })
  }

  const onArticleOpen = (item: NewsItem) => {
    trackAppEvent('news article opened', {
      source_id: item.sourceId,
      item_id: item.id,
      has_image: !!item.imageUrl
    })
  }

  return (
    <SidePanel
      id="news"
      title="AirVenture news"
      description="Recent stories from aviation news sources."
    >
      <div className="space-y-4">
        <section className="rounded-cockpit border border-base-300 bg-base-100 px-3 py-2">
          <div className="flex items-center gap-2">
            <MdArticle className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-sm font-semibold">Latest first</h3>
                {items.length > 0 && (
                  <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] text-base-content/70">
                    {items.length}
                    {total > items.length ? ` of ${total}` : ''} loaded
                  </span>
                )}
                <span className="text-[11px] text-base-content/60">
                  Updated {formatFetchedAt(fetchedAt)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <SourceSummary
                  sources={sources}
                  onSourceOpen={(sourceId) =>
                    trackExternalLink('news_source_homepage', sourceId)
                  }
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs min-h-8 shrink-0 gap-1 px-2"
                  onClick={retry}
                  disabled={status === 'loading' || status === 'loadingMore'}
                >
                  <MdRefresh className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>
            </div>
          </div>
        </section>

        <NewsFeedList
          items={items}
          status={status}
          hasMore={hasMore}
          error={error}
          sources={sources}
          onLoadMore={loadMore}
          onRetry={retry}
          onArticleOpen={onArticleOpen}
        />

        <section className="rounded-cockpit border border-base-300 bg-base-100 p-3 text-xs text-base-content/65">
          <div className="flex flex-wrap gap-2">
            <a
              href={OFFICIAL_EAA_NEWS_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackExternalLink('official_eaa_news')}
              className="inline-flex items-center gap-1 font-medium text-primary"
            >
              Official EAA News <MdOpenInNew className="h-3.5 w-3.5" />
            </a>
            <a
              href={OFFICIAL_NOTICE_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackExternalLink('official_notice')}
              className="inline-flex items-center gap-1 font-medium text-primary"
            >
              FAA/EAA Notice <MdOpenInNew className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="mt-2">
            News is informational. The FAA AirVenture Notice, live NOTAMs,
            ATIS, and ATC remain authoritative.
          </p>
        </section>
      </div>
    </SidePanel>
  )
}
