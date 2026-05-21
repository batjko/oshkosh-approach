import { useState } from 'react'
import {
  MdShield,
  MdFlight,
  MdCheckCircle,
  MdLaunch,
  MdArrowBack,
  MdArrowForward
} from 'react-icons/md'
import {
  aircraftProfiles,
  notice
} from '~/content/oshkosh'
import { useAppStore } from '~/store/useAppStore'

type StepId = 'notice' | 'profile' | 'ready'

const steps: StepId[] = ['notice', 'profile', 'ready']

const StepDot = ({ active, done }: { active: boolean; done: boolean }) => (
  <span
    className={`h-2 w-8 rounded-full transition-all ${
      done ? 'bg-success' : active ? 'bg-primary' : 'bg-base-300'
    }`}
    aria-hidden
  />
)

const StepHeading = ({
  icon,
  eyebrow,
  title,
  description
}: {
  icon: JSX.Element
  eyebrow: string
  title: string
  description: string
}) => (
  <div className="text-center">
    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-primary/80">
      {eyebrow}
    </p>
    <h2 className="mt-1 text-2xl font-semibold leading-tight text-base-content">
      {title}
    </h2>
    <p className="mx-auto mt-2 max-w-md text-sm text-base-content/70">
      {description}
    </p>
  </div>
)

/**
 * First-launch wizard. Three steps:
 *   1. Current Notice acknowledgement.
 *   2. Aircraft profile selection.
 *   3. Ready summary + dive in.
 *
 * Dismissible via "Skip for now". Skip still marks onboarding as
 * complete so the wizard doesn't reappear; the Notice and Profile
 * sheets remain accessible from the StatusBar.
 */
export const OnboardingFlow = () => {
  const acknowledged = useAppStore((s) => s.noticeYearAcknowledged)
  const setAcknowledged = useAppStore((s) => s.setNoticeYearAcknowledged)
  const profileId = useAppStore((s) => s.aircraftProfileId)
  const setProfileId = useAppStore((s) => s.setAircraftProfileId)
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)

  const [stepIdx, setStepIdx] = useState(0)
  const step = steps[stepIdx]

  const noticeAcked = acknowledged === notice.requiredYear
  const profilePicked = !!profileId

  const canAdvance =
    (step === 'notice' && noticeAcked) ||
    (step === 'profile' && profilePicked) ||
    step === 'ready'

  const next = () => {
    if (step === 'ready') {
      completeOnboarding()
      return
    }
    if (canAdvance) setStepIdx((i) => Math.min(i + 1, steps.length - 1))
  }
  const back = () => setStepIdx((i) => Math.max(i - 1, 0))
  const skip = () => completeOnboarding()

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-base-200/95 backdrop-blur md:items-center md:justify-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="flex h-[100dvh] w-full max-w-xl flex-col bg-base-100 shadow-cockpit md:h-auto md:max-h-[90dvh] md:rounded-cockpit"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <header className="flex items-center justify-between gap-3 border-b border-base-300 px-5 py-4">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <StepDot
                key={s}
                active={i === stepIdx}
                done={i < stepIdx || (i === 0 && noticeAcked) || (i === 1 && profilePicked)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={skip}
            className="btn btn-ghost btn-sm"
          >
            Skip for now
          </button>
        </header>

        <div id="onboarding-title" className="sr-only">
          Onboarding wizard
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          {step === 'notice' && (
            <div className="space-y-5">
              <StepHeading
                icon={<MdShield className="h-6 w-6" />}
                eyebrow="Step 1 of 3"
                title="Read the official Notice"
                description={`The FAA AirVenture Notice is the only authoritative source for arrival procedures. This app is loaded with the released ${notice.baselineYear} FAA/EAA AirVenture Notice.`}
              />

              <div className="rounded-cockpit bg-base-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                  Notice status
                </p>
                <p className="mt-1 text-sm">{notice.notes}</p>
              </div>

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

              <button
                type="button"
                onClick={() =>
                  setAcknowledged(noticeAcked ? null : notice.requiredYear)
                }
                aria-pressed={noticeAcked}
                className={`btn tap-target w-full gap-2 ${
                  noticeAcked ? 'btn-success' : 'btn-primary'
                }`}
              >
                <MdCheckCircle className="h-5 w-5" />
                {noticeAcked
                  ? `Acknowledged ${notice.requiredYear}`
                  : `I have read the ${notice.requiredYear} Notice`}
              </button>
              <p className="text-center text-xs text-base-content/60">
                Required to unlock Flight mode. You can change this later.
              </p>
            </div>
          )}

          {step === 'profile' && (
            <div className="space-y-5">
              <StepHeading
                icon={<MdFlight className="h-6 w-6" />}
                eyebrow="Step 2 of 3"
                title="Pick your aircraft profile"
                description="This drives speed/altitude defaults and which arrival path applies. You can change it any time."
              />

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
                      <div className="text-sm font-semibold leading-tight">
                        {p.label}
                      </div>
                      <div className="mt-1 text-xs text-base-content/70">
                        {p.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 'ready' && (
            <div className="space-y-5">
              <StepHeading
                icon={<MdCheckCircle className="h-6 w-6" />}
                eyebrow="Step 3 of 3"
                title="You're set"
                description="Plan your arrival on the ground. When you're ready to fly, switch to Flight mode for the cockpit-optimised view."
              />

              <ul className="mx-auto max-w-sm space-y-2 text-sm">
                <li className="flex items-center gap-3 rounded-lg bg-base-200 px-3 py-2">
                  <MdShield className="h-5 w-5 text-success" />
                  <span>
                    {noticeAcked
                      ? `Notice ${notice.requiredYear} acknowledged.`
                      : 'You have not acknowledged the Notice yet.'}
                  </span>
                </li>
                <li className="flex items-center gap-3 rounded-lg bg-base-200 px-3 py-2">
                  <MdFlight className="h-5 w-5 text-success" />
                  <span>
                    {profileId
                      ? `Profile: ${
                          aircraftProfiles.find((p) => p.id === profileId)?.label
                        }.`
                      : 'No profile picked yet.'}
                  </span>
                </li>
              </ul>

              <p className="text-center text-xs text-base-content/60">
                You can revisit either of these from the status bar later.
              </p>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-base-300 px-5 py-4">
          <button
            type="button"
            onClick={back}
            disabled={stepIdx === 0}
            className="btn btn-outline btn-sm gap-1 disabled:opacity-40"
          >
            <MdArrowBack className="h-4 w-4" /> Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance}
            className="btn btn-primary btn-sm gap-1 disabled:opacity-40"
          >
            {step === 'ready' ? 'Open the app' : 'Next'}
            <MdArrowForward className="h-4 w-4" />
          </button>
        </footer>
      </div>
    </div>
  )
}
