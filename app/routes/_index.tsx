import { useEffect } from 'react'
import type { MetaFunction } from '@remix-run/react'
import type { LoaderFunction, HeadersFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { getKoshNotams, type NotamFetchResult } from '../.server/notamList'
import { FiskApproachApp } from '~/components/FiskApproachApp'

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

export const meta: MetaFunction = () => [
  { charset: 'utf-8' },
  { title: 'EAA AirVenture Oshkosh - Approach companion' },
  { viewport: 'width=device-width,initial-scale=1, viewport-fit=cover' },
  {
    name: 'description',
    content:
      'Source-backed Fisk VFR arrival companion for EAA AirVenture Oshkosh 2026 - read the official Notice before you fly.'
  }
]

export default function Index() {
  const data = useLoaderData<typeof loader>() as NotamFetchResult

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch((err) => console.error('Service worker registration failed:', err))
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
