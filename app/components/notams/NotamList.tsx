import { useState } from 'react'
import {
  MdFilterList,
  MdClear,
  MdWarning,
  MdError,
  MdRefresh
} from 'react-icons/md'
import {
  filterNotamsByType,
  filterNotamsBySearch,
  sortNotamsByPriority
} from '~/utils/notamFilters'
import { clientLogger } from '~/lib/clientLogger'
import { NotamRow } from './NotamRow'
import type { Notam } from './types'

interface NotamListProps {
  notamList: Notam[]
  fetchedAt: string
  source: string
  fetchError?: string
}

const notamTypes = ['All', 'Airport', 'Runway', 'Airspace', 'Navigation', 'Other']

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

export const NotamList = ({
  notamList,
  fetchedAt,
  source,
  fetchError
}: NotamListProps) => {
  const [selectedType, setSelectedType] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortByPriority, setSortByPriority] = useState(true)

  let filteredNotams = filterNotamsByType(notamList, selectedType)
  filteredNotams = filterNotamsBySearch(filteredNotams, searchTerm)

  if (sortByPriority) {
    filteredNotams = sortNotamsByPriority(filteredNotams)
  }

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
      <div className="card-body">
        <header className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="card-title flex items-center gap-2">
            <MdWarning className="text-warning" />
            Current NOTAMs ({filteredNotams.length})
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
              className="btn btn-ghost btn-xs gap-1"
              onClick={handleRefresh}
              aria-label="Refresh NOTAMs by reloading the page"
            >
              <MdRefresh className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </header>

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

        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <MdFilterList className="text-base-content/60" />
            <select
              className="select select-bordered select-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {notamTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={sortByPriority}
                onChange={(e) => setSortByPriority(e.target.checked)}
              />
              <span className="label-text text-sm">Sort by priority</span>
            </label>
          </div>

          <div className="flex-1">
            <div className="join w-full max-w-md">
              <input
                type="text"
                placeholder="Search NOTAMs..."
                className="input input-bordered input-sm join-item flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-sm join-item"
                  onClick={() => setSearchTerm('')}
                >
                  <MdClear />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredNotams.length > 0 ? (
            <table className="table table-zebra table-sm table-fixed">
              <thead>
                <tr>
                  <th className="w-20">Priority</th>
                  <th className="w-32">Number</th>
                  <th className="w-28">Type</th>
                  <th className="w-36">Valid until</th>
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
    </div>
  )
}
