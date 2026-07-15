export type PwaInstallMethod = 'native_prompt' | 'ios_instructions'

interface NavigatorLike {
  userAgent: string
  platform: string
  maxTouchPoints: number
}

export const isIosInstallCapable = (navigator: NavigatorLike): boolean => {
  const mobileIos = /iPad|iPhone|iPod/i.test(navigator.userAgent)
  const desktopClassIpad =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return mobileIos || desktopClassIpad
}

export const getPwaInstallMethod = ({
  canInstall,
  canShowIosInstructions
}: {
  canInstall: boolean
  canShowIosInstructions: boolean
}): PwaInstallMethod | null => {
  if (canInstall) return 'native_prompt'
  if (canShowIosInstructions) return 'ios_instructions'
  return null
}

export const canShowPwaInstallCard = ({
  storageChecked,
  hasHydrated,
  onboardingComplete,
  mode,
  isStandalone,
  dismissed,
  method
}: {
  storageChecked: boolean
  hasHydrated: boolean
  onboardingComplete: boolean
  mode: 'pre-flight' | 'in-flight'
  isStandalone: boolean
  dismissed: boolean
  method: PwaInstallMethod | null
}): boolean =>
  storageChecked &&
  hasHydrated &&
  onboardingComplete &&
  mode === 'pre-flight' &&
  !isStandalone &&
  !dismissed &&
  method !== null
