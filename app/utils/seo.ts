/**
 * SEO and AI discoverability helpers.
 *
 * Single source of truth for canonical origin, descriptive copy, social
 * metadata, and JSON-LD generation. Procedural facts (dates, airport
 * details) are pulled from `~/content/oshkosh` rather than duplicated
 * here, so the FAA Notice remains the authoritative source.
 */

import { event, notice, sources } from '~/content/oshkosh'

/** Canonical production origin. No trailing slash. */
export const SITE_ORIGIN = 'https://www.oshkosh-approach.com'

/** Human-readable site name used across meta and JSON-LD. */
export const SITE_NAME = 'Oshkosh Approach'

/** Long-form site title for the document `<title>`. */
export const SITE_TITLE =
  'Oshkosh Approach - Fisk VFR arrival companion for EAA AirVenture'

export const SITE_TAGLINE =
  'Source-backed Fisk VFR arrival companion for EAA AirVenture Oshkosh'

export const SITE_DESCRIPTION =
  'Phase-driven Fisk VFR arrival companion for EAA AirVenture Oshkosh ' +
  '(KOSH). Read the official FAA AirVenture Notice; this app surfaces ' +
  'frequencies, transitions, runway dots, holds, alternates, divert ' +
  'triggers, and live KOSH NOTAMs for general-aviation pilots flying in.'

/**
 * Keywords are advisory only for traditional search engines but help
 * AI summarisers anchor the topic. Keep concise and descriptive.
 */
export const SITE_KEYWORDS = [
  'EAA AirVenture Oshkosh',
  'Oshkosh arrival',
  'Fisk VFR arrival',
  'KOSH NOTAM',
  'AirVenture Notice',
  'Wittman Regional',
  'Ripon to Fisk',
  'general aviation',
  'pilot briefing',
  'VFR arrival procedure'
]

/** Default social/OG image; falls back gracefully if absent. */
export const SOCIAL_IMAGE_PATH = '/icons/icon-512.png'
export const SOCIAL_IMAGE_TYPE = 'image/png'
export const SOCIAL_IMAGE_WIDTH = 512
export const SOCIAL_IMAGE_HEIGHT = 512

export const TWITTER_CARD = 'summary'

/** Build an absolute URL from a path, preserving leading slashes. */
export const absoluteUrl = (path = '/'): string => {
  if (/^https?:\/\//i.test(path)) return path
  const trimmed = path.startsWith('/') ? path : `/${path}`
  return `${SITE_ORIGIN}${trimmed}`
}

/** Minimal XML-safe escape for sitemap and other XML resource routes. */
export const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/**
 * JSON-LD descriptors. Returned as a list of `@graph` entries so callers
 * can embed a single `<script type="application/ld+json">` tag.
 */
export const buildJsonLdGraph = (): Array<Record<string, unknown>> => {
  const homepage = absoluteUrl('/')

  const webSite = {
    '@type': 'WebSite',
    '@id': `${homepage}#website`,
    url: homepage,
    name: SITE_NAME,
    description: SITE_TAGLINE,
    inLanguage: 'en'
  }

  const webApplication = {
    '@type': 'WebApplication',
    '@id': `${homepage}#app`,
    name: SITE_NAME,
    alternateName: 'EAA AirVenture Oshkosh Approach Companion',
    url: homepage,
    applicationCategory: 'TravelApplication',
    applicationSubCategory: 'Aviation',
    operatingSystem: 'Web (PWA, iOS, Android, desktop browsers)',
    browserRequirements: 'Requires modern browser with JavaScript enabled',
    description: SITE_DESCRIPTION,
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  }

  const place = {
    '@type': 'Airport',
    '@id': `${homepage}#kosh`,
    name: `${event.airportName} (${event.airportIcao})`,
    iataCode: 'OSH',
    icaoCode: event.airportIcao,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Oshkosh',
      addressRegion: 'WI',
      addressCountry: 'US'
    }
  }

  const eventLd = {
    '@type': 'Event',
    '@id': `${homepage}#airventure`,
    name: 'EAA AirVenture Oshkosh',
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@id': `${homepage}#kosh` },
    description:
      'Annual EAA AirVenture fly-in convention at Wittman Regional ' +
      'Airport. Fisk VFR arrival procedure published yearly in the ' +
      'FAA AirVenture Notice.',
    url: sources['eaa-flying-hub']?.url ?? homepage,
    isAccessibleForFree: false,
    organizer: {
      '@type': 'Organization',
      name: 'Experimental Aircraft Association',
      url: 'https://www.eaa.org/'
    }
  }

  const noticePublication = {
    '@type': 'CreativeWork',
    '@id': `${homepage}#faa-notice`,
    name: `FAA AirVenture Notice (${notice.baselineYear})`,
    description:
      'Authoritative FAA Notice describing the Oshkosh VFR arrival, ' +
      'transitions, runway use, holds, and parking. Read this before ' +
      'using any third-party companion app.',
    url: notice.baselineUrl,
    datePublished: notice.publishedAt,
    publisher: {
      '@type': 'GovernmentOrganization',
      name: 'Federal Aviation Administration',
      url: 'https://www.faa.gov/'
    }
  }

  return [webSite, webApplication, place, eventLd, noticePublication]
}

/**
 * JSON-LD entries are typed loosely as `Record<string, unknown>` because
 * Schema.org has thousands of permissible properties per type and the
 * objects are immediately serialised by Remix - introducing a strict
 * TS shape per `@type` would be high-cost and brittle. The Remix
 * `MetaDescriptor` union accepts any string-indexed record.
 */
export const jsonLdMeta = (): Record<string, unknown> => ({
  'script:ld+json': {
    '@context': 'https://schema.org',
    '@graph': buildJsonLdGraph()
  }
})
