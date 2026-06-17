import type { MetaFunction } from '@remix-run/react'

import {
  DiscoverabilityArticle,
  discoverabilityMeta
} from '~/components/discoverability/DiscoverabilityArticle'
import { discoverabilityPageById } from '~/content/discoverability'

const page = discoverabilityPageById('oshkosh-notam-2026')

export const meta: MetaFunction = () => discoverabilityMeta(page)

export default function OshkoshNotam2026Route() {
  return <DiscoverabilityArticle page={page} />
}
