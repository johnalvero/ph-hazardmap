import { Typhoon, ForecastPoint } from '@/types/hazard'

/**
 * Typhoon data fetching from JTWC (Joint Typhoon Warning Center)
 * 
 * Data sources:
 * - JTWC provides data through ATCF (Automated Tropical Cyclone Forecasting) system
 * - For now, using mock data structure that matches JTWC format
 * - Production: Will integrate with JTWC RSS feeds or ATCF parsers
 */

// Mock typhoon data for development
const mockTyphoons: Typhoon[] = [
  {
    id: 'typhoon_wp_01',
    type: 'typhoon',
    name: 'YINXING',
    basin: 'Western Pacific',
    category: 'TS',
    coordinates: [125.5, 15.2],
    timestamp: new Date().toISOString(),
    windSpeed: 55,
    windSpeedKph: 102,
    pressure: 985,
    movementSpeed: 12,
    movementDirection: 290,
    status: 'Active',
    warnings: ['Tropical Storm Warning for Northern Luzon'],
    jtwcUrl: 'https://www.metoc.navy.mil/jtwc/jtwc.html',
    forecast: [
      {
        timestamp: new Date(Date.now() + 24 * 3600000).toISOString(),
        coordinates: [124.8, 16.5],
        windSpeed: 65,
        category: 'TS',
        pressure: 980
      },
      {
        timestamp: new Date(Date.now() + 48 * 3600000).toISOString(),
        coordinates: [123.5, 18.2],
        windSpeed: 75,
        category: 'Cat1',
        pressure: 975
      },
      {
        timestamp: new Date(Date.now() + 72 * 3600000).toISOString(),
        coordinates: [121.8, 20.1],
        windSpeed: 80,
        category: 'Cat1',
        pressure: 970
      },
      {
        timestamp: new Date(Date.now() + 96 * 3600000).toISOString(),
        coordinates: [119.5, 21.8],
        windSpeed: 70,
        category: 'TS',
        pressure: 978
      },
      {
        timestamp: new Date(Date.now() + 120 * 3600000).toISOString(),
        coordinates: [117.2, 23.5],
        windSpeed: 55,
        category: 'TS',
        pressure: 985
      }
    ],
    windRadii: {
      radius34kt: { ne: 80, se: 60, sw: 50, nw: 70 },
      radius50kt: { ne: 40, se: 30, sw: 25, nw: 35 },
      radius64kt: { ne: 20, se: 15, sw: 10, nw: 18 }
    }
  }
]

/**
 * Determine typhoon category based on wind speed (Saffir-Simpson scale)
 * Currently unused but kept for future ATCF parsing implementation
 */
// function getTyphoonCategory(windSpeedKnots: number): string {
//   if (windSpeedKnots < 34) return 'TD' // Tropical Depression
//   if (windSpeedKnots < 64) return 'TS' // Tropical Storm
//   if (windSpeedKnots < 83) return 'Cat1' // Category 1
//   if (windSpeedKnots < 96) return 'Cat2' // Category 2
//   if (windSpeedKnots < 113) return 'Cat3' // Category 3
//   if (windSpeedKnots < 137) return 'Cat4' // Category 4
//   return 'Cat5' // Category 5
// }

/**
 * Convert knots to km/h
 * Currently unused but kept for future implementation
 */
// function knotsToKph(knots: number): number {
//   return Math.round(knots * 1.852)
// }

/**
 * Fetch active typhoons from NHC RSS feeds
 * 
 * Uses NHC Atlantic and Eastern Pacific RSS feeds as primary source
 * Falls back to mock data if NHC feeds are unavailable
 */
export async function fetchJTWCTyphoons(): Promise<Typhoon[]> {
  try {
    // Fetch from both NHC Atlantic and Eastern Pacific feeds
    const [atlanticTyphoons, pacificTyphoons] = await Promise.allSettled([
      fetchNHCTyphoons('https://www.nhc.noaa.gov/index-at.xml', 'Atlantic'),
      fetchNHCTyphoons('https://www.nhc.noaa.gov/index-ep.xml', 'Eastern Pacific')
    ])
    
    const typhoons: Typhoon[] = []
    
    // Add Atlantic storms
    if (atlanticTyphoons.status === 'fulfilled') {
      typhoons.push(...atlanticTyphoons.value)
    }
    
    // Add Eastern Pacific storms
    if (pacificTyphoons.status === 'fulfilled') {
      typhoons.push(...pacificTyphoons.value)
    }
    
    // If we got real data, return it
    if (typhoons.length > 0) {
      return typhoons
    }
    
    // Fallback to mock data if no real data available
    console.warn('No real typhoon data available, using mock data')
    return mockTyphoons
    
  } catch (error) {
    console.error('Error fetching typhoon data:', error)
    // Return mock data as final fallback
    return mockTyphoons
  }
}

/**
 * Fetch typhoons from NHC RSS feed
 */
async function fetchNHCTyphoons(feedUrl: string, basin: string): Promise<Typhoon[]> {
  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      throw new Error(`NHC feed error: ${response.status}`)
    }
    
    const xmlText = await response.text()
    return parseNHCRSS(xmlText, basin)
    
  } catch (error) {
    console.error(`Error fetching NHC ${basin} feed:`, error)
    return []
  }
}

/**
 * Parse NHC RSS XML to extract typhoon data
 */
function parseNHCRSS(xmlText: string, basin: string): Typhoon[] {
  const typhoons: Typhoon[] = []
  
  try {
    // Simple regex-based parsing for NHC RSS structure
    // Look for items with nhc:Cyclone elements
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    
    let itemMatch
    while ((itemMatch = itemRegex.exec(xmlText)) !== null) {
      const itemContent = itemMatch[1]
      
      // Check if this item has cyclone data
      if (itemContent.includes('<nhc:Cyclone>')) {
        // Create a new regex for each item to avoid state issues
        const cycloneRegex = /<nhc:Cyclone>([\s\S]*?)<\/nhc:Cyclone>/g
        const cycloneMatch = cycloneRegex.exec(itemContent)
        if (cycloneMatch) {
          const cycloneData = cycloneMatch[1]
          const typhoon = parseNHCCycloneData(cycloneData, basin)
          if (typhoon) {
            typhoons.push(typhoon)
          }
        }
      }
    }
    
    
  } catch (error) {
    console.error('Error parsing NHC RSS:', error)
  }
  
  return typhoons
}

/**
 * Parse individual cyclone data from NHC RSS
 */
function parseNHCCycloneData(cycloneData: string, basin: string): Typhoon | null {
  try {
    // Extract data using regex patterns
    const nameMatch = cycloneData.match(/<nhc:name>(.*?)<\/nhc:name>/)
    const centerMatch = cycloneData.match(/<nhc:center>(.*?)<\/nhc:center>/)
    const typeMatch = cycloneData.match(/<nhc:type>(.*?)<\/nhc:type>/)
    const windMatch = cycloneData.match(/<nhc:wind>(.*?)<\/nhc:wind>/)
    const pressureMatch = cycloneData.match(/<nhc:pressure>(.*?)<\/nhc:pressure>/)
    const movementMatch = cycloneData.match(/<nhc:movement>(.*?)<\/nhc:movement>/)
    const atcfMatch = cycloneData.match(/<nhc:atcf>(.*?)<\/nhc:atcf>/)
    
    if (!nameMatch || !centerMatch || !typeMatch) {
      return null
    }
    
    const name = nameMatch[1].trim()
    const center = centerMatch[1].trim()
    const type = typeMatch[1].trim()
    
    // Parse coordinates (format: "lat, lon")
    const [latStr, lonStr] = center.split(',').map(s => s.trim())
    const latitude = parseFloat(latStr)
    const longitude = parseFloat(lonStr)
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return null
    }
    
    // Parse wind speed (format: "40 mph" or "40 kt")
    let windSpeed = 0
    if (windMatch) {
      const windStr = windMatch[1].trim()
      const windMatch2 = windStr.match(/(\d+)\s*(mph|kt)/i)
      if (windMatch2) {
        windSpeed = parseInt(windMatch2[1])
        // Convert mph to knots if needed
        if (windMatch2[2].toLowerCase() === 'mph') {
          windSpeed = Math.round(windSpeed * 0.868976) // mph to knots
        }
      }
    }
    
    // Parse pressure (format: "1005 mb")
    let pressure = 1013 // Default sea level pressure
    if (pressureMatch) {
      const pressureStr = pressureMatch[1].trim()
      const pressureMatch2 = pressureStr.match(/(\d+)\s*mb/i)
      if (pressureMatch2) {
        pressure = parseInt(pressureMatch2[1])
      }
    }
    
    // Parse movement (format: "NNW at 12 mph")
    let movementSpeed = 0
    let movementDirection = 0
    if (movementMatch) {
      const movementStr = movementMatch[1].trim()
      const movementMatch2 = movementStr.match(/(\w+)\s+at\s+(\d+)\s*(mph|kt)/i)
      if (movementMatch2) {
        movementSpeed = parseInt(movementMatch2[2])
        // Convert mph to knots if needed
        if (movementMatch2[3].toLowerCase() === 'mph') {
          movementSpeed = Math.round(movementSpeed * 0.868976)
        }
        // Convert direction to degrees (simplified)
        movementDirection = convertDirectionToDegrees(movementMatch2[1])
      }
    }
    
    // Determine category from type and wind speed
    const category = determineCategory(type, windSpeed)
    
    // Generate ID from ATCF code or name
    const id = atcfMatch ? atcfMatch[1].trim().toLowerCase() : `typhoon_${name.toLowerCase().replace(/\s+/g, '_')}`
    
    const typhoon: Typhoon = {
      id,
      type: 'typhoon',
      name,
      basin,
      category,
      coordinates: [longitude, latitude],
      timestamp: new Date().toISOString(),
      windSpeed,
      windSpeedKph: Math.round(windSpeed * 1.852),
      pressure,
      movementSpeed,
      movementDirection,
      forecast: [], // NHC RSS doesn't include forecast data
      status: 'Active',
      warnings: [`${type} ${name} in ${basin}`],
      jtwcUrl: `https://www.nhc.noaa.gov/`
    }
    
    return typhoon
    
  } catch (error) {
    console.error('Error parsing cyclone data:', error)
    return null
  }
}

/**
 * Convert compass direction to degrees
 */
function convertDirectionToDegrees(direction: string): number {
  const directions: { [key: string]: number } = {
    'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
    'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
    'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
    'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
  }
  return directions[direction.toUpperCase()] || 0
}

/**
 * Determine typhoon category from type and wind speed
 */
function determineCategory(type: string, windSpeed: number): string {
  // If type already includes category info, use it
  if (type.includes('Category') || type.includes('Cat')) {
    return type
  }
  
  // Otherwise determine from wind speed
  if (windSpeed < 34) return 'TD' // Tropical Depression
  if (windSpeed < 64) return 'TS' // Tropical Storm
  if (windSpeed < 83) return 'Cat1' // Category 1
  if (windSpeed < 96) return 'Cat2' // Category 2
  if (windSpeed < 113) return 'Cat3' // Category 3
  if (windSpeed < 137) return 'Cat4' // Category 4
  return 'Cat5' // Category 5
}

/**
 * Fetch typhoons in Western Pacific region (relevant for Philippines)
 */
export async function fetchWesternPacificTyphoons(): Promise<Typhoon[]> {
  try {
    const allTyphoons = await fetchJTWCTyphoons()
    
    // Filter for Western Pacific basin (or include Eastern Pacific for broader coverage)
    const westernPacificTyphoons = allTyphoons.filter(
      typhoon => typhoon.basin === 'Western Pacific' || typhoon.basin === 'Eastern Pacific'
    )
    
    return westernPacificTyphoons
  } catch (error) {
    console.error('Error fetching Western Pacific typhoons:', error)
    // Return empty array on error
    return []
  }
}

/**
 * Parse ATCF format data (for future implementation)
 * ATCF format is a fixed-width text format used by JTWC
 */
export function parseATCFData(atcfText: string): Typhoon[] {
  // TODO: Implement ATCF parsing
  // ATCF format documentation: https://ftp.nhc.noaa.gov/atcf/docs/
  
  // Suppress unused parameter warning for future implementation
  void atcfText
  
  const typhoons: Typhoon[] = []
  
  // Placeholder implementation
  return typhoons
}

/**
 * Calculate uncertainty cone coordinates
 * The cone widens over time based on forecast error statistics
 */
export function calculateUncertaintyCone(
  forecast: ForecastPoint[]
): [number, number][][] {
  const conePoints: [number, number][][] = []
  
  forecast.forEach((point, index) => {
    // Error radius increases with forecast time
    // Typical error: ~50nm at 24h, ~100nm at 48h, ~150nm at 72h, ~200nm at 96h, ~250nm at 120h
    const errorRadiusNm = 50 + (index * 50)
    const errorRadiusDeg = errorRadiusNm / 60 // Convert nautical miles to degrees (approximate)
    
    const [lon, lat] = point.coordinates
    
    // Create cone segment (simplified as circle)
    const points: [number, number][] = []
    const segments = 32
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI
      const x = lon + errorRadiusDeg * Math.cos(angle)
      const y = lat + errorRadiusDeg * Math.sin(angle)
      points.push([x, y])
    }
    
    conePoints.push(points)
  })
  
  return conePoints
}

/**
 * Get typhoon color based on category
 */
export function getTyphoonColor(category: string): string {
  switch (category) {
    case 'TD':
      return '#3B82F6' // blue
    case 'TS':
      return '#10B981' // green
    case 'Cat1':
      return '#F59E0B' // yellow/amber
    case 'Cat2':
      return '#F97316' // orange
    case 'Cat3':
      return '#EF4444' // red
    case 'Cat4':
      return '#DC2626' // dark red
    case 'Cat5':
      return '#991B1B' // very dark red
    default:
      return '#6B7280' // gray
  }
}

/**
 * Get typhoon intensity description
 */
export function getTyphoonIntensityDescription(category: string): string {
  switch (category) {
    case 'TD':
      return 'Tropical Depression'
    case 'TS':
      return 'Tropical Storm'
    case 'Cat1':
      return 'Category 1 Typhoon'
    case 'Cat2':
      return 'Category 2 Typhoon'
    case 'Cat3':
      return 'Category 3 Typhoon (Major)'
    case 'Cat4':
      return 'Category 4 Typhoon (Major)'
    case 'Cat5':
      return 'Category 5 Typhoon (Catastrophic)'
    default:
      return 'Unknown'
  }
}

/**
 * Format movement direction as compass direction
 */
export function formatMovementDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

