import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { useAppStore, type SectionId } from '~/store/useAppStore'

export interface SectionTabDef {
  id: SectionId
  label: string
  icon?: ReactNode
  count?: number
}

interface SectionTabsProps {
  tabs: SectionTabDef[]
  /** ID of the panel container; tabs use `aria-controls` against it. */
  panelId: string
}

/**
 * WAI-ARIA tablist with arrow-key nav. Active tab is read from
 * `useAppStore.activeSection`. If the active section is not present in
 * the supplied `tabs`, the first tab is auto-selected as a side effect.
 */
export const SectionTabs = ({ tabs, panelId }: SectionTabsProps) => {
  const activeSection = useAppStore((s) => s.activeSection)
  const setActiveSection = useAppStore((s) => s.setActiveSection)
  const tablistId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const refs = useRef<Map<SectionId, HTMLButtonElement>>(new Map())

  useEffect(() => {
    if (!tabs.find((t) => t.id === activeSection)) {
      setActiveSection(tabs[0].id)
    }
  }, [tabs, activeSection, setActiveSection])

  useEffect(() => {
    const container = containerRef.current
    const active = refs.current.get(activeSection)
    if (!container || !active) return
    const left = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2
    container.scrollTo({ left, behavior: 'smooth' })
  }, [activeSection, tabs])

  const onKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End')
      return
    e.preventDefault()
    let nextIdx = idx
    if (e.key === 'ArrowLeft') nextIdx = idx === 0 ? tabs.length - 1 : idx - 1
    if (e.key === 'ArrowRight') nextIdx = idx === tabs.length - 1 ? 0 : idx + 1
    if (e.key === 'Home') nextIdx = 0
    if (e.key === 'End') nextIdx = tabs.length - 1
    const nextTab = tabs[nextIdx]
    setActiveSection(nextTab.id)
    refs.current.get(nextTab.id)?.focus()
  }

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Phase sections"
      id={tablistId}
      className="-mx-4 overflow-x-auto px-4 scrollbar-none scroll-fade-x tablet:mx-0 tablet:px-0 tablet:scroll-fade-x-none"
    >
      <div className="flex min-w-min items-center gap-1 border-b border-base-300">
        {tabs.map((tab, idx) => {
          const active = tab.id === activeSection
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) refs.current.set(tab.id, el)
                else refs.current.delete(tab.id)
              }}
              id={`tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={panelId}
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveSection(tab.id)}
              onKeyDown={(e) => onKey(e, idx)}
              className={`tap-target relative inline-flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? 'text-primary'
                  : 'text-base-content/70 hover:text-base-content'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                    active
                      ? 'bg-primary text-primary-content'
                      : 'bg-base-300 text-base-content/80'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              <span
                aria-hidden
                className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full transition ${
                  active ? 'bg-primary' : 'bg-transparent'
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
