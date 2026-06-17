import type { MetaFunction } from '@remix-run/react'

import {
  DiscoverabilityArticle,
  discoverabilityMeta
} from '~/components/discoverability/DiscoverabilityArticle'
import { discoverabilityPageById } from '~/content/discoverability'

const page = discoverabilityPageById('nordo-oshkosh')

export const meta: MetaFunction = () => discoverabilityMeta(page)

export default function NordoOshkoshRoute() {
  return <DiscoverabilityArticle page={page} />
}
