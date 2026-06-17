import { MdOpenInNew } from 'react-icons/md'
import { Link } from '@remix-run/react'
import { discoverabilityNav } from '~/content/discoverability'
import { phaseById, sourceList } from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'
import { trackAppEvent } from '~/utils/analytics'

export const GlobalFooter = () => {
  const currentPhase = useAppStore((s) => s.currentPhase)
  const phase = phaseById(currentPhase)
  const phaseSources = phase ? sourceList(phase.sources) : []
  const trackSourceOpen = (sourceId: string) => {
    trackAppEvent('external link opened', {
      surface: 'global_footer',
      destination: 'phase_source',
      phase: currentPhase,
      source_id: sourceId
    })
  }

  return (
    <footer
      role="contentinfo"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-base-300/70 bg-base-100/90 text-[11px] shadow-sm backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-screen-xl items-center gap-3 px-4 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] tablet:px-6">
        <nav
          aria-label="Source references"
          className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap"
        >
          <span className="shrink-0 font-semibold uppercase tracking-wide text-base-content/45">
            Sources
          </span>
          {phaseSources.map((source) => source.url ? (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackSourceOpen(source.id)}
              className="inline-flex shrink-0 items-center gap-1 font-medium text-primary/80 underline-offset-4 hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
            >
              {source.label}
              <MdOpenInNew aria-hidden="true" className="h-3 w-3" />
            </a>
          ) : (
            <span key={source.id} className="shrink-0 text-base-content/55">
              {source.label}
            </span>
          ))}
        </nav>

        <nav
          aria-label="Briefing pages"
          className="hidden min-w-0 max-w-[22rem] items-center gap-2 overflow-x-auto whitespace-nowrap tablet:flex"
        >
          <span className="shrink-0 font-semibold uppercase tracking-wide text-base-content/45">
            Briefing
          </span>
          {discoverabilityNav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="shrink-0 font-medium text-primary/80 underline-offset-4 hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="https://batjko.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackAppEvent('external link opened', {
              surface: 'global_footer',
              destination: 'attribution',
              phase: currentPhase,
              source_id: null
            })
          }
          className="shrink-0 border-l border-base-300 pl-3 text-base-content/55 underline-offset-4 hover:text-base-content hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
          aria-label="Visit batjko.com"
        >
          &copy; batjko.com
        </a>
      </div>
    </footer>
  )
}
