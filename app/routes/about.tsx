import type { MetaFunction } from '@remix-run/react'

import {
  DiscoverabilityArticle,
  discoverabilityMeta
} from '~/components/discoverability/DiscoverabilityArticle'
import { discoverabilityPageById } from '~/content/discoverability'

const page = discoverabilityPageById('about')

export const meta: MetaFunction = () => discoverabilityMeta(page)

export default function AboutRoute() {
  return <DiscoverabilityArticle page={page} />
}
