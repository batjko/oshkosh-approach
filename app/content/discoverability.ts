import {
  aircraftProfiles,
  alternates,
  event,
  frequencies,
  notice,
  phases,
  sources,
  transitions
} from './oshkosh'

export type DiscoverabilityPageId =
  | 'fisk-arrival'
  | 'oshkosh-notam-2026'
  | 'ripon-to-fisk'
  | 'airventure-arrival-briefing'
  | 'oshkosh-parking-signs'
  | 'oshkosh-alternates'
  | 'nordo-oshkosh'
  | 'kosh-notams'
  | 'sources'
  | 'about'

export interface DiscoverabilityLink {
  label: string
  href: string
}

export interface DiscoverabilitySection {
  heading: string
  body: string
  items?: string[]
  links?: DiscoverabilityLink[]
}

export interface DiscoverabilityFaq {
  question: string
  answer: string
}

export interface DiscoverabilityPage {
  id: DiscoverabilityPageId
  path: string
  title: string
  description: string
  h1: string
  intro: string
  lastmod: string
  sourceIds: string[]
  relatedPageIds: DiscoverabilityPageId[]
  sections: DiscoverabilitySection[]
  faqs?: DiscoverabilityFaq[]
}

export const discoverabilityNav: DiscoverabilityLink[] = [
  { label: 'Fisk arrival', href: '/fisk-arrival' },
  { label: 'Briefing', href: '/airventure-arrival-briefing' },
  { label: 'KOSH NOTAMs', href: '/kosh-notams' },
  { label: 'Sources', href: '/sources' }
]

const noticeLastmod = notice.publishedAt ?? `${notice.baselineYear}-01-01`
const fiskPhase = phases.find((phase) => phase.id === 'ripon-to-fisk')
const nordoProfile = aircraftProfiles.find((profile) => profile.id === 'nordo')

export const discoverabilityPages: DiscoverabilityPage[] = [
  {
    id: 'fisk-arrival',
    path: '/fisk-arrival',
    title: 'Fisk Arrival 2026 - Oshkosh Approach',
    description:
      'Source-backed overview of the 2026 Fisk VFR arrival flow for EAA AirVenture Oshkosh pilots, with links to the official FAA/EAA Notice.',
    h1: 'Fisk arrival companion for AirVenture Oshkosh 2026',
    intro:
      'The Fisk VFR arrival is the standard path many general aviation pilots brief before flying to EAA AirVenture Oshkosh. Oshkosh Approach packages the Notice-sourced flow into a phase-driven companion, while keeping the FAA/EAA AirVenture Notice as the authority.',
    lastmod: noticeLastmod,
    sourceIds: ['faa-2026-notice', 'eaa-notam-page', 'eaa-flying-hub', 'eaa-tips'],
    relatedPageIds: ['airventure-arrival-briefing', 'ripon-to-fisk', 'nordo-oshkosh'],
    sections: [
      {
        heading: 'What this page is for',
        body:
          'Use this page to understand what the app helps with before opening the operational companion. It is not a substitute for the official Notice, ATC instructions, ATIS, live NOTAMs, or pilot judgment.'
      },
      {
        heading: 'How the app structures the arrival',
        body:
          'The companion follows the pilot workflow as named phases, so the screen can stay focused on the current task instead of presenting the whole Notice at once.',
        items: phases.map((phase) => `${phase.order + 1}. ${phase.title}: ${phase.summary}`)
      },
      {
        heading: 'What pilots usually need at hand',
        body:
          'The app surfaces the current phase, briefing notes, transition context, map, runway assignment support, divert planning, aircraft profile, parking signs, alternates, and current KOSH NOTAMs fetched on each page load.'
      }
    ],
    faqs: [
      {
        question: 'Is Oshkosh Approach the official Fisk arrival procedure?',
        answer:
          'No. Oshkosh Approach is a free companion app. The FAA/EAA AirVenture Notice for the current year is authoritative.'
      },
      {
        question: 'What should I read before using the app in flight?',
        answer:
          'Read the current FAA/EAA AirVenture Notice cover to cover, then use the app as a phase-driven cockpit companion.'
      }
    ]
  },
  {
    id: 'oshkosh-notam-2026',
    path: '/oshkosh-notam-2026',
    title: 'Oshkosh NOTAM 2026 - FAA/EAA Notice Companion',
    description:
      'Where to find the official 2026 FAA/EAA AirVenture Notice and how Oshkosh Approach uses source-backed Notice metadata.',
    h1: 'Oshkosh NOTAM 2026 and FAA/EAA Notice links',
    intro:
      'Pilots often search for the Oshkosh NOTAM when they mean the annual FAA/EAA AirVenture Notice. The official Notice remains the authoritative procedure source; Oshkosh Approach keeps that source visible and gates flight-day mode on acknowledging it.',
    lastmod: noticeLastmod,
    sourceIds: ['faa-2026-notice', 'eaa-notam-page', 'faa-domestic-notices'],
    relatedPageIds: ['kosh-notams', 'sources', 'fisk-arrival'],
    sections: [
      {
        heading: 'Official Notice status',
        body:
          `The app is currently loaded with the ${notice.baselineYear} FAA/EAA AirVenture Notice. The embedded Notice status is "${notice.status}", and the required year for flight-day use is ${notice.requiredYear}.`
      },
      {
        heading: 'Authoritative links',
        body:
          'Use the official EAA and FAA pages for source documents and updates. Keep the Notice available before and during the flight.',
        links: [
          { label: 'FAA/EAA 2026 AirVenture Notice', href: notice.baselineUrl },
          { label: 'EAA AirVenture Notice landing page', href: notice.landingPageUrl },
          { label: 'FAA Domestic Notices index', href: notice.faaIndexUrl }
        ]
      },
      {
        heading: 'How Oshkosh Approach handles NOTAMs',
        body:
          'When connected, the app fetches KOSH NOTAMs through the server loader on every page load and keeps the homepage response uncached. Offline or failed fetches are labeled unavailable or not current.'
      }
    ],
    faqs: [
      {
        question: 'Does this page replace the Oshkosh NOTAM or FAA Notice?',
        answer:
          'No. This page points pilots to the official FAA/EAA Notice and explains how the companion app references it.'
      }
    ]
  },
  {
    id: 'ripon-to-fisk',
    path: '/ripon-to-fisk',
    title: 'Ripon to Fisk 2026 - Oshkosh Arrival Companion',
    description:
      'Source-backed overview of the Ripon to Fisk phase in the Oshkosh Approach companion for EAA AirVenture pilots.',
    h1: 'Ripon to Fisk companion briefing',
    intro:
      fiskPhase?.summary ??
      'The Ripon to Fisk segment is one of the highest-workload parts of the Oshkosh VFR arrival. The app keeps this phase separated from preflight planning and runway-assignment work.',
    lastmod: noticeLastmod,
    sourceIds: ['faa-2026-notice', 'eaa-tips'],
    relatedPageIds: ['fisk-arrival', 'airventure-arrival-briefing', 'oshkosh-alternates'],
    sections: [
      {
        heading: 'Phase focus',
        body:
          fiskPhase?.briefing ??
          'This phase focuses the pilot on the Notice-sourced arrival flow between Ripon and Fisk.'
      },
      {
        heading: 'Why it is split into its own page and app phase',
        body:
          'Searchers often ask about Ripon and Fisk directly. The companion treats the segment as a distinct phase so a pilot can brief it without mixing it with parking, departure, or alternate-airport detail.'
      },
      {
        heading: 'Related transitions',
        body:
          'When traffic volume changes, the Notice and ATC may direct pilots through different transition starts before Ripon.',
        items: transitions.map((transition) => `${transition.name}: ${transition.description}`)
      }
    ],
    faqs: [
      {
        question: 'Where should I verify Ripon to Fisk procedure details?',
        answer:
          'Verify all procedure details in the current FAA/EAA AirVenture Notice and follow ATC instructions.'
      }
    ]
  },
  {
    id: 'airventure-arrival-briefing',
    path: '/airventure-arrival-briefing',
    title: 'AirVenture Arrival Briefing 2026 - Oshkosh Approach',
    description:
      'A source-backed briefing overview for pilots preparing to fly to EAA AirVenture Oshkosh in 2026.',
    h1: 'AirVenture arrival briefing companion',
    intro:
      'Oshkosh Approach is built for pilots who have already read the official Notice and want a phase-driven briefing companion for tablet or phone use.',
    lastmod: noticeLastmod,
    sourceIds: ['faa-2026-notice', 'eaa-flying-hub', 'eaa-tips', 'faa-tfr'],
    relatedPageIds: ['fisk-arrival', 'oshkosh-parking-signs', 'oshkosh-alternates'],
    sections: [
      {
        heading: 'Event and procedure window',
        body:
          `The ${event.airportName} (${event.airportIcao}) special flight procedures window is ${event.procedureEffectiveWindow}. The app displays this Notice-derived window in status surfaces and briefing pages.`
      },
      {
        heading: 'Briefing checklist themes',
        body:
          'The companion organizes preparation around Notice review, current charts, EFB readiness, transition planning, TFR review, NOTAM review, signs, fuel, alternates, and right-seat role split.',
        items: phases[0]?.primaryActions.map((item) => item.text) ?? []
      },
      {
        heading: 'Operational companion',
        body:
          'Open the app homepage for the actual phase navigator, map, NOTAM list, runway tools, alternates, divert triggers, and cockpit-oriented in-flight mode.',
        links: [{ label: 'Open Oshkosh Approach app', href: '/' }]
      }
    ],
    faqs: [
      {
        question: 'Who is this briefing page for?',
        answer:
          'It is for general aviation pilots preparing to fly to EAA AirVenture Oshkosh who need a concise source-backed companion to the official Notice.'
      }
    ]
  },
  {
    id: 'oshkosh-parking-signs',
    path: '/oshkosh-parking-signs',
    title: 'Oshkosh Parking Signs 2026 - Arrival Sign Companion',
    description:
      'Source-backed overview of Oshkosh arrival and parking sign preparation, with links to official EAA sign resources.',
    h1: 'Oshkosh parking and arrival signs',
    intro:
      'Parking and arrival signs are part of the Oshkosh arrival prep workflow. Oshkosh Approach keeps sign preparation visible during preflight and in a reference sheet.',
    lastmod: noticeLastmod,
    sourceIds: ['faa-2026-notice', 'eaa-signs', 'eaa-aircraft-parking', 'eaa-parking-status'],
    relatedPageIds: ['airventure-arrival-briefing', 'oshkosh-alternates', 'sources'],
    sections: [
      {
        heading: 'Official sign resource',
        body:
          'Use the official EAA sign page for printable signs and current parking guidance. The app reminds pilots to prepare physical signs before flight.',
        links: [
          { label: 'EAA arrival and parking signs', href: sources['eaa-signs'].url ?? 'https://www.eaa.org/signs' },
          { label: 'EAA aircraft parking', href: sources['eaa-aircraft-parking'].url ?? 'https://www.eaa.org/aircraftparking' }
        ]
      },
      {
        heading: 'How the app presents signs',
        body:
          'The companion keeps parking and departure sign references in a sheet so pilots can review codes without losing their place in the main phase flow.'
      },
      {
        heading: 'Source boundary',
        body:
          'The app does not turn sign references into a standalone authority. If the official EAA or FAA resource changes, use the official source.'
      }
    ],
    faqs: [
      {
        question: 'Can I use a tablet display as my Oshkosh parking sign?',
        answer:
          'Use the current FAA/EAA Notice and official EAA sign instructions for the accepted sign format. The app directs pilots to print physical signs.'
      }
    ]
  },
  {
    id: 'oshkosh-alternates',
    path: '/oshkosh-alternates',
    title: 'Oshkosh Alternates 2026 - KOSH Arrival Companion',
    description:
      'Source-backed overview of alternate airport planning surfaced by Oshkosh Approach for AirVenture pilots.',
    h1: 'Oshkosh alternate airport planning companion',
    intro:
      'Alternate planning matters before launching for AirVenture. Oshkosh Approach keeps divert triggers and alternate-airport references close to the active phase flow.',
    lastmod: noticeLastmod,
    sourceIds: ['faa-2026-notice', 'eaa-flying-hub'],
    relatedPageIds: ['airventure-arrival-briefing', 'fisk-arrival', 'kosh-notams'],
    sections: [
      {
        heading: 'Alternates surfaced in the app',
        body:
          'The app lists Notice-sourced alternate options in a reference sheet and from divert flows.',
        items: alternates.map((alternate) => `${alternate.icao} ${alternate.name}: ${alternate.description}`)
      },
      {
        heading: 'How to use this page',
        body:
          'Use this page to understand that alternates are part of the companion workflow. Before flight, brief fuel, weather, closures, saturation, and current airport information from authoritative sources.'
      },
      {
        heading: 'Open the companion',
        body:
          'The homepage includes the interactive alternates sheet and divert triggers.',
        links: [{ label: 'Open Oshkosh Approach app', href: '/' }]
      }
    ],
    faqs: [
      {
        question: 'Does the app choose an alternate for me?',
        answer:
          'No. It surfaces source-backed alternate references and divert triggers. The pilot remains responsible for flight planning and decisions.'
      }
    ]
  },
  {
    id: 'nordo-oshkosh',
    path: '/nordo-oshkosh',
    title: 'NORDO Oshkosh 2026 - Arrival Companion',
    description:
      'Source-backed overview of how Oshkosh Approach represents the NORDO aircraft profile for AirVenture planning.',
    h1: 'NORDO Oshkosh companion overview',
    intro:
      'NORDO procedures are specialized and should be briefed from the current FAA/EAA AirVenture Notice. Oshkosh Approach includes a NORDO aircraft profile so pilots can keep this case distinct from the standard Fisk flow.',
    lastmod: noticeLastmod,
    sourceIds: ['faa-2026-notice'],
    relatedPageIds: ['fisk-arrival', 'oshkosh-notam-2026', 'sources'],
    sections: [
      {
        heading: 'Profile in the app',
        body:
          nordoProfile?.description ??
          'The app includes a NORDO profile for aircraft and pilots who need the Notice-specified no-radio workflow.'
      },
      {
        heading: 'Planning notes',
        body:
          'The companion separates aircraft profiles because speed, route, and communication assumptions vary. Always verify NORDO eligibility and steps in the official Notice.'
      },
      {
        heading: 'Related app behavior',
        body:
          'Selecting an aircraft profile changes the planning defaults and keeps profile-specific notes visible without changing the stored identity or collecting call signs.'
      }
    ],
    faqs: [
      {
        question: 'Is NORDO for any radio failure?',
        answer:
          'No. Verify current Notice wording and eligibility. The app treats NORDO as a distinct profile rather than a generic lost-communications fallback.'
      }
    ]
  },
  {
    id: 'kosh-notams',
    path: '/kosh-notams',
    title: 'KOSH NOTAMs - Live Oshkosh NOTAM Companion',
    description:
      'How Oshkosh Approach fetches and presents KOSH NOTAMs when connected without caching FAA NOTAM text in static pages.',
    h1: 'KOSH NOTAM companion',
    intro:
      'Current KOSH NOTAMs are time-sensitive. Oshkosh Approach fetches them for the main app route on every page load and keeps this static page descriptive only.',
    lastmod: noticeLastmod,
    sourceIds: ['faa-2026-notice', 'faa-domestic-notices'],
    relatedPageIds: ['oshkosh-notam-2026', 'airventure-arrival-briefing', 'sources'],
    sections: [
      {
        heading: 'Live NOTAM behavior',
        body:
          'The homepage loader fetches current KOSH NOTAMs and returns no-store headers. Static SEO pages do not embed raw NOTAM text, so crawlers do not preserve stale operational notices.'
      },
      {
        heading: 'Priority model',
        body:
          'The app uses a keyword-based scan aid to surface NOTAMs that may need prompt review. This is not an FAA priority assessment; pilots must review the raw text and complete a full briefing.'
      },
      {
        heading: 'Open the live NOTAM view',
        body:
          'Use the app homepage and the NOTAMs tab for the current fetched list.',
        links: [{ label: 'Open Oshkosh Approach app', href: '/' }]
      }
    ],
    faqs: [
      {
        question: 'Why does this page not show the current NOTAM list?',
        answer:
          'Static pages can be cached or indexed. The live app route fetches current KOSH NOTAMs on reload instead.'
      }
    ]
  },
  {
    id: 'sources',
    path: '/sources',
    title: 'Sources - Oshkosh Approach',
    description:
      'Source list for Oshkosh Approach, including the FAA/EAA AirVenture Notice and official EAA/FAA references.',
    h1: 'Oshkosh Approach sources',
    intro:
      'Oshkosh Approach is source-backed. Procedural content is traced to the FAA/EAA AirVenture Notice and official EAA/FAA resources where available.',
    lastmod: noticeLastmod,
    sourceIds: Object.keys(sources),
    relatedPageIds: ['oshkosh-notam-2026', 'fisk-arrival', 'about'],
    sections: [
      {
        heading: 'Authoritative source',
        body:
          'The FAA/EAA AirVenture Notice for the current year is authoritative for Oshkosh VFR arrival procedures. The app is a companion, not a replacement.',
        links: [{ label: `FAA/EAA ${notice.baselineYear} AirVenture Notice`, href: notice.baselineUrl }]
      },
      {
        heading: 'Reference links',
        body:
          'These are the source references currently known to the app.',
        links: Object.values(sources)
          .filter((source) => Boolean(source.url))
          .map((source) => ({
            label: source.label,
            href: source.url as string
          }))
      },
      {
        heading: 'Citation policy',
        body:
          'New procedural content should not be added unless it can be traced to the current Notice or another appropriate official source.'
      }
    ]
  },
  {
    id: 'about',
    path: '/about',
    title: 'About Oshkosh Approach',
    description:
      'About Oshkosh Approach, a free source-backed Fisk VFR arrival companion for EAA AirVenture Oshkosh pilots.',
    h1: 'About Oshkosh Approach',
    intro:
      'Oshkosh Approach is a free, tablet-friendly companion for general aviation pilots preparing for and flying the AirVenture arrival.',
    lastmod: noticeLastmod,
    sourceIds: ['faa-2026-notice', 'eaa-flying-hub'],
    relatedPageIds: ['airventure-arrival-briefing', 'sources', 'kosh-notams'],
    sections: [
      {
        heading: 'Purpose',
        body:
          'The app turns source-backed arrival content into a phase-driven workflow for preflight and cockpit use. It is designed to reduce screen hunting, not to replace official sources.'
      },
      {
        heading: 'Safety boundary',
        body:
          'The FAA/EAA AirVenture Notice, live NOTAMs, ATIS, ATC instructions, weather, and pilot judgment remain authoritative.'
      },
      {
        heading: 'What it includes',
        body:
          'The app includes phase navigation, connected KOSH NOTAM fetches, transition references, an orientation map, runway assignment tools, aircraft profiles, alternates, signs, and divert planning.',
        items: frequencies.map((frequency) => `${frequency.label}: ${frequency.category}`)
      }
    ]
  }
]

export const discoverabilityPageById = (
  id: DiscoverabilityPageId
): DiscoverabilityPage => {
  const page = discoverabilityPages.find((item) => item.id === id)
  if (!page) throw new Error(`Unknown discoverability page: ${id}`)
  return page
}

export const relatedDiscoverabilityPages = (
  page: DiscoverabilityPage
): DiscoverabilityPage[] =>
  page.relatedPageIds.map(discoverabilityPageById)
