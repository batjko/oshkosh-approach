import { useState } from 'react'
import { MdWarningAmber, MdClose } from 'react-icons/md'
import { useAppStore } from '~/store/useAppStore'

interface CriticalNotam {
  id: string
  number: string
  text: string
}

const MAX_VISIBLE = 3

/**
 * Phase-agnostic keyword triage for NOTAMs that may be critical.
 * The raw FAA text is always shown; the label is not an FAA assessment.
 *
 * If empty (the common case during normal ops), the banner renders
 * nothing. Capped at 3 visible items with a "more" affordance that
 * jumps to the NOTAMs tab.
 */
export const CriticalNotamBanner = ({
  criticalNotams
}: {
  criticalNotams: CriticalNotam[]
}) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const setActiveSection = useAppStore((s) => s.setActiveSection)

  const visible = criticalNotams.filter((n) => !dismissed.has(n.id))
  if (visible.length === 0) return null

  const shown = visible.slice(0, MAX_VISIBLE)
  const overflow = visible.length - shown.length

  return (
    <div className="border-b border-error/30 bg-error/10">
      <div className="mx-auto w-full max-w-screen-xl space-y-1 px-4 py-2">
        {shown.map((n) => (
          <div
            key={n.id}
            role="alert"
            className="flex items-start gap-2 text-xs"
          >
            <MdWarningAmber className="mt-0.5 h-4 w-4 shrink-0 text-error" />
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-error">
                Potentially critical — keyword match · {n.number}
              </span>
              <span className="ml-1 line-clamp-2 text-base-content/80">
                {n.text}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDismissed((prev) => new Set(prev).add(n.id))}
              className="btn btn-ghost btn-xs"
              aria-label={`Dismiss potentially critical NOTAM ${n.number}`}
            >
              <MdClose className="h-3 w-3" />
            </button>
          </div>
        ))}
        {overflow > 0 && (
          <button
            type="button"
            onClick={() => setActiveSection('notams')}
            className="link link-error text-xs underline-offset-2"
          >
            +{overflow} more potential match{overflow === 1 ? '' : 'es'} —
            open NOTAMs tab
          </button>
        )}
      </div>
    </div>
  )
}
