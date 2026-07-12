import type { DivertTrigger } from './types'

export const divertTriggers: DivertTrigger[] = [
  {
    id: 'fuel-low',
    trigger: 'Fuel reaches the pre-briefed diversion trigger.',
    action: 'Leave the arrival and divert to the alternate you briefed. If fuel status is critical, notify ATC immediately.',
    severity: 'critical',
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Fisk VFR Arrival - Planning' }]
  },
  {
    id: 'holds-saturated',
    trigger: 'Holding patterns observed or reported nearing capacity.',
    action: 'Stay clear, proceed no further, make left turns over a ground point, monitor 120.7.',
    severity: 'caution',
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Fisk Holding - Holding Pattern Saturation' }]
  },
  {
    id: 'separation-loss',
    trigger: 'Unable to remain at least ½ NM in trail without S-turning.',
    action: 'Break off, return to transition starting point, follow another similar-speed aircraft.',
    severity: 'caution',
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Fisk VFR Arrival - Transitions' }]
  },
  {
    id: 'short-approach-uncomfortable',
    trigger: 'Uncomfortable with short approach / long landing.',
    action: 'Before entering the arrival, use an alternate. If already approaching to land, execute a go-around when required and notify ATC immediately.',
    severity: 'caution',
    guidanceType: 'pilot-technique',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Fisk VFR Arrival - Landing Approach' }]
  },
  {
    id: 'wx-personal-mins',
    trigger: 'Crosswind / turbulence beyond personal minimums.',
    action: 'Divert.',
    severity: 'caution',
    guidanceType: 'pilot-technique',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Fisk VFR Arrival - Planning' }]
  },
  {
    id: 'airport-closed',
    trigger: 'Airport closed (airshow / NOTAM / saturation).',
    action: 'Remain clear. Divert or delay unless ATC specifically directs holding. Check Arrival ATIS before proceeding.',
    severity: 'critical',
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Preflight Planning - Airshow Demonstration Area/TFRs' }]
  },
  {
    id: 'lost-comms',
    trigger: 'Lost comms inbound (non-NORDO).',
    action: 'Divert. NORDO procedure is for vintage radio-incapable aircraft only.',
    severity: 'critical',
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Oshkosh No-Radio Arrival' }]
  },
  {
    id: 'osh-ifr',
    trigger: 'OSH IFR.',
    action: 'Plan IFR or divert. VFR arrivals not permitted.',
    severity: 'critical',
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Fisk VFR Arrival; Oshkosh Airport Notes' }]
  }
]
