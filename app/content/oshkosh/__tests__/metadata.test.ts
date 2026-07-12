import { describe, expect, it } from 'vitest'

import { discoverabilityPageById } from '~/content/discoverability'
import { event } from '..'
import { buildJsonLdGraph } from '~/utils/seo'

describe('event and procedure metadata', () => {
  it('uses convention dates for Event JSON-LD', () => {
    const eventNode = buildJsonLdGraph().find((node) => node['@type'] === 'Event')
    expect(eventNode?.startDate).toBe(event.eventStartDate)
    expect(eventNode?.endDate).toBe(event.eventEndDate)
  })

  it('uses the procedure window in the arrival briefing', () => {
    const page = discoverabilityPageById('airventure-arrival-briefing')
    const copy = JSON.stringify(page)
    expect(copy).toContain(event.procedureEffectiveWindow)
    expect(copy).not.toContain('07-16 - 07-27')
  })
})
