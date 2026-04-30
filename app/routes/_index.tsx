import { useEffect } from 'react'
import type { MetaFunction } from '@remix-run/react'
import type { LoaderFunction, HeadersFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getKoshNotams, type NotamFetchResult } from '../.server/notamList'
import { FiskApproachApp } from '~/components/FiskApproachApp'
import { clientLogger } from '~/lib/clientLogger'
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_IMAGE_PATH,
  SOCIAL_IMAGE_TYPE,
  SOCIAL_IMAGE_WIDTH,
  TWITTER_CARD,
  absoluteUrl,
  jsonLdMeta
} from '~/utils/seo'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0'
}

export const headers: HeadersFunction = () => NO_STORE_HEADERS

export const loader: LoaderFunction = async () => {
  const result = await getKoshNotams()
  return json(result, { headers: NO_STORE_HEADERS })
}

const CANONICAL_URL = absoluteUrl('/')
const SOCIAL_IMAGE_URL = absoluteUrl(SOCIAL_IMAGE_PATH)

export const meta: MetaFunction = () => [
  { title: SITE_TITLE },
  { name: 'description', content: SITE_DESCRIPTION },
  { name: 'keywords', content: SITE_KEYWORDS.join(', ') },
  { name: 'application-name', content: SITE_NAME },
  { name: 'apple-mobile-web-app-title', content: SITE_NAME },
  { name: 'apple-mobile-web-app-capable', content: 'yes' },
  { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
  { name: 'mobile-web-app-capable', content: 'yes' },
  { name: 'format-detection', content: 'telephone=no' },
  { name: 'robots', content: 'index,follow,max-image-preview:large' },
  { name: 'googlebot', content: 'index,follow,max-image-preview:large' },
  { name: 'author', content: SITE_NAME },
  { name: 'category', content: 'Aviation' },
  { name: 'rating', content: 'general' },
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: SITE_NAME },
  { property: 'og:title', content: SITE_TITLE },
  { property: 'og:description', content: SITE_DESCRIPTION },
  { property: 'og:url', content: CANONICAL_URL },
  { property: 'og:locale', content: 'en_US' },
  { property: 'og:image', content: SOCIAL_IMAGE_URL },
  { property: 'og:image:type', content: SOCIAL_IMAGE_TYPE },
  { property: 'og:image:width', content: String(SOCIAL_IMAGE_WIDTH) },
  { property: 'og:image:height', content: String(SOCIAL_IMAGE_HEIGHT) },
  { property: 'og:image:alt', content: `${SITE_NAME} app icon` },
  { name: 'twitter:card', content: TWITTER_CARD },
  { name: 'twitter:title', content: SITE_TITLE },
  { name: 'twitter:description', content: SITE_DESCRIPTION },
  { name: 'twitter:image', content: SOCIAL_IMAGE_URL },
  { name: 'twitter:image:alt', content: `${SITE_NAME} app icon` },
  { tagName: 'link', rel: 'canonical', href: CANONICAL_URL },
  jsonLdMeta()
]

export default function Index() {
  const data = useLoaderData<typeof loader>() as NotamFetchResult

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) =>
        clientLogger.info('sw.registered', {
          scope: reg.scope,
          updateViaCache: reg.updateViaCache
        })
      )
      .catch((err) => {
        console.error('Service worker registration failed:', err)
        clientLogger.error('sw.registration.failed', {
          message: err instanceof Error ? err.message : String(err)
        })
      })
  }, [])

  return (
    <FiskApproachApp
      notamList={data.notamList}
      fetchedAt={data.fetchedAt}
      source={data.source}
      fetchError={data.error}
    />
  )
}
