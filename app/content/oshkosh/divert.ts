import type { DivertTrigger } from './types'

export const divertTriggers: DivertTrigger[] = [
  {
    id: 'fuel-low',
    trigger: 'Fuel below comfortable hold + alternate reserve.',
    action: 'Notify ATC immediately. Divert to KFLD / KATW / KGRB.',
    severity: 'critical'
  },
  {
    id: 'holds-saturated',
    trigger: 'Holding patterns observed or reported nearing capacity.',
    action: 'Stay clear, proceed no further, make left turns over a ground point, monitor 120.7.',
    severity: 'caution'
  },
  {
    id: 'separation-loss',
    trigger: 'Unable to maintain 0.5 NM separation without S-turning.',
    action: 'Break off, return to transition starting point, follow another similar-speed aircraft.',
    severity: 'caution'
  },
  {
    id: 'short-approach-uncomfortable',
    trigger: 'Uncomfortable with short approach / long landing.',
    action: 'Request go-around early, or divert.',
    severity: 'caution'
  },
  {
    id: 'wx-personal-mins',
    trigger: 'Crosswind / turbulence beyond personal minimums.',
    action: 'Divert.',
    severity: 'caution'
  },
  {
    id: 'airport-closed',
    trigger: 'Airport closed (airshow / NOTAM / saturation).',
    action: 'Hold or divert. Arrivals resume ~30 min after airshow.',
    severity: 'caution'
  },
  {
    id: 'lost-comms',
    trigger: 'Lost comms inbound (non-NORDO).',
    action: 'Divert. NORDO procedure is for vintage radio-incapable aircraft only.',
    severity: 'critical'
  },
  {
    id: 'osh-ifr',
    trigger: 'OSH IFR.',
    action: 'Plan IFR or divert. VFR arrivals not permitted.',
    severity: 'critical'
  }
]
