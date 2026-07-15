import { describe, expect, it } from 'vitest'

import {
  discoverabilityPages,
  relatedDiscoverabilityPages
} from '../discoverability'

describe('discoverability page links', () => {
  it('keeps every related briefing valid, unique, and contextual', () => {
    for (const page of discoverabilityPages) {
      const related = relatedDiscoverabilityPages(page)
      const relatedIds = related.map((item) => item.id)

      expect(related).toHaveLength(3)
      expect(new Set(relatedIds).size).toBe(relatedIds.length)
      expect(relatedIds).not.toContain(page.id)
    }
  })

  it('gives every discoverability page at least one internal inbound link', () => {
    const inboundIds = new Set(
      discoverabilityPages.flatMap((page) => page.relatedPageIds)
    )

    expect(inboundIds).toEqual(
      new Set(discoverabilityPages.map((page) => page.id))
    )
  })
})
