import type { LoaderFunction } from '@remix-run/node'
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
   * Avoids brittle `sources['faa-2025-notice']` literals that would
   * silently miss when the baseline rolls to 2026 and beyond.
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
    `Currently embedded baseline: FAA ${notice.baselineYear} Notice. ` +
    `Required year for flight-day use: ${notice.requiredYear}. ` +
    `Status: ${notice.status}.`
  )
  lines.push('')

  lines.push('## Event facts')
  lines.push('')
  lines.push(`- Event: EAA AirVenture Oshkosh ${event.startDate.slice(0, 4)}`)
  lines.push(`- Dates: ${event.startDate} to ${event.endDate}`)
  lines.push(
    `- Airport: ${event.airportName} (${event.airportIcao}), ` +
    `field elevation ${event.fieldElevationFt} ft MSL`
  )
  lines.push(`- Daily airport closure: ${event.dailyAirportClosure}`)
  lines.push('')

  lines.push('## App entry point')
  lines.push('')
  lines.push(`- [${SITE_NAME} home](${homepage}): single-page Remix app with phase-driven Fisk VFR arrival flow, source-backed procedural content, and live KOSH NOTAMs fetched on each load.`)
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
