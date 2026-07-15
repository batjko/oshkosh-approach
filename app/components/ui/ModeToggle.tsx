import { MdFlight, MdMenuBook, MdLock } from 'react-icons/md'
import { useAppStore } from '~/store/useAppStore'
import { canUseFlightMode, notice } from '~/content/oshkosh'

export const ModeToggle = () => {
  const mode = useAppStore((s) => s.mode)
  const setMode = useAppStore((s) => s.setMode)
  const acknowledged = useAppStore((s) => s.noticeYearAcknowledged)
  const inFlightAllowed = canUseFlightMode(acknowledged)

  const onInFlightClick = () => {
    setMode('in-flight')
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
