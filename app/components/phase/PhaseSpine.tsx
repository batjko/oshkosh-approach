import { useEffect, useRef } from 'react'
import { phases } from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'

/**
 * Numeric phase chips. Compact, single tight row, scroll-snap on mobile.
 * The active chip expands to show its short label so the user has anchor
 * context without a tall row.
 */
export const PhaseSpine = () => {
  const currentPhase = useAppStore((s) => s.currentPhase)
  const setCurrentPhase = useAppStore((s) => s.setCurrentPhase)
  const mode = useAppStore((s) => s.mode)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const active = activeRef.current
    if (!container || !active) return
    const left = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2
    container.scrollTo({ left, behavior: 'smooth' })
  }, [currentPhase])

  const currentOrder =
    phases.find((p) => p.id === currentPhase)?.order ?? 0

  return (
    <nav
      aria-label="Flight phase"
      className="border-b border-base-300 bg-base-100"
    >
      <div className="mx-auto w-full max-w-screen-xl">
        <div
          ref={containerRef}
          className="overflow-x-auto px-3 py-2 scrollbar-none scroll-fade-x tablet:px-6 tablet:scroll-fade-x-none"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <ol className="flex min-w-min items-center gap-1">
            {phases.map((phase) => {
              const isCurrent = phase.id === currentPhase
              const isPast = phase.order < currentOrder
              const disabled = mode === 'in-flight' && !isCurrent && !isPast
              return (
                <li
                  key={phase.id}
                  className="flex shrink-0 items-center"
                  style={{ scrollSnapAlign: 'center' }}
                >
                  <button
                    ref={isCurrent ? activeRef : null}
                    type="button"
                    onClick={() => setCurrentPhase(phase.id)}
                    disabled={disabled}
                    aria-current={isCurrent ? 'step' : undefined}
                    title={`Phase ${phase.order + 1}: ${phase.title}`}
                    className={`tap-target inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 text-xs font-semibold transition ${
                      isCurrent
                        ? 'border-primary bg-primary text-primary-content shadow-cockpit'
                        : isPast
                        ? 'border-success/40 bg-success/10 text-success'
                        : 'border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200'
                    } ${disabled ? 'opacity-40' : ''}`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-cockpit text-[11px] tabular-nums ${
                        isCurrent
                          ? 'bg-primary-content text-primary'
                          : isPast
                          ? 'bg-success text-success-content'
                          : 'bg-base-200'
                      }`}
                    >
                      {phase.order + 1}
                    </span>
                    {isCurrent && (
                      <span className="pr-1 leading-none">
                        {phase.cockpitTitle}
                      </span>
                    )}
                  </button>
                  {phase.order < phases.length - 1 && (
                    <span
                      aria-hidden
                      className={`h-px w-2 shrink-0 ${
                        isPast ? 'bg-success/50' : 'bg-base-300'
                      }`}
                    />
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </nav>
  )
}
