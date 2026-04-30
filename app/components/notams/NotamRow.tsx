import { MdError, MdInfo, MdWarning } from 'react-icons/md'

import {
  categorizeNotamPriority,
  type NotamPriority
} from '~/utils/notamFilters'
import { NotamTextBox } from './NotamTextBox'
import type { Notam } from './types'

interface NotamRowProps {
  notam: Notam
  formatEffectiveEnd: (iso: string) => string
}

const getPriorityIcon = (priority: NotamPriority) => {
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

export const NotamRow = ({ notam, formatEffectiveEnd }: NotamRowProps) => {
  const priority = categorizeNotamPriority(notam.text)

  return (
    <tr className={priority.level === 'critical' ? 'bg-error/10' : ''}>
      <td>
        <div className="tooltip" data-tip={`Priority: ${priority.level}`}>
          {getPriorityIcon(priority)}
        </div>
      </td>
      <td className="font-mono text-sm">{notam.number}</td>
      <td>
        <div className="badge badge-outline badge-sm">{notam.type}</div>
      </td>
      <td className="text-sm font-mono">
        {formatEffectiveEnd(notam.effectiveEnd)}
      </td>
      <td className="min-w-[20rem] max-w-[42rem] align-top text-sm">
        <NotamTextBox notam={notam} />
      </td>
    </tr>
  )
}
