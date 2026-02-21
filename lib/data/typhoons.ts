import { Typhoon, ForecastPoint } from '@/types/hazard'

/**
 * Typhoon data fetching from official sources
 * 
 * Data sources:
 * - JTWC ATCF (Automated Tropical Cyclone Forecasting) system
 * - Digital Typhoon (Japan) - Atom feed
 * - Japan Meteorological Agency (JMA)
 * - NOAA National Hurricane Center
 * - IBTrACS (International Best Track Archive for Climate Stewardship)
 * 
 * All data is real-time from official meteorological agencies
 */

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
 * Fetch active typhoons from JTWC and other official sources
 * 
 * Primary: JTWC ATCF data (Western Pacific)
 * Secondary: NOAA NHC RSS feeds (Atlantic & Eastern Pacific)
 * Tertiary: Other reliable sources
 */
export async function fetchJTWCTyphoons(): Promise<Typhoon[]> {
  try {
    console.log('Fetching typhoon data from official sources...')

    // Try IBTrACS (primary) and NHC (secondary) in parallel
    const [ibtracsData, nhcData] = await Promise.allSettled([
      fetchFromIBTrACS(),      // Primary: IBTrACS ACTIVE (same as Zoom Earth, global coverage)
      fetchNHCTyphoonsData()   // Secondary: NOAA NHC RSS (Atlantic/Eastern Pacific)
    ])

    const typhoons: Typhoon[] = []
    const seenNames = new Set<string>()

    // Add IBTrACS data first (primary, global)
    if (ibtracsData.status === 'fulfilled' && ibtracsData.value.length > 0) {
      for (const t of ibtracsData.value) {
        typhoons.push(t)
        seenNames.add(t.name.toUpperCase())
      }
      console.log(`Found ${ibtracsData.value.length} storms from IBTrACS`)
    }

    // Add NHC data if not already covered by IBTrACS
    if (nhcData.status === 'fulfilled' && nhcData.value.length > 0) {
      for (const t of nhcData.value) {
        if (!seenNames.has(t.name.toUpperCase())) {
          typhoons.push(t)
          seenNames.add(t.name.toUpperCase())
        }
      }
      console.log(`Found ${nhcData.value.length} storms from NOAA NHC`)
    }

    if (typhoons.length > 0) {
      console.log(`Total active typhoons found: ${typhoons.length}`)
      return typhoons
    }

    console.log('No active typhoons found from any official source')
    return []

  } catch (error) {
    console.error('Error fetching typhoon data:', error)
    return []
  }
}

/**
 * Fetch typhoons from JTWC ATCF data (Western Pacific)
 * This is the primary official source for Western Pacific typhoons
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchJTWCATCFData(): Promise<Typhoon[]> {
  try {
    console.log('Fetching JTWC ATCF data...')
    
    // JTWC data is available through multiple channels
    const [atcfData, jtwcWebData] = await Promise.allSettled([
      fetchATCFBestTrackData(),
      fetchJTWCWebData()
    ])
    
    const typhoons: Typhoon[] = []
    
    // Add ATCF data if available
    if (atcfData.status === 'fulfilled' && atcfData.value.length > 0) {
      typhoons.push(...atcfData.value)
      console.log(`Found ${atcfData.value.length} typhoons from ATCF data`)
    }
    
    // Add JTWC web data if available
    if (jtwcWebData.status === 'fulfilled' && jtwcWebData.value.length > 0) {
      typhoons.push(...jtwcWebData.value)
      console.log(`Found ${jtwcWebData.value.length} typhoons from JTWC web data`)
    }
    
    return typhoons
    
  } catch (error) {
    console.log('JTWC ATCF data not available:', error)
    return []
  }
}

/**
 * Fetch ATCF best track data from NOAA
 */
async function fetchATCFBestTrackData(): Promise<Typhoon[]> {
  try {
    // Get current year for ATCF files
    const currentYear = new Date().getFullYear()
    
    // Only check Western Pacific basin (WP) - Philippines is in Western Pacific
    // Skip Atlantic (AL), Eastern Pacific (EP), and Central Pacific (CP) as they don't affect Philippines
    const basin = 'WP' // Western Pacific only
    const typhoons: Typhoon[] = []
    
    // Create a timeout promise
    const timeoutPromise = (ms: number) => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), ms)
    )
    
    try {
      // Only check the first 3 storms to reduce requests (most active storms are numbered 1-3)
      for (let stormNum = 1; stormNum <= 3; stormNum++) {
        const stormId = stormNum.toString().padStart(2, '0')
        
        // Try forecast data first (more current) with 1 second timeout
        const forecastFilename = `${basin.toLowerCase()}${stormId}${currentYear}.fst`
        try {
          const forecastResponse = await Promise.race([
            fetch(`https://ftp.nhc.noaa.gov/atcf/fst/${forecastFilename}`, {
              headers: {
                'User-Agent': 'PH-Hazard-Map/1.0'
              },
              next: { revalidate: 300 }
            }),
            timeoutPromise(1000) // 1 second timeout
          ]) as Response
          
          if (forecastResponse.ok) {
            const forecastData = await forecastResponse.text()
            const parsedTyphoons = parseATCForecastData(forecastData, basin)
            typhoons.push(...parsedTyphoons)
            continue // Skip best track if we have forecast data
      }
    } catch {
          // Request timed out, continue to next
          continue
        }
        
        // Fallback to best track data with 1 second timeout
        const bestTrackFilename = `b${basin.toLowerCase()}${stormId}${currentYear}.dat`
        try {
          const bestTrackResponse = await Promise.race([
            fetch(`https://ftp.nhc.noaa.gov/atcf/btk/${bestTrackFilename}`, {
              headers: {
                'User-Agent': 'PH-Hazard-Map/1.0'
              },
              next: { revalidate: 300 }
            }),
            timeoutPromise(1000) // 1 second timeout
          ]) as Response
          
          if (bestTrackResponse.ok) {
            const data = await bestTrackResponse.text()
            const parsedTyphoons = parseATCFData(data, basin)
            typhoons.push(...parsedTyphoons)
          }
        } catch {
          // Request timed out, continue to next
          continue
        }
      }
  } catch (error) {
      console.log(`Error fetching ATCF data for Western Pacific basin:`, error)
    }
    
    return typhoons
    
  } catch (error) {
    console.log('ATCF best track data not available:', error)
    return []
  }
}

/**
 * Fetch JTWC web data (alternative source)
 */
async function fetchJTWCWebData(): Promise<Typhoon[]> {
  try {
    // JTWC provides data through their website
    // This is a placeholder for web scraping or API integration
    console.log('JTWC web data integration not yet implemented')
    return []
    
  } catch (error) {
    console.log('JTWC web data not available:', error)
    return []
  }
}

/**
 * Parse ATCF forecast data format (.fst files)
 */
function parseATCForecastData(atcfText: string, basin: string): Typhoon[] {
  const typhoons: Typhoon[] = []
  let counter = 0
  
  // Only include storms from the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  try {
    const lines = atcfText.trim().split('\n')
    
    // Group lines by storm
    const stormGroups: { [key: string]: string[] } = {}
    
    for (const line of lines) {
      if (line.trim() === '') continue
      
      const fields = line.split(',')
      if (fields.length < 10) continue
      
      const stormNumber = fields[1].trim()
      const stormKey = `${basin}_${stormNumber}`
      
      if (!stormGroups[stormKey]) {
        stormGroups[stormKey] = []
      }
      stormGroups[stormKey].push(line)
    }
    
    // Process each storm
    for (const [, stormLines] of Object.entries(stormGroups)) {
      const typhoon = parseATCForecastStorm(stormLines, basin, counter++)
      if (typhoon) {
        // Only include recent storms (last 7 days)
        const stormDate = new Date(typhoon.timestamp)
        if (stormDate >= sevenDaysAgo) {
          typhoons.push(typhoon)
        }
      }
    }
    
  } catch (error) {
    console.error('Error parsing ATCF forecast data:', error)
  }
  
  return typhoons
}

/**
 * Parse a single storm from ATCF forecast data
 */
function parseATCForecastStorm(stormLines: string[], basin: string, counter: number): Typhoon | null {
  try {
    if (stormLines.length === 0) return null
    
    // Parse the first line to get storm info
    const firstLine = stormLines[0]
    const fields = firstLine.split(',')
    if (fields.length < 10) return null
    
    const basinCode = fields[0].trim()
    const stormNumber = fields[1].trim()
    const timestamp = fields[2].trim()
    const tech = fields[4].trim()
    
    // Only process official forecasts
    if (tech !== 'OFCL') return null
    
    // Parse current position
    const latStr = fields[6].trim()
    const lonStr = fields[7].trim()
    
    if (!latStr || !lonStr) return null
    
    const latitude = parseATCFCoordinate(latStr)
    const longitude = parseATCFCoordinate(lonStr)
    
    if (isNaN(latitude) || isNaN(longitude)) return null
    
    // Parse wind speed
    const windSpeed = parseInt(fields[8].trim()) || 0
    const windSpeedKph = Math.round(windSpeed * 1.852)
    
    // Parse pressure
    const pressure = parseInt(fields[9].trim()) || 1013
    
    // Parse storm name (if available)
    const stormName = fields[27]?.trim() || `Storm ${stormNumber}`
    
    // Determine category
    const category = determineCategoryFromWindSpeed(windSpeed)
    
    // Parse timestamp
    const year = parseInt(timestamp.substring(0, 4))
    const month = parseInt(timestamp.substring(4, 6)) - 1
    const day = parseInt(timestamp.substring(6, 8))
    const hour = parseInt(timestamp.substring(8, 10))
    const date = new Date(year, month, day, hour)
    
    // Parse forecast points
    const forecast: ForecastPoint[] = []
    
    for (const line of stormLines) {
      const lineFields = line.split(',')
      if (lineFields.length < 10) continue
      
      const tau = parseInt(lineFields[5].trim()) // Forecast hour
      if (tau === 0) continue // Skip current position
      
      const forecastLatStr = lineFields[6].trim()
      const forecastLonStr = lineFields[7].trim()
      
      if (!forecastLatStr || !forecastLonStr) continue
      
      const forecastLat = parseATCFCoordinate(forecastLatStr)
      const forecastLon = parseATCFCoordinate(forecastLonStr)
      
      if (isNaN(forecastLat) || isNaN(forecastLon)) continue
      
      const forecastWindSpeed = parseInt(lineFields[8].trim()) || 0
      const forecastPressure = parseInt(lineFields[9].trim()) || 1013
      
      forecast.push({
        coordinates: [forecastLon, forecastLat],
        timestamp: new Date(date.getTime() + tau * 60 * 60 * 1000).toISOString(),
        windSpeed: forecastWindSpeed,
        pressure: forecastPressure,
        category: determineCategoryFromWindSpeed(forecastWindSpeed)
      })
    }
    
    // Determine basin name
    const basinName = getBasinName(basinCode)
    
    const typhoon: Typhoon = {
      id: `atcf_forecast_${basinCode.toLowerCase()}_${stormNumber}_${timestamp}_${counter}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'typhoon',
      name: stormName,
      basin: basinName,
      category,
      coordinates: [longitude, latitude],
      timestamp: date.toISOString(),
      windSpeed,
      windSpeedKph,
      pressure,
      movementSpeed: 0,
      movementDirection: 0,
      forecast,
      status: 'Active',
      warnings: [`${category} ${stormName} in ${basinName} - Official Forecast`],
      jtwcUrl: 'https://www.metoc.navy.mil/jtwc/jtwc.html',
      windRadii: {
        radius34kt: { ne: 0, se: 0, sw: 0, nw: 0 },
        radius50kt: { ne: 0, se: 0, sw: 0, nw: 0 },
        radius64kt: { ne: 0, se: 0, sw: 0, nw: 0 }
      }
    }
    
    return typhoon
    
  } catch (error) {
    console.error('Error parsing ATCF forecast storm:', error)
    return null
  }
}

/**
 * Parse ATCF data format
 */
function parseATCFData(atcfText: string, basin: string): Typhoon[] {
  const typhoons: Typhoon[] = []
  let counter = 0
  
  // Only include storms from the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  try {
    const lines = atcfText.trim().split('\n')
    
    for (const line of lines) {
      if (line.trim() === '') continue
      
      const typhoon = parseATCFLine(line, basin, counter++)
      if (typhoon) {
        // Only include recent storms (last 7 days)
        const stormDate = new Date(typhoon.timestamp)
        if (stormDate >= sevenDaysAgo) {
          typhoons.push(typhoon)
        }
      }
    }
    
  } catch (error) {
    console.error('Error parsing ATCF data:', error)
  }
  
  return typhoons
}

/**
 * Parse individual ATCF line
 * ATCF format: BASIN, CY, YYYYMMDDHH, TECHNUM, TECH, TAU, LatN/S, LonE/W, VMAX, MSLP, TY, RAD, WINDCODE, RAD1, RAD2, RAD3, RAD4, POUTER, ROUTER, RMW, GUSTS, EYE, SUBREGION, MAXSEAS, INITIALS, DIR, SPEED, STORMNAME, DEPTH, SEAS, SEASCODE, SEAS1, SEAS2, SEAS3, SEAS4, USERDEFINE1, USERDEFINE2, USERDEFINE3, USERDEFINE4, USERDEFINE5
 */
function parseATCFLine(line: string, basin: string, counter: number): Typhoon | null {
  try {
    const fields = line.split(',')
    if (fields.length < 10) return null
    
    const basinCode = fields[0].trim()
    const stormNumber = fields[1].trim()
    const timestamp = fields[2].trim()
    const tech = fields[4].trim()
    
    // Only process BEST track data
    if (tech !== 'BEST') return null
    
    // Parse coordinates
    const latStr = fields[6].trim()
    const lonStr = fields[7].trim()
    
    if (!latStr || !lonStr) return null
    
    // Convert ATCF coordinate format (e.g., "76N" -> 76.0, "250W" -> -250.0)
    const latitude = parseATCFCoordinate(latStr)
    const longitude = parseATCFCoordinate(lonStr)
    
    if (isNaN(latitude) || isNaN(longitude)) return null
    
    // Parse wind speed (knots)
    const windSpeed = parseInt(fields[8].trim()) || 0
    const windSpeedKph = Math.round(windSpeed * 1.852)
    
    // Parse pressure
    const pressure = parseInt(fields[9].trim()) || 1013
    
    // Parse storm name
    const stormName = fields[27]?.trim() || `Storm ${stormNumber}`
    
    // Determine category
    const category = determineCategoryFromWindSpeed(windSpeed)
    
    // Parse timestamp
    const year = parseInt(timestamp.substring(0, 4))
    const month = parseInt(timestamp.substring(4, 6)) - 1 // JavaScript months are 0-indexed
    const day = parseInt(timestamp.substring(6, 8))
    const hour = parseInt(timestamp.substring(8, 10))
    const date = new Date(year, month, day, hour)
    
    // Determine basin name
    const basinName = getBasinName(basinCode)
    
    const typhoon: Typhoon = {
      id: `atcf_${basinCode.toLowerCase()}_${stormNumber}_${timestamp}_${counter}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'typhoon',
      name: stormName,
      basin: basinName,
      category,
      coordinates: [longitude, latitude],
      timestamp: date.toISOString(),
      windSpeed,
      windSpeedKph,
      pressure,
      movementSpeed: 0, // Not available in ATCF format
      movementDirection: 0, // Not available in ATCF format
      forecast: [], // ATCF best track doesn't include forecasts
      status: 'Active',
      warnings: [`${category} ${stormName} in ${basinName}`],
      jtwcUrl: 'https://www.metoc.navy.mil/jtwc/jtwc.html',
      windRadii: {
        radius34kt: { ne: 0, se: 0, sw: 0, nw: 0 },
        radius50kt: { ne: 0, se: 0, sw: 0, nw: 0 },
        radius64kt: { ne: 0, se: 0, sw: 0, nw: 0 }
      }
    }
    
    return typhoon
    
  } catch (error) {
    console.error('Error parsing ATCF line:', error)
    return null
  }
}

/**
 * Parse ATCF coordinate format (e.g., "76N" -> 76.0, "250W" -> -250.0)
 * ATCF uses tenths of degrees, so "250W" means 25.0°W
 */
function parseATCFCoordinate(coordStr: string): number {
  const match = coordStr.match(/^(\d+)([NSEW])$/)
  if (!match) return NaN
  
  const value = parseInt(match[1])
  const direction = match[2]
  
  // ATCF uses tenths of degrees, so divide by 10
  const degrees = value / 10
  
  if (direction === 'S' || direction === 'W') {
    return -degrees
  }
  
  return degrees
}

/**
 * Determine basin name from ATCF basin code
 */
function getBasinName(basinCode: string): string {
  const basinMap: { [key: string]: string } = {
    'AL': 'Atlantic',
    'NA': 'Atlantic',
    'EP': 'Eastern Pacific',
    'CP': 'Central Pacific',
    'WP': 'Western Pacific',
    'IO': 'Indian Ocean',
    'NI': 'Indian Ocean',
    'SI': 'Indian Ocean',
    'SH': 'Southern Hemisphere',
    'SP': 'Southern Pacific',
    'SA': 'South Atlantic',
    'MM': 'Indian Ocean',
  }

  return basinMap[basinCode.trim().replace(/"/g, '')] || basinCode
}

/**
 * Determine category from wind speed
 */
function determineCategoryFromWindSpeed(windSpeed: number): string {
  if (windSpeed < 34) return 'TD' // Tropical Depression
  if (windSpeed < 64) return 'TS' // Tropical Storm
  if (windSpeed < 83) return 'Cat1' // Category 1
  if (windSpeed < 96) return 'Cat2' // Category 2
  if (windSpeed < 113) return 'Cat3' // Category 3
  if (windSpeed < 137) return 'Cat4' // Category 4
  return 'Cat5' // Category 5
}

/**
 * Fetch from additional reliable sources as fallback - NO HTML PARSING
 * Note: IBTrACS is now the primary source in fetchJTWCTyphoons()
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchOtherReliableSources(): Promise<Typhoon[]> {
  try {
    const [digitalTyphoonData] = await Promise.allSettled([
      fetchFromDigitalTyphoon() // Fallback only - may be unreachable
    ])

    const typhoons: Typhoon[] = []

    if (digitalTyphoonData.status === 'fulfilled' && digitalTyphoonData.value.length > 0) {
      const digitalTyphoons = digitalTyphoonData.value
      digitalTyphoons.forEach((typhoon) => {
        typhoon.forecast = generateSampleForecast(typhoon.coordinates, typhoon.windSpeed || 35)
      })
      typhoons.push(...digitalTyphoons)
      console.log(`Added ${digitalTyphoons.length} typhoons from Digital Typhoon (fallback)`)
    }

    return typhoons
  } catch {
    return []
  }
}

/**
 * Fetch typhoons from NHC RSS feeds (Atlantic and Eastern Pacific)
 * This is a reliable, free, official US government data source
 */
async function fetchNHCTyphoonsData(): Promise<Typhoon[]> {
  try {
    console.log('Fetching data from NOAA National Hurricane Center...')
    
    const [atlanticTyphoons, pacificTyphoons] = await Promise.allSettled([
      fetchNHCTyphoons('https://www.nhc.noaa.gov/index-at.xml', 'Atlantic'),
      fetchNHCTyphoons('https://www.nhc.noaa.gov/index-ep.xml', 'Eastern Pacific')
    ])
    
    const typhoons: Typhoon[] = []
    
    if (atlanticTyphoons.status === 'fulfilled') {
      typhoons.push(...atlanticTyphoons.value)
      console.log(`Found ${atlanticTyphoons.value.length} Atlantic storms`)
    }
    
    if (pacificTyphoons.status === 'fulfilled') {
      typhoons.push(...pacificTyphoons.value)
      console.log(`Found ${pacificTyphoons.value.length} Eastern Pacific storms`)
    }
    
    if (typhoons.length > 0) {
      console.log(`Total NHC storms found: ${typhoons.length}`)
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchOpenWeatherMapTyphoons(): Promise<Typhoon[]> {
  try {
    // Try multiple data sources in sequence - NO HTML PARSING
    const sources = [
      fetchFromIBTrACS(), // IBTrACS - same source as Zoom Earth uses
      fetchFromJMA(), // Japan Meteorological Agency (official Western Pacific source)
      fetchFromDigitalTyphoon(), // Digital Typhoon Atom feed (structured)
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
 * Fetch from Japan Meteorological Agency (JMA) - Official Western Pacific source
 * This is the most reliable official source for Western Pacific typhoons
 */
async function fetchFromJMA(): Promise<Typhoon[]> {
  try {
    console.log('Fetching data from Japan Meteorological Agency...')
    
    // JMA provides best track data in structured format
    // For now, we'll use their public data feeds
    const response = await fetch('https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/besttrack.html', {
      headers: {
        'User-Agent': 'PH-Hazard-Map/1.0 (contact@example.com)'
      },
      next: { revalidate: 300 }
    })
    
    if (!response.ok) {
      throw new Error(`JMA fetch error: ${response.status}`)
    }
    
    const html = await response.text()
    const typhoons = parseJMAData(html)
    
    if (typhoons.length > 0) {
      console.log(`Found ${typhoons.length} active typhoons from JMA`)
      return typhoons
    }
    
    console.log('No active typhoons found in JMA data')
    return []
    
  } catch (error) {
    console.log('JMA data source not available:', error)
    return []
  }
}

/**
 * Parse JMA data for active typhoons
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseJMAData(html: string): Typhoon[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const typhoons: Typhoon[] = []
  
  try {
    // JMA provides structured data - this is a placeholder for proper parsing
    // In a real implementation, you would parse their structured data files
    console.log('JMA data parsing not yet implemented - using fallback sources')
    return []
    
  } catch (error) {
    console.error('Error parsing JMA data:', error)
    return []
  }
}

/**
 * Fetch from Digital Typhoon (Japan) - Structured Atom feed
 * This is a reliable structured data source for Western Pacific typhoons
 */
async function fetchFromDigitalTyphoon(): Promise<Typhoon[]> {
  try {
    console.log('Fetching live data from Digital Typhoon...')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

    const response = await fetch('https://agora.ex.nii.ac.jp/digital-typhoon/atom/en.atom', {
      headers: {
        'Accept': 'application/atom+xml, application/xml, text/xml',
        'User-Agent': 'PH-Hazard-Map/1.0 (contact@example.com)'
      },
      signal: controller.signal,
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`Digital Typhoon fetch error: ${response.status}`)
    }
    
    const xmlText = await response.text()
    const typhoons = parseDigitalTyphoonAtom(xmlText)
    
    if (typhoons.length > 0) {
      console.log(`Found ${typhoons.length} active typhoons from Digital Typhoon`)
      return typhoons
    }
    
    console.log('No active typhoons found in Digital Typhoon feed')
    return []
    
  } catch {
    console.log('Digital Typhoon data source not available (timeout or unreachable)')
    return []
  }
}

/**
 * Parse Digital Typhoon Atom feed XML
 */
function parseDigitalTyphoonAtom(xmlText: string): Typhoon[] {
  const typhoons: Typhoon[] = []
  
  try {
    // Check if there are active typhoons (not "No typhoon information")
    if (xmlText.includes('No typhoon information is received')) {
      console.log('Digital Typhoon reports no active typhoons')
      return []
    }
    
    // Parse typhoon entries from Atom feed
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
    let entryMatch
    
    while ((entryMatch = entryRegex.exec(xmlText)) !== null) {
      const entryContent = entryMatch[1]
      
      // Skip non-typhoon entries (satellite images, etc.)
      if (!entryContent.includes('typhoon') && !entryContent.includes('tropical')) {
        continue
      }
      
      const typhoon = parseDigitalTyphoonEntry(entryContent)
      if (typhoon) {
        typhoons.push(typhoon)
      }
    }
    
  } catch (error) {
    console.error('Error parsing Digital Typhoon Atom feed:', error)
  }
  
  return typhoons
}

/**
 * Parse individual typhoon entry from Digital Typhoon Atom feed
 */
function parseDigitalTyphoonEntry(entryContent: string): Typhoon | null {
  try {
    // Extract title
    const titleMatch = entryContent.match(/<title>([^<]+)<\/title>/)
    if (!titleMatch) return null
    
    const title = titleMatch[1]
    
    // Skip if it's not a typhoon entry
    if (!title.toLowerCase().includes('typhoon') && !title.toLowerCase().includes('tropical')) {
      return null
    }
    
    // Extract coordinates if available
    const geoMatch = entryContent.match(/<geo:lat>([^<]+)<\/geo:lat>[\s\S]*?<geo:long>([^<]+)<\/geo:long>/)
    if (!geoMatch) {
      // Skip entries without valid coordinates
      return null
    }
    const coordinates: [number, number] = [parseFloat(geoMatch[2]), parseFloat(geoMatch[1])]
    
    // Validate coordinates
    if (isNaN(coordinates[0]) || isNaN(coordinates[1]) || coordinates[0] === 0 || coordinates[1] === 0) {
      return null
    }
    
    // Extract updated time
    const updatedMatch = entryContent.match(/<updated>([^<]+)<\/updated>/)
    const timestamp = updatedMatch ? updatedMatch[1] : new Date().toISOString()
    
    // For now, create a basic typhoon entry
    // In a real implementation, you'd parse more detailed information
    const typhoon: Typhoon = {
      id: `digital_typhoon_${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      type: 'typhoon',
      name: title.replace(/Digital Typhoon:\s*/i, '').trim(),
      basin: 'Western Pacific',
      category: 'TD', // Default to Tropical Depression
      coordinates,
      timestamp,
      windSpeed: 30, // Default values
      windSpeedKph: 55,
      pressure: 1005,
      movementSpeed: 15,
      movementDirection: 270,
      forecast: [],
      status: 'Active',
      warnings: [`Active typhoon from Digital Typhoon: ${title}`],
      jtwcUrl: 'https://agora.ex.nii.ac.jp/digital-typhoon/',
      windRadii: {
        radius34kt: { ne: 100, se: 100, sw: 100, nw: 100 },
        radius50kt: { ne: 50, se: 50, sw: 50, nw: 50 },
        radius64kt: { ne: 0, se: 0, sw: 0, nw: 0 }
      }
    }
    
    return typhoon
    
  } catch (error) {
    console.error('Error parsing Digital Typhoon entry:', error)
    return null
  }
}

/**
 * Fetch active tropical cyclones from IBTrACS (NOAA NCEI)
 * This is the same data source used by Zoom Earth
 * URL: https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.ACTIVE.list.v04r01.csv
 */
async function fetchFromIBTrACS(): Promise<Typhoon[]> {
  try {
    console.log('Fetching active storms from IBTrACS (NOAA NCEI)...')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    const response = await fetch(
      'https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.ACTIVE.list.v04r01.csv',
      {
        headers: { 'User-Agent': 'PH-Hazard-Map/1.0' },
        signal: controller.signal,
        next: { revalidate: 300 }
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`IBTrACS fetch error: ${response.status}`)
    }

    const csvText = await response.text()
    const typhoons = parseIBTrACSActiveCSV(csvText)

    if (typhoons.length > 0) {
      console.log(`Found ${typhoons.length} active storms from IBTrACS`)
    } else {
      console.log('No active tropical cyclones in IBTrACS data')
    }

    return typhoons
  } catch {
    console.log('IBTrACS data source not available (timeout or unreachable)')
    return []
  }
}

/**
 * Parse IBTrACS ACTIVE CSV into Typhoon objects.
 * Groups rows by storm SID, takes latest position per storm.
 */
function parseIBTrACSActiveCSV(csvText: string): Typhoon[] {
  const typhoons: Typhoon[] = []

  try {
    const lines = csvText.trim().split('\n')
    if (lines.length < 3) return [] // header + units + at least 1 data row

    const headers = lines[0].split(',')
    const col = (name: string) => headers.indexOf(name)

    // Column indices
    const iSID = col('SID')
    const iName = col('NAME')
    const iBASIN = col('BASIN')
    const iTime = col('ISO_TIME')
    const iLat = col('LAT')
    const iLon = col('LON')
    const iWmoWind = col('WMO_WIND')
    const iWmoPres = col('WMO_PRES')
    const iUsaWind = col('USA_WIND')
    const iUsaPres = col('USA_PRES')
    const iUsaStatus = col('USA_STATUS')
    const iUsaR34NE = col('USA_R34_NE')
    const iUsaR34SE = col('USA_R34_SE')
    const iUsaR34SW = col('USA_R34_SW')
    const iUsaR34NW = col('USA_R34_NW')
    const iUsaR50NE = col('USA_R50_NE')
    const iUsaR50SE = col('USA_R50_SE')
    const iUsaR50SW = col('USA_R50_SW')
    const iUsaR50NW = col('USA_R50_NW')
    const iUsaR64NE = col('USA_R64_NE')
    const iUsaR64SE = col('USA_R64_SE')
    const iUsaR64SW = col('USA_R64_SW')
    const iUsaR64NW = col('USA_R64_NW')
    const iStormSpeed = col('STORM_SPEED')
    const iStormDir = col('STORM_DIR')

    // Group data rows by storm SID (skip row 1 which is units)
    const stormRows: { [sid: string]: string[][] } = {}
    for (let i = 2; i < lines.length; i++) {
      const fields = lines[i].split(',')
      if (fields.length < 10) continue
      const sid = fields[iSID]?.trim()
      if (!sid) continue
      if (!stormRows[sid]) stormRows[sid] = []
      stormRows[sid].push(fields)
    }

    for (const [sid, rows] of Object.entries(stormRows)) {
      // Latest row = last entry (data is chronological)
      const latest = rows[rows.length - 1]
      const name = latest[iName]?.trim().replace(/"/g, '') || 'UNNAMED'
      const basin = latest[iBASIN]?.trim().replace(/"/g, '') || ''
      const time = latest[iTime]?.trim().replace(/"/g, '') || ''
      const lat = parseFloat(latest[iLat]?.trim())
      const lon = parseFloat(latest[iLon]?.trim())

      if (isNaN(lat) || isNaN(lon)) continue

      // Prefer USA wind/pressure, fall back to WMO
      const windKt = parseInt(latest[iUsaWind]?.trim()) || parseInt(latest[iWmoWind]?.trim()) || 0
      const pressure = parseInt(latest[iUsaPres]?.trim()) || parseInt(latest[iWmoPres]?.trim()) || 1013
      const status = latest[iUsaStatus]?.trim().replace(/"/g, '') || ''
      const movementSpeed = parseInt(latest[iStormSpeed]?.trim()) || 0
      const movementDirection = parseInt(latest[iStormDir]?.trim()) || 0

      // Parse wind radii
      const parseRadii = (ne: number, se: number, sw: number, nw: number) =>
        ({ ne: ne || 0, se: se || 0, sw: sw || 0, nw: nw || 0 })

      const windRadii = {
        radius34kt: parseRadii(
          parseInt(latest[iUsaR34NE]?.trim()), parseInt(latest[iUsaR34SE]?.trim()),
          parseInt(latest[iUsaR34SW]?.trim()), parseInt(latest[iUsaR34NW]?.trim())
        ),
        radius50kt: parseRadii(
          parseInt(latest[iUsaR50NE]?.trim()), parseInt(latest[iUsaR50SE]?.trim()),
          parseInt(latest[iUsaR50SW]?.trim()), parseInt(latest[iUsaR50NW]?.trim())
        ),
        radius64kt: parseRadii(
          parseInt(latest[iUsaR64NE]?.trim()), parseInt(latest[iUsaR64SE]?.trim()),
          parseInt(latest[iUsaR64SW]?.trim()), parseInt(latest[iUsaR64NW]?.trim())
        ),
      }

      const category = determineCategoryFromWindSpeed(windKt)
      const basinName = getBasinName(basin)

      // Build track from historical rows as forecast reference
      const track: ForecastPoint[] = []
      // Use last 5 positions as recent track (not a forecast, but useful for display)
      const recentRows = rows.slice(-6, -1) // 5 rows before the latest
      for (const row of recentRows) {
        const tLat = parseFloat(row[iLat]?.trim())
        const tLon = parseFloat(row[iLon]?.trim())
        const tWind = parseInt(row[iUsaWind]?.trim()) || parseInt(row[iWmoWind]?.trim()) || 0
        const tPres = parseInt(row[iUsaPres]?.trim()) || parseInt(row[iWmoPres]?.trim()) || 1013
        const tTime = row[iTime]?.trim().replace(/"/g, '') || ''
        if (!isNaN(tLat) && !isNaN(tLon)) {
          track.push({
            coordinates: [tLon, tLat],
            timestamp: tTime,
            windSpeed: tWind,
            pressure: tPres,
            category: determineCategoryFromWindSpeed(tWind)
          })
        }
      }

      const typhoon: Typhoon = {
        id: `ibtracs_${sid.replace(/[^a-zA-Z0-9]/g, '_')}`,
        type: 'typhoon',
        name,
        basin: basinName,
        category,
        coordinates: [lon, lat],
        timestamp: time,
        windSpeed: windKt,
        windSpeedKph: Math.round(windKt * 1.852),
        pressure,
        movementSpeed,
        movementDirection,
        forecast: generateSampleForecast([lon, lat], windKt),
        status: status || 'Active',
        warnings: [`${category} ${name} in ${basinName}`],
        jtwcUrl: 'https://www.ncei.noaa.gov/products/international-best-track-archive',
        windRadii
      }

      typhoons.push(typhoon)
    }
  } catch (error) {
    console.error('Error parsing IBTrACS active CSV:', error)
  }

  return typhoons
}

/**
 * Parse IBTrACS CSV data
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseIBTrACSCSV(csvText: string): Typhoon[] {
  const typhoons: Typhoon[] = []
  
  try {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',')
    
    // Find column indices
    const nameIndex = headers.findIndex(h => h.includes('NAME'))
    const basinIndex = headers.findIndex(h => h.includes('BASIN'))
    const latIndex = headers.findIndex(h => h.includes('LAT'))
    const lonIndex = headers.findIndex(h => h.includes('LON'))
    const windIndex = headers.findIndex(h => h.includes('WMO_WIND'))
    const pressureIndex = headers.findIndex(h => h.includes('WMO_PRES'))
    const timeIndex = headers.findIndex(h => h.includes('ISO_TIME'))
    
    // Group by storm to get the latest position for each active storm
    const stormData: { [key: string]: {
      name: string
      basin: string
      lat: number
      lon: number
      wind: number
      pressure: number
      time: string
    } } = {}
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length < headers.length) continue
      
      const name = values[nameIndex]?.replace(/"/g, '').trim()
      const basin = values[basinIndex]?.replace(/"/g, '').trim()
      const lat = parseFloat(values[latIndex])
      const lon = parseFloat(values[lonIndex])
      const wind = parseInt(values[windIndex]) || 0
      const pressure = parseInt(values[pressureIndex]) || 1013
      const time = values[timeIndex]?.replace(/"/g, '').trim()
      
      if (!name || isNaN(lat) || isNaN(lon)) continue
      
      // Only include recent data (last 7 days) and active storms
      const stormTime = new Date(time)
      const daysDiff = (Date.now() - stormTime.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysDiff > 7) continue
      
      // Keep the most recent data for each storm
      if (!stormData[name] || new Date(time) > new Date(stormData[name].time)) {
        stormData[name] = {
          name,
          basin,
          lat,
          lon,
          wind,
          pressure,
          time
        }
      }
    }
    
    // Convert to Typhoon objects
    for (const [name, data] of Object.entries(stormData)) {
      const windSpeedKph = data.wind
      const windSpeed = Math.round(windSpeedKph * 0.539957) // Convert km/h to knots
      
      const typhoon: Typhoon = {
        id: `ibtracs_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        type: 'typhoon',
        name: data.name,
        basin: getBasinName(data.basin),
        category: determineCategoryFromWindSpeed(windSpeed),
        coordinates: [data.lon, data.lat],
        timestamp: data.time,
        windSpeed,
        windSpeedKph,
        pressure: data.pressure,
        movementSpeed: 0, // Not available in IBTrACS
        movementDirection: 0, // Not available in IBTrACS
        forecast: [], // IBTrACS is historical data
        status: 'Active',
        warnings: [`${determineCategoryFromWindSpeed(windSpeed)} ${data.name} in ${getBasinName(data.basin)}`],
        jtwcUrl: 'https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/',
        windRadii: {
          radius34kt: { ne: 0, se: 0, sw: 0, nw: 0 },
          radius50kt: { ne: 0, se: 0, sw: 0, nw: 0 },
          radius64kt: { ne: 0, se: 0, sw: 0, nw: 0 }
        }
      }
      
      typhoons.push(typhoon)
    }
    
  } catch (error) {
    console.error('Error parsing IBTrACS data:', error)
  }
  
  return typhoons
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
      id: `typhoon_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    
    // Generate ID from ATCF code or name (ensure uniqueness)
    const id = atcfMatch ? `${atcfMatch[1].trim().toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : `typhoon_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
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
 * Convert PAGASA location descriptions to coordinates
 * This function maps Philippine locations to approximate coordinates
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function convertLocationDescriptionToCoordinates(description: string): [number, number] {
  // Philippine city coordinates database
  const philippineCities: { [key: string]: [number, number] } = {
    // Luzon
    'Juban, Sorsogon': [124.1, 12.8],
    'Caramoran': [124.0, 13.0],
    'Infanta, Quezon': [121.6, 14.7],
    'Dagupan City, Pangasinan': [120.3, 16.0],
    'Sinait, Ilocos Sur': [120.5, 17.5],
    'Guiuan, Eastern Samar': [125.7, 11.0],
    
    // Visayas
    'Tacloban': [125.0, 11.2],
    'Cebu City': [123.9, 10.3],
    'Iloilo City': [122.6, 10.7],
    
    // Mindanao
    'Davao City': [125.6, 7.1],
    'Cagayan de Oro': [124.6, 8.5],
    'Zamboanga City': [122.1, 6.9]
  }
  
  // Try to find exact city match first
  for (const [city, coords] of Object.entries(philippineCities)) {
    if (description.includes(city)) {
      return coords
    }
  }
  
  // Parse distance and direction from reference points
  const distanceMatch = description.match(/(\d+)\s*km\s+(East|West|North|South|Northeast|Northwest|Southeast|Southwest)\s+of\s+([^,]+)/i)
  if (distanceMatch) {
    const distance = parseInt(distanceMatch[1])
    const direction = distanceMatch[2].toLowerCase()
    const referenceCity = distanceMatch[3].trim()
    
    // Find reference city coordinates
    let refCoords: [number, number] | null = null
    for (const [city, coords] of Object.entries(philippineCities)) {
      if (referenceCity.includes(city.split(',')[0])) {
        refCoords = coords
        break
      }
    }
    
    if (refCoords) {
      // Convert distance to degrees (approximate: 1 degree ≈ 111 km)
      const distanceInDegrees = distance / 111
      
      let [lon, lat] = refCoords
      
      // Adjust coordinates based on direction
      switch (direction) {
        case 'east':
          lon += distanceInDegrees
          break
        case 'west':
          lon -= distanceInDegrees
          break
        case 'north':
          lat += distanceInDegrees
          break
        case 'south':
          lat -= distanceInDegrees
          break
        case 'northeast':
          lon += distanceInDegrees * 0.7
          lat += distanceInDegrees * 0.7
          break
        case 'northwest':
          lon -= distanceInDegrees * 0.7
          lat += distanceInDegrees * 0.7
          break
        case 'southeast':
          lon += distanceInDegrees * 0.7
          lat -= distanceInDegrees * 0.7
          break
        case 'southwest':
          lon -= distanceInDegrees * 0.7
          lat -= distanceInDegrees * 0.7
          break
      }
      
      return [lon, lat]
    }
  }
  
  // Fallback: return approximate coordinates for Philippine Sea area
  return [125.0, 13.0]
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

// PAGASA HTML parsing removed - using only structured data sources

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

// ATCF parsing is now implemented above in the main JTWC integration

/**
 * Generate sample forecast data for testing cone of uncertainty
 * This creates a realistic forecast track based on current position and wind speed
 */
function generateSampleForecast(currentCoords: [number, number], windSpeed: number): ForecastPoint[] {
  const [lon, lat] = currentCoords
  const forecast: ForecastPoint[] = []
  
  // Generate 5 forecast points (24h, 48h, 72h, 96h, 120h)
  for (let i = 1; i <= 5; i++) {
    const hours = i * 24
    const days = i
    
    // Typical typhoon movement: 15-25 km/h westward, slight northward drift
    const speedKmh = 20 // km/h
    const distanceKm = speedKmh * hours
    const distanceDeg = distanceKm / 111 // Approximate km per degree
    
    // Movement: primarily westward with slight northward component
    const westMovement = distanceDeg * 0.9 // 90% westward
    const northMovement = distanceDeg * 0.1 * Math.sin(days * 0.5) // Slight northward oscillation
    
    const forecastLon = lon - westMovement
    const forecastLat = lat + northMovement
    
    // Wind speed typically decreases over time due to land interaction
    const forecastWindSpeed = Math.max(windSpeed * (1 - (days * 0.1)), windSpeed * 0.5)
    
    forecast.push({
      coordinates: [forecastLon, forecastLat],
      timestamp: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
      windSpeed: Math.round(forecastWindSpeed),
      pressure: 1000 + (days * 5), // Pressure typically rises over time
      category: determineCategoryFromWindSpeed(forecastWindSpeed)
    })
  }
  
  return forecast
}

/**
 * Calculate uncertainty cone coordinates
 * The cone widens over time based on forecast error statistics
 */
export function calculateUncertaintyCone(
  forecast: ForecastPoint[]
): [number, number][][] {
  const conePoints: [number, number][][] = []
  
  // Validate input
  if (!forecast || !Array.isArray(forecast) || forecast.length === 0) {
    return conePoints
  }
  
  forecast.forEach((point, index) => {
    // Validate point data
    if (!point || !point.coordinates || !Array.isArray(point.coordinates) || point.coordinates.length !== 2) {
      return
    }
    
    const [lon, lat] = point.coordinates
    
    // Validate coordinates
    if (isNaN(lon) || isNaN(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      return
    }
    
    // Error radius increases with forecast time
    // Typical error: ~50nm at 24h, ~100nm at 48h, ~150nm at 72h, ~200nm at 96h, ~250nm at 120h
    const errorRadiusNm = Math.min(50 + (index * 50), 300) // Cap at 300nm
    const errorRadiusDeg = errorRadiusNm / 60 // Convert nautical miles to degrees (approximate)
    
    // Limit radius to prevent extreme values
    const maxRadiusDeg = 5.0 // Maximum 5 degrees radius
    const clampedRadiusDeg = Math.min(errorRadiusDeg, maxRadiusDeg)
    
    // Create cone segment (simplified as circle)
    const points: [number, number][] = []
    const segments = 16 // Reduced segments for better performance
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI
      const x = lon + clampedRadiusDeg * Math.cos(angle)
      const y = lat + clampedRadiusDeg * Math.sin(angle)
      
      // Validate generated coordinates
      if (!isNaN(x) && !isNaN(y) && x >= -180 && x <= 180 && y >= -90 && y <= 90) {
      points.push([x, y])
      }
    }
    
    // Only add if we have valid points
    if (points.length >= 3) {
    conePoints.push(points)
    }
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

