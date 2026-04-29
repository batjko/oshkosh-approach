import { sources } from '~/content/oshkosh'

interface SourceBadgeProps {
  ids: string[]
}

export const SourceBadge = ({ ids }: SourceBadgeProps) => {
  if (ids.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Source references">
      {ids.map((id) => {
        const src = sources[id]
        if (!src) return null
        const content = (
          <span className="source-badge" title={src.label}>
            {src.label.split(' ').slice(0, 4).join(' ')}
          </span>
        )
        return src.url ? (
          <a key={id} href={src.url} target="_blank" rel="noreferrer" className="hover:underline">
            {content}
          </a>
        ) : (
          <span key={id}>{content}</span>
        )
      })}
    </div>
  )
}
