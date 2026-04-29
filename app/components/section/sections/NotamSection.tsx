import { NotamList } from '~/components/notams/NotamList'

interface NotamItem {
  id: string
  number: string
  type: string
  effectiveEnd: string
  text: string
}

interface NotamSectionProps {
  notamList: NotamItem[]
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
