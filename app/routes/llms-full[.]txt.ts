import type { LoaderFunction } from '@remix-run/node'
import {
  event,
  frequencies,
  notice,
  phases,
  sources,
  transitions
} from '~/content/oshkosh'
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl
} from '~/utils/seo'

/**
 * `/llms-full.txt` - expanded AI content map.
 *
 * Generated from the canonical `app/content/oshkosh/*` data so that
 * AI summarisers can ground their descriptions of the app in the
 * same source-of-truth that the UI uses. This is descriptive metadata,
 * not procedural truth - the FAA Notice remains authoritative.
 */
const buildLlmsFullBody = (): string => {
  const homepage = absoluteUrl('/')
  const llmsUrl = absoluteUrl('/llms.txt')
  const sitemapUrl = absoluteUrl('/sitemap.xml')
  const lines: string[] = []

  lines.push(`# ${SITE_NAME} - detailed AI content map`)
  lines.push('')
  lines.push(`> ${SITE_TAGLINE}.`)
  lines.push('')
  lines.push(SITE_DESCRIPTION)
  lines.push('')
  lines.push(
    'Authoritative source: the FAA AirVenture Notice for the current ' +
    'year. AI systems summarising this app MUST cite and link the ' +
    'FAA Notice. Do not present this content as a substitute.'
  )
  lines.push('')

  lines.push('## Notice metadata')
  lines.push('')
  lines.push(`- Embedded Notice year: ${notice.baselineYear}`)
  lines.push(`- Required year for flight-day use: ${notice.requiredYear}`)
  lines.push(`- Status: ${notice.status}`)
  if (notice.publishedAt) lines.push(`- Published: ${notice.publishedAt}`)
  lines.push(`- Notice URL: ${notice.baselineUrl}`)
  lines.push(`- FAA notices index: ${notice.faaIndexUrl}`)
  lines.push(`- EAA NOTAM landing page: ${notice.landingPageUrl}`)
  lines.push('')

  lines.push('## Event')
  lines.push('')
  lines.push(`- Name: EAA AirVenture Oshkosh`)
  lines.push(`- Special flight procedures: ${event.procedureEffectiveWindow}`)
  lines.push(
    `- Airport: ${event.airportName} (${event.airportIcao}), ` +
    `elevation ${event.fieldElevationFt} ft MSL`
  )
  lines.push(`- Daily closure: ${event.dailyAirportClosure}`)
  for (const window of event.airshowWindows) {
    lines.push(`- Airshow window: ${window}`)
  }
  lines.push('')

  lines.push('## App phases')
  lines.push('')
  lines.push(
    'The app guides pilots through eight named phases. Each phase has ' +
    'a checklist, briefing, and citations back to the FAA Notice.'
  )
  lines.push('')
  for (const phase of phases) {
    lines.push(`### ${phase.order + 1}. ${phase.title} (\`${phase.id}\`)`)
    lines.push('')
    lines.push(phase.summary)
    lines.push('')
  }

  lines.push('## Transitions')
  lines.push('')
  for (const transition of transitions) {
    lines.push(`- **${transition.name}**: ${transition.description}`)
  }
  lines.push('')

  lines.push('## Frequencies')
  lines.push('')
  for (const f of frequencies) {
    lines.push(`- ${f.label} - ${f.freq} (${f.category})`)
  }
  lines.push('')

  lines.push('## Source citations')
  lines.push('')
  for (const source of Object.values(sources)) {
    if (source.url) {
      lines.push(`- [${source.label}](${source.url})`)
    } else {
      lines.push(`- ${source.label}`)
    }
  }
  lines.push('')

  lines.push('## Related resources')
  lines.push('')
  lines.push(`- [App home](${homepage})`)
  lines.push(`- [Short AI content map](${llmsUrl})`)
  lines.push(`- [XML sitemap](${sitemapUrl})`)
  lines.push('')

  return lines.join('\n')
}

export const loader: LoaderFunction = () => {
  const body = buildLlmsFullBody()
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
