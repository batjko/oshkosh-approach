import {
  MdAirplanemodeActive,
  MdCall,
  MdDirections,
  MdExplore,
  MdFlightLand,
  MdFlightTakeoff,
  MdInfo,
  MdLocalAirport,
  MdLocalParking,
  MdMap,
  MdRoomService,
  MdRoute,
  MdSecurity,
  MdStar,
  MdStorage,
  MdTerrain,
  MdTimeline,
  MdVisibility,
  MdWarning
} from 'react-icons/md'
import type { IconType } from 'react-icons'

import type { NotamType } from '~/utils/notamTypes'

const NOTAM_TYPE_ICONS = {
  Airport: MdLocalAirport,
  Runway: MdFlightLand,
  Taxiway: MdDirections,
  Apron: MdLocalParking,
  Obstruction: MdTerrain,
  Navigation: MdExplore,
  Communications: MdCall,
  Services: MdRoomService,
  Airspace: MdAirplanemodeActive,
  Departure: MdFlightTakeoff,
  SID: MdFlightTakeoff,
  STAR: MdFlightLand,
  Chart: MdMap,
  Data: MdStorage,
  DVA: MdTimeline,
  Approach: MdFlightLand,
  VFP: MdVisibility,
  Route: MdRoute,
  Special: MdStar,
  Security: MdSecurity,
  Other: MdInfo
} satisfies Record<NotamType, IconType>

interface NotamTypeBadgeProps {
  type: NotamType
}

export const NotamTypeBadge = ({ type }: NotamTypeBadgeProps) => {
  const Icon = NOTAM_TYPE_ICONS[type] ?? MdWarning

  return (
    <div className="badge badge-outline badge-sm gap-1 whitespace-nowrap">
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{type}</span>
    </div>
  )
}
