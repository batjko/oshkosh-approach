import { useState } from 'react'
import { MdCheckCircleOutline, MdCheckCircle, MdStarBorder } from 'react-icons/md'
import type { ChecklistItem, PhaseId } from '~/content/oshkosh'
import { trackAppEvent } from '~/utils/analytics'

interface ChecklistProps {
  items: ChecklistItem[]
  variant?: 'default' | 'cockpit'
  phaseId?: PhaseId
  trackingKey?: 'primary' | 'secondary'
}

/**
 * Stateless-friendly checklist. Local toggle state is intentional - the
 * checklist is a working surface, not a persisted compliance log.
 */
export const Checklist = ({
  items,
  variant = 'default',
  phaseId,
  trackingKey
}: ChecklistProps) => {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const cockpit = variant === 'cockpit'

  const toggle = (item: ChecklistItem) => {
    const checked = !done[item.id]
    setDone((d) => ({ ...d, [item.id]: checked }))
    if (!phaseId || !trackingKey) return
    trackAppEvent('checklist item toggled', {
      phase: phaseId,
      checklist: trackingKey,
      item_id: item.id,
      checked,
      variant,
      required: !!item.required
    })
  }

  if (items.length === 0) return null

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const checked = !!done[item.id]
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item)}
              className={`checklist-row tap-target w-full text-left transition ${
                checked
                  ? 'border-success/50 bg-success/10'
                  : 'hover:border-base-content/20'
              } ${cockpit ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}
              aria-pressed={checked}
            >
              {checked ? (
                <MdCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : (
                <MdCheckCircleOutline className="mt-0.5 h-5 w-5 shrink-0 text-base-content/40" />
              )}
              <span className="flex-1">
                <span className={`block font-medium ${checked ? 'line-through opacity-70' : ''}`}>
                  {item.text}
                </span>
                {item.detail && (
                  <span className="mt-1 block text-xs text-base-content/60">
                    {item.detail}
                  </span>
                )}
              </span>
              {item.required && (
                <span className="pill-warn shrink-0">
                  <MdStarBorder className="h-3 w-3" /> required
                </span>
              )}
              {item.guidanceType && item.guidanceType !== 'faa-procedure' && (
                <span className="shrink-0 rounded-full border border-base-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-base-content/60">
                  {item.guidanceType === 'official-eaa-logistics'
                    ? 'EAA logistics'
                    : 'Pilot technique'}
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
