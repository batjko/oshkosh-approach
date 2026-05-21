import { aircraftProfiles } from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'
import { Sheet } from '../sheet/Sheet'

export const ProfileSheet = () => {
  const profileId = useAppStore((s) => s.aircraftProfileId)
  const setProfileId = useAppStore((s) => s.setAircraftProfileId)
  const close = useAppStore((s) => s.closeSheet)
  const activeProfile = aircraftProfiles.find((p) => p.id === profileId)

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
      <div className="space-y-3">
        <div className="grid items-start gap-2 sm:grid-cols-2">
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
              </button>
            )
          })}
        </div>

        {activeProfile && activeProfile.notes.length > 0 && (
          <section className="rounded-cockpit bg-base-200 p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
              {activeProfile.label} notes
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-base-content/80">
              {activeProfile.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Sheet>
  )
}
