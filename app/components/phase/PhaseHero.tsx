import {
  MdChevronLeft,
  MdChevronRight,
  MdRadio,
  MdWarningAmber
} from 'react-icons/md'
import { phases, frequencyById, type PhaseId } from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'

/**
 * Maps each phase to a short cockpit cue and (optionally) a key frequency
 * to highlight. Used when the phase has no `speedAltitude` block.
 */
const phaseCue: Record<
  PhaseId,
  { cue: string; frequencyId?: string }
> = {
  preflight: { cue: 'Read the Notice. Print signs. Load charts.' },
  enroute: {
    cue: 'Tune ATIS 125.9 at 60 NM. Lights ON at 50 NM.',
    frequencyId: 'arrival-atis'
  },
  transition: {
    cue: 'Cross the assigned start. 90 kt / 1,800 MSL.',
    frequencyId: 'fisk-approach'
  },
  'ripon-to-fisk': {
    cue: 'Tracks NE. Sterile cockpit. 0.5 NM in-trail.',
    frequencyId: 'fisk-approach'
  },
  'at-fisk': {
    cue: 'Capture: runway, transition, tower freq.',
    frequencyId: 'fisk-approach'
  },
  'inbound-runway': {
    cue: 'Land on the assigned dot. Short approach.'
  },
  ground: { cue: 'Exit, stop on grass. Sign on LEFT windshield.' },
  depart: {
    cue: 'Departure ATIS 121.75. Display departure sign.',
    frequencyId: 'departure-atis'
  }
}

interface PhaseHeroProps {
  variant?: 'plan' | 'flight'
}

export const PhaseHero = ({ variant = 'plan' }: PhaseHeroProps) => {
  const phaseId = useAppStore((s) => s.currentPhase)
  const phase = phases.find((p) => p.id === phaseId)
  const next = useAppStore((s) => s.nextPhase)
  const prev = useAppStore((s) => s.prevPhase)
  if (!phase) return null

  const currentIndex = phase.order
  const isFirst = currentIndex === 0
  const isLast = currentIndex === phases.length - 1
  const cue = phaseCue[phase.id]
  const focalFreq = cue.frequencyId ? frequencyById(cue.frequencyId) : undefined
  const cockpit = variant === 'flight'

  return (
    <section
      aria-labelledby={`phase-hero-${phase.id}`}
      className={`mx-auto w-full max-w-screen-xl px-4 ${cockpit ? 'pt-3' : 'pt-4'}`}
    >
      <div
        className={`briefing-card relative overflow-hidden ${
          cockpit ? 'border-2 border-primary/60' : ''
        }`}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-base-content/60">
              Phase {phase.order + 1} of {phases.length}
            </p>
            <h2
              id={`phase-hero-${phase.id}`}
              className={`mt-1 truncate font-semibold ${
                cockpit ? 'text-2xl' : 'text-xl'
              }`}
            >
              {phase.title}
            </h2>
          </div>
        </header>

        {phase.speedAltitude && phase.speedAltitude.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {phase.speedAltitude.slice(0, 2).map((sa, i) => (
              <div
                key={`${sa.ias_kt}-${sa.altitude_ft_msl}-${i}`}
                className="rounded-cockpit bg-base-200 p-3"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-base-content/60">
                  {sa.label ?? 'Profile'}
                </div>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="font-cockpit text-numeral-md text-primary tabular-nums">
                    {sa.ias_kt}
                  </span>
                  <span className="text-xs text-base-content/60">kt</span>
                </div>
                <div className="font-cockpit text-xs text-base-content/70 tabular-nums">
                  {sa.altitude_ft_msl.toLocaleString()} ft MSL
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p
            className={`mt-3 leading-snug text-base-content ${
              cockpit ? 'text-lg' : 'text-base'
            }`}
          >
            {cue.cue}
          </p>
        )}

        {focalFreq && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
            <MdRadio className="h-4 w-4" aria-hidden />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-primary/80">
              {focalFreq.label}
            </span>
            <span className="font-cockpit text-base font-bold tabular-nums">
              {focalFreq.freq}
            </span>
          </div>
        )}

        {phase.warnings && phase.warnings.length > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-cockpit border-l-4 border-warning bg-warning/10 px-3 py-2 text-xs">
            <MdWarningAmber className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <span className="leading-snug">{phase.warnings[0]}</span>
          </div>
        )}

        <footer className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={isFirst}
            className="btn btn-outline btn-sm tap-target gap-1 disabled:opacity-40"
          >
            <MdChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-[11px] uppercase tracking-wide text-base-content/60">
            {phase.cockpitTitle}
          </span>
          <button
            type="button"
            onClick={next}
            disabled={isLast}
            className="btn btn-primary btn-sm tap-target gap-1 disabled:opacity-40"
          >
            Next <MdChevronRight className="h-4 w-4" />
          </button>
        </footer>
      </div>
    </section>
  )
}
