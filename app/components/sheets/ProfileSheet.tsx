import { aircraftProfiles } from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'
import { Sheet } from '../sheet/Sheet'

export const ProfileSheet = () => {
  const profileId = useAppStore((s) => s.aircraftProfileId)
  const setProfileId = useAppStore((s) => s.setAircraftProfileId)
  const close = useAppStore((s) => s.closeSheet)

  return (
    <Sheet
      id="profile"
      title="Aircraft profile"
      description="Drives speed/altitude defaults and which arrival path applies."
      footer={
        <button
          type="button"
          onClick={close}
          className="btn btn-primary tap-target w-full"
          disabled={!profileId}
        >
          Done
        </button>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {aircraftProfiles.map((p) => {
          const active = profileId === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setProfileId(p.id)}
              aria-pressed={active}
              className={`tap-target rounded-cockpit border px-4 py-3 text-left transition ${
                active
                  ? 'border-primary bg-primary/10 shadow-cockpit'
                  : 'border-base-300 bg-base-100 hover:bg-base-200'
              }`}
            >
              <div className="text-sm font-semibold leading-tight">{p.label}</div>
              <div className="mt-1 text-xs text-base-content/70">
                {p.description}
              </div>
              {p.notes.length > 0 && active && (
                <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[11px] text-base-content/70">
                  {p.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}
