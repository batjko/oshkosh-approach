const ONBOARDING_HANDOFF_SESSION_KEY = 'osh-onboarding-handoff'

export const markOnboardingHandoff = (): void => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(ONBOARDING_HANDOFF_SESSION_KEY, 'pending')
  } catch {
    // Session storage can be unavailable in restricted browser contexts.
  }
}

export const consumeOnboardingHandoff = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const pending = window.sessionStorage.getItem(ONBOARDING_HANDOFF_SESSION_KEY) === 'pending'
    if (pending) window.sessionStorage.removeItem(ONBOARDING_HANDOFF_SESSION_KEY)
    return pending
  } catch {
    return false
  }
}
