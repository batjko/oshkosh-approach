import type { MetaFunction } from '@remix-run/react'

import {
  DiscoverabilityArticle,
  discoverabilityMeta
} from '~/components/discoverability/DiscoverabilityArticle'
import { discoverabilityPageById } from '~/content/discoverability'

const page = discoverabilityPageById('kosh-notams')

export const meta: MetaFunction = () => discoverabilityMeta(page)

export default function KoshNotamsRoute() {
  return <DiscoverabilityArticle page={page} />
}
