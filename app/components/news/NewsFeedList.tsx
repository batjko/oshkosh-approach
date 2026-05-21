import { useEffect, useRef } from 'react'
import { MdError, MdRefresh, MdWarning } from 'react-icons/md'
import type { NewsLoadMoreTrigger } from '~/utils/analytics'
import { NewsCard } from './NewsCard'
import type { NewsFeedStatus, NewsItem, NewsSourceStatus } from './types'

interface NewsFeedListProps {
  items: NewsItem[]
  status: NewsFeedStatus
  hasMore: boolean
  error: string | null
  sources: NewsSourceStatus[]
  onLoadMore: (trigger: NewsLoadMoreTrigger) => void
  onRetry: () => void
  onArticleOpen: (item: NewsItem) => void
}

const SourceWarning = ({ sources }: { sources: NewsSourceStatus[] }) => {
  const failedSources = sources.filter((source) => source.status === 'error')
  if (failedSources.length === 0) return null

  return (
    <div className="rounded-cockpit border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
      <div className="flex items-start gap-2">
        <MdWarning className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <div className="font-semibold">Some sources are unavailable</div>
          <p className="mt-0.5 text-xs leading-relaxed">
            Showing available articles from{' '}
            {sources.filter((source) => source.status === 'ok').length || 'other'}{' '}
            sources.
          </p>
        </div>
      </div>
    </div>
  )
}

const LoadingCards = () => (
  <div className="space-y-3" aria-hidden="true">
    {[0, 1, 2].map((item) => (
      <div
        key={item}
        className="grid animate-pulse gap-3 rounded-cockpit border border-base-300 bg-base-100 p-3 max-[374px]:grid-cols-1 min-[375px]:grid-cols-[6.75rem_minmax(0,1fr)]"
      >
        <div className="h-24 rounded-cockpit bg-base-200 max-[374px]:h-32" />
        <div className="min-w-0 space-y-2">
          <div className="h-3 w-32 rounded bg-base-200" />
          <div className="h-4 w-11/12 rounded bg-base-200" />
          <div className="h-3 w-full rounded bg-base-200" />
          <div className="h-3 w-3/4 rounded bg-base-200" />
        </div>
      </div>
    ))}
  </div>
)

export const NewsFeedList = ({
  items,
  status,
  hasMore,
  error,
  sources,
  onLoadMore,
  onRetry,
  onArticleOpen
}: NewsFeedListProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || status === 'loading' || status === 'loadingMore') {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadMore('intersection')
      },
      { rootMargin: '360px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore, status])

  if (status === 'loading' && items.length === 0) {
    return <LoadingCards />
  }

  if (status === 'error' && items.length === 0) {
    return (
      <div className="rounded-cockpit border border-error/30 bg-error/10 p-4 text-sm text-error">
        <div className="flex items-start gap-2">
          <MdError className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">News could not load</div>
            {error && <p className="mt-1 text-xs opacity-80">{error}</p>}
            <button
              type="button"
              className="btn btn-outline btn-sm mt-3 min-h-10 gap-1"
              onClick={onRetry}
            >
              <MdRefresh className="h-4 w-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-cockpit border border-base-300 bg-base-100 p-5 text-center text-sm text-base-content/65">
        No AirVenture news matched the configured sources yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <SourceWarning sources={sources} />
      {items.map((item) => (
        <NewsCard key={item.id} item={item} onOpen={onArticleOpen} />
      ))}
      {hasMore && (
        <div ref={sentinelRef} className="py-2">
          {status === 'loadingMore' ? (
            <div className="rounded-cockpit bg-base-200 px-3 py-2 text-center text-xs text-base-content/60">
              Loading older stories...
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-ghost min-h-12 w-full text-sm"
              onClick={() => onLoadMore('button')}
            >
              Load older stories
            </button>
          )}
        </div>
      )}
    </div>
  )
}
