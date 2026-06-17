import type { MetaFunction } from '@remix-run/react'

import {
  DiscoverabilityArticle,
  discoverabilityMeta
} from '~/components/discoverability/DiscoverabilityArticle'
import { discoverabilityPageById } from '~/content/discoverability'

const page = discoverabilityPageById('oshkosh-alternates')

export const meta: MetaFunction = () => discoverabilityMeta(page)

export default function OshkoshAlternatesRoute() {
  return <DiscoverabilityArticle page={page} />
}
