import { useState, useSyncExternalStore } from 'react'
import {
  MdFilterList,
  MdClear,
  MdWarning,
  MdError,
  MdRefresh
} from 'react-icons/md'
import {
  categorizeNotamPriority,
  filterNotamsByType,
  filterNotamsBySearch,
  sortNotamsByPriority
} from '~/utils/notamFilters'
import { NOTAM_TYPE_FILTERS } from '~/utils/notamTypes'
import { clientLogger } from '~/lib/clientLogger'
import { useOriginReachability } from '~/hooks/useOriginReachability'
import { NotamRow } from './NotamRow'
import { NotamTextBox } from './NotamTextBox'
import { NotamTypeBadge } from './NotamTypeBadge'
import type { Notam } from './types'

interface NotamListProps {
  notamList: Notam[]
  fetchedAt: string
  source: string
  fetchError?: string
}

const DESKTOP_NOTAM_QUERY = '(min-width: 1024px)'

const subscribeToDesktopLayout = (onStoreChange: () => void) => {
  if (typeof window === 'undefined') return () => {}
  const mediaQuery = window.matchMedia(DESKTOP_NOTAM_QUERY)
  mediaQuery.addEventListener('change', onStoreChange)
  return () => mediaQuery.removeEventListener('change', onStoreChange)
}

const getDesktopLayoutSnapshot = () =>
  typeof window !== 'undefined' &&
  window.matchMedia(DESKTOP_NOTAM_QUERY).matches

const useDesktopNotamLayout = () =>
  useSyncExternalStore(
    subscribeToDesktopLayout,
    getDesktopLayoutSnapshot,
    () => false
  )

const formatFetchedAt = (iso: string): string => {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const date = d.toISOString().slice(0, 10)
    const time = d.toISOString().slice(11, 19)
    return `${date} ${time}Z`
  } catch {
    return iso
  }
}

const formatEffectiveEnd = (iso: string): string => {
  if (!iso || iso === 'PERM') return iso || '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)}Z`
}

const priorityTone = (level: string): string => {
  switch (level) {
    case 'critical':
      return 'border-error/40 bg-error/10 text-error'
    case 'high':
      return 'border-warning/50 bg-warning/10 text-warning'
    case 'medium':
      return 'border-info/40 bg-info/10 text-info'
    default:
      return 'border-base-300 bg-base-200 text-base-content/70'
  }
}

const NotamCard = ({
  notam,
  formatEffectiveEnd
}: {
  notam: Notam
  formatEffectiveEnd: (iso: string) => string
}) => {
  const priority = categorizeNotamPriority(notam.text)
  return (
    <article
      className={`rounded-cockpit border bg-base-100 p-3 shadow-sm ${priority.level === 'critical' ? 'border-error/40' : 'border-base-300'}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-cockpit text-sm font-semibold tabular-nums">
            {notam.number}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityTone(priority.level)}`}
            >
              app scan: {priority.level}
            </span>
            <NotamTypeBadge type={notam.type} />
          </div>
        </div>
        <div className="text-right text-[11px] text-base-content/60">
          <div className="uppercase tracking-wide">Valid until</div>
          <div className="font-cockpit tabular-nums text-base-content/80">
            {formatEffectiveEnd(notam.effectiveEnd)}
          </div>
        </div>
      </header>
      <div className="mt-3">
        <NotamTextBox notam={notam} />
      </div>
    </article>
  )
}

export const NotamList = ({
  notamList,
  fetchedAt,
  source,
  fetchError
}: NotamListProps) => {
  const [selectedType, setSelectedType] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortByPriority, setSortByPriority] = useState(true)
  const online = useOriginReachability()
  const useDesktopLayout = useDesktopNotamLayout()

  let filteredNotams = filterNotamsByType(notamList, selectedType)
  filteredNotams = filterNotamsBySearch(filteredNotams, searchTerm)

  if (sortByPriority) {
    filteredNotams = sortNotamsByPriority(filteredNotams)
  }

  const heading = fetchError
    ? 'NOTAMs unavailable'
    : online
      ? 'KOSH NOTAMs'
      : 'NOTAMs not current'

  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      clientLogger.info('notam.refresh.click', {
        currentCount: notamList.length
      })
      window.location.reload()
    }
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body p-4 tablet:p-6">
        <header className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="card-title flex items-center gap-2">
            <MdWarning className="text-warning" />
            {heading} ({filteredNotams.length})
          </h2>
          <div className="flex flex-col items-start gap-1 text-xs text-base-content/70 sm:items-end">
            <span>
              Last queried{' '}
              <time dateTime={fetchedAt} className="font-mono">
                {formatFetchedAt(fetchedAt)}
              </time>{' '}
              · {source}
            </span>
            <button
              type="button"
              className="btn btn-ghost min-h-12 gap-1 px-3 sm:btn-xs sm:min-h-0"
              onClick={handleRefresh}
              aria-label="Refresh NOTAMs by reloading the page"
            >
              <MdRefresh className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </header>

        <p className="mb-4 text-xs text-base-content/60">
          App priority is a keyword-based scan aid, not an FAA assessment. Review every raw NOTAM and complete a full briefing for route, alternate, and FDC NOTAMs.
        </p>

        {fetchError && (
          <div className="alert alert-error mb-4">
            <MdError className="h-5 w-5" />
            <div>
              <div className="font-semibold">FAA NOTAM service unreachable</div>
              <div className="text-xs opacity-80">{fetchError}</div>
              <div className="mt-1 text-xs">
                Confirm at{' '}
                <a
                  href="https://notams.aim.faa.gov/notamSearch/?icaoLocation=KOSH"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  notams.aim.faa.gov
                </a>{' '}
                before flight.
              </div>
            </div>
          </div>
        )}

        {!online && !fetchError && (
          <div className="alert alert-warning mb-4">
            <MdWarning className="h-5 w-5" />
            <div>
              <div className="font-semibold">Connection unavailable — NOTAMs may be stale</div>
              <div className="text-xs opacity-80">
                Last queried {formatFetchedAt(fetchedAt)}. Confirm current FAA NOTAMs before flight.
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 grid gap-3 lg:grid-cols-[auto_auto_minmax(16rem,1fr)] lg:items-center">
          <div className="flex items-center gap-2">
            <MdFilterList className="text-base-content/60" />
            <label htmlFor="notam-type-filter" className="sr-only">
              Filter NOTAMs by type
            </label>
            <select
              id="notam-type-filter"
              className="select select-bordered min-h-12 w-full lg:select-sm lg:w-auto"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {NOTAM_TYPE_FILTERS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label min-h-12 cursor-pointer justify-start gap-2 px-0 lg:px-1">
              <input
                type="checkbox"
                className="checkbox"
                checked={sortByPriority}
                onChange={(e) => setSortByPriority(e.target.checked)}
              />
              <span className="label-text text-sm">Sort by app scan priority</span>
            </label>
          </div>

          <div>
            <div className="join w-full">
              <input
                type="text"
                placeholder="Search NOTAMs..."
                className="input input-bordered join-item min-h-12 flex-1 lg:input-sm lg:min-h-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn join-item min-h-12 lg:btn-sm lg:min-h-0"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear NOTAM search"
                >
                  <MdClear />
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredNotams.length > 0 ? (
          useDesktopLayout ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm min-w-[56rem] table-fixed">
                <thead>
                  <tr>
                    <th className="w-12">App scan</th>
                    <th className="w-20">Number</th>
                    <th className="w-36">Type</th>
                    <th className="w-28">Valid until</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotams.map((notam) => (
                    <NotamRow
                      key={[
                        notam.id,
                        notam.number,
                        notam.type,
                        notam.effectiveStart,
                        notam.effectiveEnd,
                        notam.icaoLocation,
                        notam.text
                      ].join(':')}
                      notam={notam}
                      formatEffectiveEnd={formatEffectiveEnd}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotams.map((notam) => (
                <NotamCard
                  key={[
                    notam.id,
                    notam.number,
                    notam.type,
                    notam.effectiveStart,
                    notam.effectiveEnd,
                    notam.icaoLocation,
                    notam.text
                  ].join(':')}
                  notam={notam}
                  formatEffectiveEnd={formatEffectiveEnd}
                />
              ))}
            </div>
          )
        ) : (
          <div className="py-8 text-center text-base-content/60">
            {fetchError
              ? 'NOTAMs unavailable — see error above.'
              : notamList.length === 0
                ? 'No active NOTAMs reported by the FAA for KOSH.'
                : 'No NOTAMs match your filters.'}
          </div>
        )}
      </div>
    </div>
  )
}
