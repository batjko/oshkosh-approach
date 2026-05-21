import { MdImage, MdOpenInNew } from 'react-icons/md'
import type { NewsItem } from './types'

interface NewsCardProps {
  item: NewsItem
}

const formatPublishedAt = (iso: string): string => {
  if (!iso) return 'Date unavailable'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const lineClamp = (lines: number) => ({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical' as const,
  WebkitLineClamp: lines,
  overflow: 'hidden'
})

export const NewsCard = ({ item }: NewsCardProps) => {
  const categories = item.categories.slice(0, 2)

  return (
    <article className="rounded-cockpit border border-base-300 bg-base-100 shadow-sm transition-colors hover:border-primary/40">
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="grid gap-3 p-3 text-base-content no-underline max-[374px]:grid-cols-1 min-[375px]:grid-cols-[6.75rem_minmax(0,1fr)]"
      >
        <div className="h-24 overflow-hidden rounded-cockpit border border-base-300 bg-base-200 max-[374px]:h-32">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-base-content/35">
              <MdImage className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-base-content/65">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-cockpit text-[10px] font-semibold uppercase tracking-wide text-primary">
              {item.sourceId}
            </span>
            <span className="font-medium">{item.sourceLabel}</span>
            <span aria-hidden="true">|</span>
            <time dateTime={item.publishedAt}>{formatPublishedAt(item.publishedAt)}</time>
          </div>

          <h3
            className="mt-1.5 text-sm font-semibold leading-snug"
            style={lineClamp(2)}
          >
            {item.title}
          </h3>

          {item.snippet && (
            <p
              className="mt-1.5 text-xs leading-relaxed text-base-content/70"
              style={lineClamp(3)}
            >
              {item.snippet}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-base-200 px-2 py-0.5 text-[10px] text-base-content/65"
              >
                {category}
              </span>
            ))}
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-primary">
              Open <MdOpenInNew className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </a>
    </article>
  )
}
