import { MdAirlineStops } from 'react-icons/md'
import { phaseById } from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'

const FLIGHT_DIVERT_FROM_ORDER = 2 // 'transition'

/**
 * Floating action button for divert. Visible only in flight mode and only
 * from the 'transition' phase onwards. In plan mode the divert is reachable
 * from the AppBar overflow menu (or by opening the divert sheet through
 * any direct call site).
 */
export const DivertFab = () => {
  const mode = useAppStore((s) => s.mode)
  const phaseId = useAppStore((s) => s.currentPhase)
  const open = useAppStore((s) => s.openSheetAction)
  const phase = phaseById(phaseId)

  if (mode !== 'in-flight') return null
  if (!phase || phase.order < FLIGHT_DIVERT_FROM_ORDER) return null

  return (
    <button
      type="button"
      onClick={() => open('divert', { surface: 'divert_fab' })}
      aria-label="Open divert sheet"
      className="fixed bottom-4 right-4 z-40 flex h-14 items-center gap-2 rounded-full border border-error/30 bg-error px-4 text-sm font-semibold text-error-content shadow-cockpit transition hover:scale-105 hover:bg-error/90"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
        right: 'calc(env(safe-area-inset-right) + 1rem)'
      }}
    >
      <MdAirlineStops className="h-6 w-6" />
      <span>Divert</span>
    </button>
  )
}
