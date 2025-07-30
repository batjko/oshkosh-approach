import { useState } from 'react'
import { MdFilterList, MdClear, MdWarning, MdError, MdInfo } from 'react-icons/md'
import { 
  filterNotamsByType, 
  filterNotamsBySearch, 
  sortNotamsByPriority,
  categorizeNotamPriority 
} from '~/utils/notamFilters'

interface Notam {
  id: string
  number: string
  type: string
  effectiveEnd: string
  text: string
}

interface NotamListProps {
  notamList: Notam[]
}

const notamTypes = ['All', 'Airport', 'Runway', 'Airspace', 'Navigation', 'Other']

export const NotamList = ({ notamList }: NotamListProps) => {
  const [selectedType, setSelectedType] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortByPriority, setSortByPriority] = useState(true)

  // Apply filters and sorting
  let filteredNotams = filterNotamsByType(notamList, selectedType)
  filteredNotams = filterNotamsBySearch(filteredNotams, searchTerm)
  
  if (sortByPriority) {
    filteredNotams = sortNotamsByPriority(filteredNotams)
  }

  const getPriorityIcon = (priority: any) => {
    switch (priority.level) {
      case 'critical':
        return <MdError className="text-error" />
      case 'high':
        return <MdWarning className="text-warning" />
      case 'medium':
        return <MdInfo className="text-info" />
      default:
        return <MdInfo className="text-base-content/60" />
    }
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">
            <MdWarning className="text-warning" />
            Current NOTAMs ({filteredNotams.length})
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
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

        {/* NOTAM List */}
        <div className="overflow-x-auto">
          {filteredNotams.length > 0 ? (
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Number</th>
                  <th>Type</th>
                  <th>Valid Until</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotams.map((notam) => {
                  const priority = categorizeNotamPriority(notam.text)
                  return (
                    <tr key={notam.id} className={priority.level === 'critical' ? 'bg-error/10' : ''}>
                      <td>
                        <div className="tooltip" data-tip={`Priority: ${priority.level}`}>
                          {getPriorityIcon(priority)}
                        </div>
                      </td>
                      <td className="font-mono text-sm">{notam.number}</td>
                      <td>
                        <div className="badge badge-outline badge-sm">
                          {notam.type}
                        </div>
                      </td>
                      <td className="text-sm">{notam.effectiveEnd}</td>
                      <td className="text-sm max-w-md">
                        <div className="truncate" title={notam.text}>
                          {notam.text}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-base-content/60">
              {notamList.length === 0 ? 'No NOTAMs available' : 'No NOTAMs match your filters'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}