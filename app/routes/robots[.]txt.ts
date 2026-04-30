import type { LoaderFunction } from '@remix-run/node'
import { absoluteUrl } from '~/utils/seo'

/**
 * `/robots.txt` resource route. Allow public crawling and link the
 * sitemap and AI content map. AI crawlers are explicitly welcomed
 * because the goal here is discoverability, not gating.
 */
const buildRobotsBody = (): string => {
  const sitemapUrl = absoluteUrl('/sitemap.xml')
  const llmsUrl = absoluteUrl('/llms.txt')

  const lines = [
    '# Oshkosh Approach - https://www.oshkosh-approach.com',
    '# Public Fisk VFR arrival companion. Crawling is welcome.',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# AI / LLM crawlers - explicitly allowed for discoverability.',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: OAI-SearchBot',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    'User-agent: anthropic-ai',
    'Allow: /',
    '',
    'User-agent: Claude-Web',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    'User-agent: Perplexity-User',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    'User-agent: GoogleOther',
    'Allow: /',
    '',
    'User-agent: Applebot-Extended',
    'Allow: /',
    '',
    'User-agent: CCBot',
    'Allow: /',
    '',
    'User-agent: cohere-ai',
    'Allow: /',
    '',
    'User-agent: Bytespider',
    'Allow: /',
    '',
    `Sitemap: ${sitemapUrl}`,
    `# AI content map: ${llmsUrl}`,
    ''
  ]
  return lines.join('\n')
}

export const loader: LoaderFunction = () => {
  const body = buildRobotsBody()
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
