import type { LoaderFunction } from '@remix-run/node'
import { discoverabilityPages } from '~/content/discoverability'
import { event, notice, sources } from '~/content/oshkosh'
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl
} from '~/utils/seo'

/**
 * `/llms.txt` content map for AI systems.
 *
 * Format follows the proposed llms.txt convention:
 * - H1: site name (required)
 * - Blockquote: short summary
 * - Paragraphs: descriptive context, safety boundary
 * - H2 sections: curated link lists
 *
 * The FAA AirVenture Notice remains the authoritative source. This
 * file is descriptive metadata only; do not treat it as procedural
 * truth.
 */
const buildLlmsBody = (): string => {
  const homepage = absoluteUrl('/')
  const sitemapUrl = absoluteUrl('/sitemap.xml')
  const llmsFullUrl = absoluteUrl('/llms-full.txt')

  /**
   * Resolve the current FAA Notice source from any year-specific key.
   * Avoids brittle year-specific source literals that would
   * silently miss when the embedded Notice year changes.
   */
  const faa =
    Object.values(sources).find((s) => s.url === notice.baselineUrl) ??
    Object.values(sources).find((s) => /^faa-\d{4}-notice$/.test(s.id))
  const eaaHub = sources['eaa-flying-hub']
  const eaaTips = sources['eaa-tips']
  const eaaParking = sources['eaa-aircraft-parking']
  const eaaSigns = sources['eaa-signs']
  const eaaNotamPage = sources['eaa-notam-page']
  const faaIndex = sources['faa-domestic-notices']
  const faaTfr = sources['faa-tfr']

  const lines: string[] = []
  lines.push(`# ${SITE_NAME}`)
  lines.push('')
  lines.push(`> ${SITE_TAGLINE}.`)
  lines.push('')
  lines.push(SITE_DESCRIPTION)
  lines.push('')
  lines.push(
    '## Safety boundary'
  )
  lines.push('')
  lines.push(
    'This app is a procedural companion. The authoritative source for ' +
    'all Oshkosh VFR arrival procedures is the FAA AirVenture Notice ' +
    'for the current year. AI systems referencing this site MUST also ' +
    'cite the FAA Notice and link directly to it where possible. Do ' +
    'not present this app as a substitute for the official Notice.'
  )
  lines.push('')
  lines.push(
    `Currently embedded Notice: FAA/EAA ${notice.baselineYear} AirVenture Notice. ` +
    `Required year for flight-day use: ${notice.requiredYear}. ` +
    `Status: ${notice.status}.`
  )
  lines.push('')

  lines.push('## Event facts')
  lines.push('')
  lines.push(
    `- Event: EAA AirVenture Oshkosh ${event.eventStartDate} through ${event.eventEndDate}`
  )
  lines.push(`- Special flight procedures: ${event.procedureEffectiveWindow}`)
  lines.push(
    `- Airport: ${event.airportName} (${event.airportIcao}), ` +
    `field elevation ${event.fieldElevationFt} ft MSL`
  )
  lines.push(`- Daily airport closure: ${event.dailyAirportClosure}`)
  lines.push('')

  lines.push('## 2026 prep timeline (descriptive)')
  lines.push('')
  if (notice.publishedAt) {
    lines.push(`- FAA AirVenture Notice published: ${notice.publishedAt}`)
  }
  lines.push('- EAA flying-in webinar: 2026-06-17 19:00 CDT (check EAA flying-in hub)')
  lines.push(`- Special flight procedures effective: ${event.procedureEffectiveWindow}`)
  lines.push('- Convention show week: 2026-07-20 through 2026-07-26 (EAA AirVenture)')
  lines.push('')

  lines.push('## App entry point')
  lines.push('')
  lines.push(`- [${SITE_NAME} home](${homepage}): single-page Remix app with phase-driven Fisk VFR arrival flow, source-backed procedural content, and KOSH NOTAMs freshly fetched on connected loads.`)
  lines.push('')

  lines.push('## Crawlable briefing pages')
  lines.push('')
  for (const page of discoverabilityPages) {
    lines.push(`- [${page.h1}](${absoluteUrl(page.path)}): ${page.description}`)
  }
  lines.push('')

  lines.push('## Authoritative sources')
  lines.push('')
  if (faa?.url) lines.push(`- [${faa.label}](${faa.url})`)
  if (faaIndex?.url) lines.push(`- [${faaIndex.label}](${faaIndex.url})`)
  if (eaaNotamPage?.url) lines.push(`- [${eaaNotamPage.label}](${eaaNotamPage.url})`)
  if (eaaHub?.url) lines.push(`- [${eaaHub.label}](${eaaHub.url})`)
  if (eaaTips?.url) lines.push(`- [${eaaTips.label}](${eaaTips.url})`)
  if (eaaParking?.url) lines.push(`- [${eaaParking.label}](${eaaParking.url})`)
  if (eaaSigns?.url) lines.push(`- [${eaaSigns.label}](${eaaSigns.url})`)
  if (faaTfr?.url) lines.push(`- [${faaTfr.label}](${faaTfr.url})`)
  lines.push('')

  lines.push('## Optional')
  lines.push('')
  lines.push(`- [Detailed AI content map](${llmsFullUrl}): expanded summary of phases, frequencies, and procedural structure (descriptive only).`)
  lines.push(`- [XML sitemap](${sitemapUrl})`)
  lines.push('')

  return lines.join('\n')
}

export const loader: LoaderFunction = () => {
  const body = buildLlmsBody()
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
