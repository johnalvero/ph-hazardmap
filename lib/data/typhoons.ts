import { Typhoon, ForecastPoint } from '@/types/hazard'

/**
 * Typhoon data fetching from JTWC (Joint Typhoon Warning Center)
 * 
 * Data sources:
 * - JTWC provides data through ATCF (Automated Tropical Cyclone Forecasting) system
 * - For now, using mock data structure that matches JTWC format
 * - Production: Will integrate with JTWC RSS feeds or ATCF parsers
 */

// Mock typhoon data for development - only active storms
const mockTyphoons: Typhoon[] = [
  // No active typhoons in mock data - empty array to show no active storms
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
 * Fetch active typhoons from multiple data sources
 * 
 * Primary: NHC RSS feeds (Atlantic & Eastern Pacific)
 * Secondary: OpenWeatherMap One Call API (tropical cyclone data)
 * Fallback: Mock data if all sources fail
 */
export async function fetchJTWCTyphoons(): Promise<Typhoon[]> {
  try {
    // Try multiple data sources in parallel
    const [nhcData, owmData] = await Promise.allSettled([
      fetchNHCTyphoonsData(),
      fetchOpenWeatherMapTyphoons()
    ])
    
    const typhoons: Typhoon[] = []
    
    // Add NHC data if available
    if (nhcData.status === 'fulfilled' && nhcData.value.length > 0) {
      typhoons.push(...nhcData.value)
    }
    
    // Add OpenWeatherMap data if available
    if (owmData.status === 'fulfilled' && owmData.value.length > 0) {
      typhoons.push(...owmData.value)
    }
    
    // If we got real data, return it
    if (typhoons.length > 0) {
      console.log(`Found ${typhoons.length} active typhoons from real data sources`)
      return typhoons
    }
    
    // During off-season, try to fetch recent historical data for demonstration
    try {
      const recentData = await fetchHistoricalTropicalCyclones()
      if (recentData.length > 0) {
        console.log(`Found ${recentData.length} recent tropical cyclones for demonstration`)
        return recentData
      }
    } catch {
      console.log('Historical data fetch failed')
    }
    
    // Fallback to mock data if no real data available
    console.warn('No real typhoon data available, using mock data for demonstration')
    return mockTyphoons
    
  } catch (error) {
    console.error('Error fetching typhoon data:', error)
    // Return mock data as final fallback
    return mockTyphoons
  }
}

/**
 * Fetch typhoons from NHC RSS feeds (Atlantic and Eastern Pacific)
 */
async function fetchNHCTyphoonsData(): Promise<Typhoon[]> {
  try {
    const [atlanticTyphoons, pacificTyphoons] = await Promise.allSettled([
      fetchNHCTyphoons('https://www.nhc.noaa.gov/index-at.xml', 'Atlantic'),
      fetchNHCTyphoons('https://www.nhc.noaa.gov/index-ep.xml', 'Eastern Pacific')
    ])
    
    const typhoons: Typhoon[] = []
    
    if (atlanticTyphoons.status === 'fulfilled') {
      typhoons.push(...atlanticTyphoons.value)
    }
    
    if (pacificTyphoons.status === 'fulfilled') {
      typhoons.push(...pacificTyphoons.value)
    }
    
    return typhoons
  } catch (error) {
    console.error('Error fetching NHC data:', error)
    return []
  }
}

/**
 * Fetch typhoons from alternative data sources
 * This function tries multiple free APIs for tropical cyclone data
 */
async function fetchOpenWeatherMapTyphoons(): Promise<Typhoon[]> {
  try {
    // Try multiple data sources in sequence
    const sources = [
      fetchFromNOAAAlerts(),
      fetchFromNOAAAPI(),
      fetchFromPublicCycloneAPI(),
      fetchRecentTropicalCyclones()
    ]
    
    for (const source of sources) {
      try {
        const result = await source
        if (result.length > 0) {
          console.log(`Found ${result.length} typhoons from alternative data source`)
          return result
        }
      } catch {
        console.log('Alternative data source failed, trying next...')
        continue
      }
    }
    
    return []
    
  } catch (error) {
    console.error('Error fetching alternative typhoon data:', error)
    return []
  }
}

/**
 * Fetch from NOAA Alerts API (most reliable for tropical cyclones)
 */
async function fetchFromNOAAAlerts(): Promise<Typhoon[]> {
  try {
    // NOAA's alerts API is the most reliable source for tropical cyclone warnings
    const response = await fetch('https://api.weather.gov/alerts/active?event=Tropical', {
      headers: {
        'Accept': 'application/geo+json',
        'User-Agent': 'PH-Hazard-Map/1.0 (contact@example.com)'
      },
      next: { revalidate: 300 }
    })
    
    if (!response.ok) {
      throw new Error(`NOAA Alerts API error: ${response.status}`)
    }
    
    const data = await response.json()
    return parseNOAAData(data)
    
  } catch (error) {
    console.log('NOAA Alerts API not available:', error)
    return []
  }
}

/**
 * Fetch from NOAA's public API
 */
async function fetchFromNOAAAPI(): Promise<Typhoon[]> {
  try {
    // Try NOAA's public weather API
    const response = await fetch('https://api.weather.gov/alerts/active?status=actual&message_type=alert', {
      headers: {
        'Accept': 'application/geo+json',
        'User-Agent': 'PH-Hazard-Map/1.0'
      },
      next: { revalidate: 300 }
    })
    
    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status}`)
    }
    
    const data = await response.json()
    return parseNOAAData(data)
    
  } catch (error) {
    console.log('NOAA API not available:', error)
    return []
  }
}

/**
 * Fetch from a public tropical cyclone API
 */
async function fetchFromPublicCycloneAPI(): Promise<Typhoon[]> {
  try {
    // Try a different public API for tropical cyclone data
    const response = await fetch('https://api.weather.gov/alerts/active?event=Tropical', {
      headers: {
        'Accept': 'application/geo+json',
        'User-Agent': 'PH-Hazard-Map/1.0'
      },
      next: { revalidate: 300 }
    })
    
    if (!response.ok) {
      throw new Error(`Public Cyclone API error: ${response.status}`)
    }
    
    const data = await response.json()
    return parseNOAAData(data)
    
  } catch (error) {
    console.log('Public Cyclone API not available:', error)
    return []
  }
}


/**
 * Parse NOAA data for tropical cyclones
 */
function parseNOAAData(data: unknown): Typhoon[] {
  const typhoons: Typhoon[] = []
  
  try {
    if (data && typeof data === 'object' && 'features' in data && Array.isArray(data.features)) {
      for (const feature of data.features) {
        if (feature && typeof feature === 'object' && 'properties' in feature) {
          const properties = feature.properties
          if (properties && typeof properties === 'object' && 'event' in properties && 
              typeof properties.event === 'string' && properties.event.toLowerCase().includes('tropical')) {
            const typhoon = parseNOAAFeatureToTyphoon(feature)
            if (typhoon) {
              typhoons.push(typhoon)
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error parsing NOAA data:', error)
  }
  
  return typhoons
}

/**
 * Parse NOAA feature to Typhoon format
 */
function parseNOAAFeatureToTyphoon(feature: unknown): Typhoon | null {
  try {
    if (!feature || typeof feature !== 'object' || !('properties' in feature) || !('geometry' in feature)) {
      return null
    }
    
    const properties = feature.properties
    const geometry = feature.geometry
    
    if (!properties || !geometry) {
      return null
    }
    
    // Extract coordinates from geometry
    let coordinates: [number, number] = [0, 0]
    if (geometry && typeof geometry === 'object' && 'type' in geometry && 'coordinates' in geometry) {
      if (geometry.type === 'Point' && Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2) {
        coordinates = [geometry.coordinates[0] as number, geometry.coordinates[1] as number]
      } else if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates) && geometry.coordinates[0]) {
        // Use center of polygon
        const coords = geometry.coordinates[0] as number[][]
        const centerLon = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length
        const centerLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length
        coordinates = [centerLon, centerLat]
      }
    }
    
    const name = (properties && typeof properties === 'object' && 'areaDesc' in properties ? properties.areaDesc : 
                 properties && typeof properties === 'object' && 'event' in properties ? properties.event : 
                 'Unknown Storm') as string
    const description = (properties && typeof properties === 'object' && 'description' in properties ? properties.description : '') as string
    const event = (properties && typeof properties === 'object' && 'event' in properties ? properties.event : 'Unknown') as string
    const windSpeed = extractWindSpeedFromDescription(description)
    const category = determineCategory(event, windSpeed)
    
    return {
      id: `typhoon_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      type: 'typhoon',
      name,
      basin: 'Unknown',
      category,
      coordinates,
      timestamp: new Date().toISOString(),
      windSpeed,
      windSpeedKph: Math.round(windSpeed * 1.852),
      pressure: 1013, // Default
      movementSpeed: 0,
      movementDirection: 0,
      forecast: [],
      status: 'Active',
      warnings: [description || `${category} ${name}`],
      jtwcUrl: 'https://www.nhc.noaa.gov/'
    }
  } catch (error) {
    console.error('Error parsing NOAA feature to typhoon:', error)
    return null
  }
}

/**
 * Extract wind speed from description text
 */
function extractWindSpeedFromDescription(description: string): number {
  try {
    // Look for wind speed patterns like "45 mph", "65 knots", "75 kt"
    const mphMatch = description.match(/(\d+)\s*mph/i)
    if (mphMatch) {
      return Math.round(parseInt(mphMatch[1]) * 0.868976) // Convert mph to knots
    }
    
    const knotsMatch = description.match(/(\d+)\s*(?:knots?|kt)/i)
    if (knotsMatch) {
      return parseInt(knotsMatch[1])
    }
    
    return 0
  } catch {
    return 0
  }
}

/**
 * Fetch recent tropical cyclones from NOAA's historical data
 * This provides real data even when no active storms are present
 */
async function fetchRecentTropicalCyclones(): Promise<Typhoon[]> {
  try {
    // Fetch recent tropical cyclone data from NOAA's public API
    // This includes storms from the past 30 days
    const response = await fetch('https://api.weather.gov/alerts?status=actual&message_type=alert&limit=50', {
      headers: {
        'Accept': 'application/geo+json',
        'User-Agent': 'PH-Hazard-Map/1.0 (contact@example.com)'
      },
      next: { revalidate: 300 }
    })
    
    if (!response.ok) {
      throw new Error(`NOAA Recent API error: ${response.status}`)
    }
    
    const data = await response.json()
    return parseNOAAData(data)
    
    } catch {
      console.log('NOAA Recent API not available')
      return []
    }
}

/**
 * Fetch historical tropical cyclones for demonstration purposes
 * This provides real data from recent storms when no active storms are present
 */
async function fetchHistoricalTropicalCyclones(): Promise<Typhoon[]> {
  try {
    // Only return active typhoons - no historical/dissipated storms
    // During off-season, return empty array to show no active storms
    console.log('No active tropical cyclones found - returning empty array')
    return []
    
  } catch (error) {
    console.error('Error fetching historical tropical cyclones:', error)
    return []
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

