import { MdLaunch } from 'react-icons/md'
import { arrivalSigns, departureSigns, signRules } from '~/content/oshkosh'
import { Sheet } from '../sheet/Sheet'

const SignGroup = ({
  title,
  signs
}: {
  title: string
  signs: ReadonlyArray<{ code: string; meaning: string }>
}) => (
  <section className="space-y-2">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
      {title}
    </h3>
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
      {signs.map((s) => (
        <div
          key={s.code}
          className="flex items-baseline justify-between gap-2 rounded-md bg-base-200 px-2 py-1.5 text-xs"
        >
          <span className="font-cockpit font-bold text-primary">{s.code}</span>
          <span
            className="truncate text-right text-base-content/70"
            title={s.meaning}
          >
            {s.meaning}
          </span>
        </div>
      ))}
    </div>
  </section>
)

export const SignsSheet = () => (
  <Sheet
    id="signs"
    title="Parking & departure signs"
    description="Print physical signs - tablet displays are not accepted."
    footer={
      <a
        href="https://www.eaa.org/signs"
        target="_blank"
        rel="noreferrer"
        className="btn btn-primary tap-target w-full gap-2"
      >
        <MdLaunch className="h-4 w-4" /> Print at eaa.org/signs
      </a>
    }
  >
    <div className="space-y-5">
      <SignGroup title="Arrival signs" signs={arrivalSigns} />
      <SignGroup title="Departure signs" signs={departureSigns} />
      <section className="rounded-cockpit bg-base-200 p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Sign rules
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-base-content/80">
          {signRules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
    </div>
  </Sheet>
)
