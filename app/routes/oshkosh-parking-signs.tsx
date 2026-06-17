import type { MetaFunction } from '@remix-run/react'

import {
  DiscoverabilityArticle,
  discoverabilityMeta
} from '~/components/discoverability/DiscoverabilityArticle'
import { discoverabilityPageById } from '~/content/discoverability'

const page = discoverabilityPageById('oshkosh-parking-signs')

export const meta: MetaFunction = () => discoverabilityMeta(page)

export default function OshkoshParkingSignsRoute() {
  return <DiscoverabilityArticle page={page} />
}
