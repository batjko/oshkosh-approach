import { NotamList } from '~/components/notams/NotamList'
import type { Notam } from '~/components/notams/types'

interface NotamSectionProps {
  notamList: Notam[]
  fetchedAt: string
  source: string
  fetchError?: string
}

export const NotamSection = ({
  notamList,
  fetchedAt,
  source,
  fetchError
}: NotamSectionProps) => (
  <div>
    <NotamList
      notamList={notamList}
      fetchedAt={fetchedAt}
      source={source}
      fetchError={fetchError}
    />
  </div>
)
