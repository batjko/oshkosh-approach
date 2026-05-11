import { MdFlight, MdMenuBook, MdLock } from 'react-icons/md'
import { useAppStore } from '~/store/useAppStore'
import { isFlightDayUnlocked, notice } from '~/content/oshkosh'
import { trackAppEvent } from '~/utils/analytics'

export const ModeToggle = () => {
  const mode = useAppStore((s) => s.mode)
  const setMode = useAppStore((s) => s.setMode)
  const acknowledged = useAppStore((s) => s.noticeYearAcknowledged)
  const inFlightAllowed =
    isFlightDayUnlocked() || acknowledged === notice.requiredYear

  const onInFlightClick = () => {
    if (inFlightAllowed) {
      setMode('in-flight')
    } else {
      trackAppEvent('mode changed', {
        mode: 'in-flight',
        reason: 'blocked_notice'
      })
    }
  }

  return (
    <div className="join" role="group" aria-label="App mode">
      <button
        type="button"
        className={`btn btn-sm join-item min-h-12 gap-1 px-3 ${
          mode === 'pre-flight' ? 'btn-primary' : 'btn-ghost'
        }`}
        onClick={() => setMode('pre-flight')}
        aria-pressed={mode === 'pre-flight'}
      >
        <MdMenuBook className="h-4 w-4" /> Plan
      </button>
      <button
        type="button"
        className={`btn btn-sm join-item min-h-12 gap-1 px-3 ${
          mode === 'in-flight' ? 'btn-primary' : 'btn-ghost'
        } ${!inFlightAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onInFlightClick}
        aria-pressed={mode === 'in-flight'}
        aria-disabled={!inFlightAllowed}
        title={
          inFlightAllowed
            ? 'Switch to in-flight mode'
            : `Acknowledge the ${notice.requiredYear} Notice to enable in-flight mode`
        }
      >
        {inFlightAllowed ? (
          <MdFlight className="h-4 w-4" />
        ) : (
          <MdLock className="h-4 w-4" />
        )}
        Flight
      </button>
    </div>
  )
}
