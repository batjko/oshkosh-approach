import type { LoaderFunction } from '@remix-run/node'
import { notice } from '~/content/oshkosh'
import { absoluteUrl, escapeXml } from '~/utils/seo'

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
  priority?: number
}

/**
 * Single-page sitemap. The app is intentionally one route; we expose
 * the supporting resource routes too so AI/search crawlers can find
 * the content map.
 */
const buildEntries = (): SitemapEntry[] => {
  const today = new Date().toISOString().slice(0, 10)
  const lastmod = notice.publishedAt ?? today

  return [
    {
      loc: absoluteUrl('/'),
      lastmod,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: absoluteUrl('/llms.txt'),
      lastmod,
      changefreq: 'monthly',
      priority: 0.5
    },
    {
      loc: absoluteUrl('/llms-full.txt'),
      lastmod,
      changefreq: 'monthly',
      priority: 0.4
    }
  ]
}

const renderEntry = (entry: SitemapEntry): string => {
  const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`]
  if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`)
  if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`)
  if (typeof entry.priority === 'number') {
    parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`)
  }
  return `  <url>\n${parts.join('\n')}\n  </url>`
}

const buildSitemapBody = (): string => {
  const entries = buildEntries().map(renderEntry).join('\n')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</urlset>',
    ''
  ].join('\n')
}

export const loader: LoaderFunction = () => {
  const body = buildSitemapBody()
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
