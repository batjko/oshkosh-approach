// NOTAM filtering and categorization utilities

export interface NotamPriority {
  level: 'critical' | 'high' | 'medium' | 'low'
  color: string
  icon: string
}

// Keywords that indicate critical NOTAMs
const CRITICAL_KEYWORDS = [
  'runway closed', 'airport closed', 'emergency', 'unsafe', 'dangerous',
  'prohibited', 'restricted', 'closed', 'unavailable'
]

// Keywords that indicate high priority NOTAMs
const HIGH_PRIORITY_KEYWORDS = [
  'runway', 'approach', 'departure', 'tower', 'frequency', 'navigation',
  'lighting', 'obstruction', 'construction'
]

// Keywords that indicate medium priority NOTAMs
const MEDIUM_PRIORITY_KEYWORDS = [
  'taxiway', 'parking', 'fuel', 'service', 'weather', 'equipment'
]

/**
 * Categorize NOTAM priority based on content
 */
export const categorizeNotamPriority = (notamText: string): NotamPriority => {
  const lowerText = notamText.toLowerCase()
  
  if (CRITICAL_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
    return {
      level: 'critical',
      color: 'error',
      icon: 'warning'
    }
  }
  
  if (HIGH_PRIORITY_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
    return {
      level: 'high',
      color: 'warning',
      icon: 'info'
    }
  }
  
  if (MEDIUM_PRIORITY_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
    return {
      level: 'medium',
      color: 'info',
      icon: 'info-circle'
    }
  }
  
  return {
    level: 'low',
    color: 'base-content',
    icon: 'circle'
  }
}

/**
 * Filter NOTAMs by type
 */
export const filterNotamsByType = (notams: any[], type: string) => {
  if (type === 'All') return notams
  return notams.filter(notam => notam.type === type)
}

/**
 * Filter NOTAMs by search term
 */
export const filterNotamsBySearch = (notams: any[], searchTerm: string) => {
  if (!searchTerm) return notams
  
  const lowerSearch = searchTerm.toLowerCase()
  return notams.filter(notam => 
    notam.text.toLowerCase().includes(lowerSearch) ||
    notam.number.toLowerCase().includes(lowerSearch) ||
    notam.type.toLowerCase().includes(lowerSearch)
  )
}

/**
 * Get critical NOTAMs for in-flight display
 */
export const getCriticalNotams = (notams: any[]) => {
  return notams
    .map(notam => ({
      ...notam,
      priority: categorizeNotamPriority(notam.text)
    }))
    .filter(notam => notam.priority.level === 'critical' || notam.priority.level === 'high')
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority.level] - priorityOrder[b.priority.level]
    })
}

/**
 * Sort NOTAMs by priority
 */
export const sortNotamsByPriority = (notams: any[]) => {
  return notams
    .map(notam => ({
      ...notam,
      priority: categorizeNotamPriority(notam.text)
    }))
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority.level] - priorityOrder[b.priority.level]
    })
}