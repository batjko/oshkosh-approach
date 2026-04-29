import { MdLaunch, MdCheck } from 'react-icons/md'
import { notice } from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'
import { Sheet } from '../sheet/Sheet'

export const NoticeSheet = () => {
  const acknowledged = useAppStore((s) => s.noticeYearAcknowledged)
  const setAcknowledged = useAppStore((s) => s.setNoticeYearAcknowledged)
  const close = useAppStore((s) => s.closeSheet)
  const isUnlocked = acknowledged === notice.requiredYear

  return (
    <Sheet
      id="notice"
      title={
        notice.status === 'released'
          ? `Notice ${notice.baselineYear} loaded`
          : `Procedural baseline: ${notice.baselineYear} Notice`
      }
      description="The official FAA AirVenture Notice is the only authoritative source. Read it before you fly."
      footer={
        <button
          type="button"
          onClick={() => {
            setAcknowledged(isUnlocked ? null : notice.requiredYear)
            if (!isUnlocked) close()
          }}
          aria-pressed={isUnlocked}
          className={`btn tap-target w-full gap-2 ${
            isUnlocked ? 'btn-success' : 'btn-primary'
          }`}
        >
          <MdCheck className="h-5 w-5" />
          {isUnlocked
            ? `Acknowledged ${notice.requiredYear} - tap to revoke`
            : `I have read the ${notice.requiredYear} Notice`}
        </button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">{notice.notes}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={notice.landingPageUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline tap-target gap-2"
          >
            <MdLaunch className="h-4 w-4" /> EAA Notice page
          </a>
          <a
            href={notice.faaIndexUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost tap-target gap-2"
          >
            <MdLaunch className="h-4 w-4" /> FAA Domestic Notices
          </a>
        </div>

        <p className="text-xs text-base-content/60">
          Acknowledgement gates in-flight mode and is also required by Reset
          onboarding.
        </p>
      </div>
    </Sheet>
  )
}
