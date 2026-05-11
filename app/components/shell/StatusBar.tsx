import { useEffect, useState } from 'react'
import {
  MdShield,
  MdFlight,
  MdGpsFixed,
  MdGpsOff,
  MdEvent,
  MdCloudOff
} from 'react-icons/md'
import {
  aircraftProfiles,
  event,
  notice
} from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'

const useOnline = () => {
  const [online, setOnline] = useState(true)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    setOnline(navigator.onLine)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

interface PillButtonProps {
  onClick?: () => void
  active?: boolean
  warn?: boolean
  ariaLabel: string
  icon: JSX.Element
  label: string
  detail?: string
}

const PillButton = ({
  onClick,
  active,
  warn,
  ariaLabel,
  icon,
  label,
  detail
}: PillButtonProps) => {
  const tone = warn
    ? 'bg-warning/15 text-warning hover:bg-warning/20'
    : active
    ? 'bg-success/15 text-success hover:bg-success/20'
    : 'bg-base-100 text-base-content/80 hover:bg-base-200'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`tap-target inline-flex shrink-0 items-center gap-1.5 rounded-full border border-base-300 px-3 py-1 text-xs font-medium transition ${tone}`}
    >
      {icon}
      <span className="leading-none">{label}</span>
      {detail && (
        <span className="font-cockpit tabular-nums text-[11px] opacity-80">
          {detail}
        </span>
      )}
    </button>
  )
}

/**
 * Status bar: notice, profile, GPS, dates pills. Notice and profile pills
 * open their respective sheets. GPS pill toggles geolocation opt-in.
 */
export const StatusBar = () => {
  const acknowledged = useAppStore((s) => s.noticeYearAcknowledged)
  const profileId = useAppStore((s) => s.aircraftProfileId)
  const gpsEnabled = useAppStore((s) => s.gpsEnabled)
  const setGpsEnabled = useAppStore((s) => s.setGpsEnabled)
  const location = useAppStore((s) => s.currentLocation)
  const openSheet = useAppStore((s) => s.openSheetAction)
  const online = useOnline()

  const noticeOk = acknowledged === notice.requiredYear
  const profile = aircraftProfiles.find((p) => p.id === profileId)

  return (
    <div className="border-b border-base-300 bg-base-200/80 backdrop-blur">
      <div className="mx-auto w-full max-w-screen-xl px-4 py-1.5 tablet:px-6">
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-none scroll-fade-x tablet:mx-0 tablet:overflow-visible tablet:px-0 tablet:scroll-fade-x-none">
          <div className="flex min-w-min items-center gap-1.5 tablet:min-w-0 tablet:flex-wrap">
            <PillButton
              onClick={() => openSheet('notice')}
              active={noticeOk}
              warn={!noticeOk}
              ariaLabel="Notice status, opens notice sheet"
              icon={<MdShield className="h-3.5 w-3.5" />}
              label={
                noticeOk ? `Notice ${notice.requiredYear}` : 'Notice not read'
              }
            />
            <PillButton
              onClick={() => openSheet('profile')}
              active={!!profile}
              warn={!profile}
              ariaLabel="Aircraft profile, opens profile sheet"
              icon={<MdFlight className="h-3.5 w-3.5" />}
              label={profile ? profile.label.split(' (')[0] : 'No profile'}
            />
            <PillButton
              onClick={() => setGpsEnabled(!gpsEnabled)}
              active={!!location}
              ariaLabel={
                gpsEnabled
                  ? location
                    ? 'GPS active. Tap to disable.'
                    : 'GPS waiting for fix. Tap to disable.'
                  : 'Use GPS. Tap to enable geolocation.'
              }
              icon={
                location ? (
                  <MdGpsFixed className="h-3.5 w-3.5" />
                ) : (
                  <MdGpsOff className="h-3.5 w-3.5" />
                )
              }
              label={
                gpsEnabled
                  ? location
                    ? 'GPS'
                    : 'GPS waiting'
                  : 'Use GPS'
              }
              detail={
                location ? `±${Math.round(location.accuracy)}m` : undefined
              }
            />
            <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 max-[430px]:pr-2">
              {!online && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">
                  <MdCloudOff className="h-3 w-3" /> Offline
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] text-base-content/60">
                <MdEvent className="h-3 w-3" />
                {event.startDate.slice(5)} - {event.endDate.slice(5)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
