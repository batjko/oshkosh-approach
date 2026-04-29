import type { ReactNode } from 'react'
import { useAppStore, type SectionId } from '~/store/useAppStore'

interface SectionPanelProps {
  id: string
  sectionId: SectionId
  children: ReactNode
}

/**
 * Renders only when its `sectionId` matches the active section in the
 * store. Provides the WAI-ARIA `tabpanel` semantics paired with
 * `SectionTabs`.
 */
export const SectionPanel = ({ id, sectionId, children }: SectionPanelProps) => {
  const active = useAppStore((s) => s.activeSection) === sectionId
  if (!active) return null
  return (
    <div
      id={id}
      role="tabpanel"
      tabIndex={0}
      aria-labelledby={`tab-${sectionId}`}
      className="pt-4 focus:outline-none"
    >
      {children}
    </div>
  )
}
