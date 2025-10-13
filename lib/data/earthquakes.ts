import { Earthquake } from '@/types/hazard'

/**
 * Fetch real-time earthquake data from USGS
 * API Documentation: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
 */

export type USGSTimeframe = 'hour' | 'day' | 'week' | 'month'
export type USGSMagnitude = 'all' | 'significant' | 'M4.5' | 'M2.5' | 'M1.0'

interface USGSFeature {
  id: string
  type: string
  properties: {
    mag: number
    place: string
    time: number
    updated: number
    tz?: number
    url: string
    detail: string
    felt?: number
    cdi?: number
    mmi?: number
    alert?: 'green' | 'yellow' | 'orange' | 'red'
    status: string
    tsunami: number
    sig: number
    net: string
    code: string
    ids: string
    sources: string
    types: string
    nst?: number
    dmin?: number
    rms: number
    gap?: number
    magType: string
    type: string
    title: string
  }
  geometry: {
    type: string
    coordinates: [number, number, number] // [longitude, latitude, depth]
  }
}

interface USGSResponse {
  type: string
  metadata: {
    generated: number
    url: string
    title: string
    status: number
    api: string
    count: number
  }
  features: USGSFeature[]
}

/**
 * Transform USGS GeoJSON feature to our Earthquake type
 */
function transformUSGSToEarthquake(feature: USGSFeature): Earthquake {
  const [longitude, latitude, depth] = feature.geometry.coordinates
  const { properties } = feature

  return {
    id: feature.id,
    type: 'earthquake',
    magnitude: properties.mag || 0,
    depth: depth || 0,
    location: extractLocation(properties.place),
    coordinates: [longitude, latitude],
    timestamp: new Date(properties.time).toISOString(),
    place: properties.place || 'Unknown location',
    alert: properties.alert,
    tsunami: properties.tsunami === 1,
    felt: properties.felt,
    cdi: properties.cdi,
    mmi: properties.mmi,
    url: properties.url
  }
}

/**
 * Extract clean location from USGS place string
 * Example: "12 km SE of Davao City, Philippines" -> "Philippines"
 */
function extractLocation(place: string): string {
  if (!place) return 'Unknown'
  
  // Try to get the last part after comma (usually the region/country)
  const parts = place.split(',').map(p => p.trim())
  if (parts.length > 1) {
    return parts[parts.length - 1]
  }
  
  return place
}

/**
 * Fetch earthquakes from USGS GeoJSON feed
 */
export async function fetchUSGSEarthquakes(
  timeframe: USGSTimeframe = 'day',
  magnitude: USGSMagnitude = 'all'
): Promise<Earthquake[]> {
  try {
    const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${magnitude}_${timeframe}.geojson`
    
    
    const response = await fetch(url, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status} ${response.statusText}`)
    }

    const data: USGSResponse = await response.json()
    

    // Transform and filter earthquakes
    const earthquakes = data.features
      .map(transformUSGSToEarthquake)
      .filter(eq => eq.magnitude !== null && eq.magnitude !== undefined)
      .sort((a, b) => b.magnitude - a.magnitude) // Sort by magnitude (highest first)

    return earthquakes
  } catch (error) {
    console.error('Error fetching USGS earthquakes:', error)
    throw error
  }
}

/**
 * Fetch earthquakes for a specific region (bounding box)
 */
export async function fetchUSGSEarthquakesByRegion(
  minLatitude: number,
  maxLatitude: number,
  minLongitude: number,
  maxLongitude: number,
  startTime?: Date,
  minMagnitude: number = 0
): Promise<Earthquake[]> {
  try {
    // USGS FDSNWS event query
    const baseUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query'
    const params = new URLSearchParams({
      format: 'geojson',
      minlatitude: minLatitude.toString(),
      maxlatitude: maxLatitude.toString(),
      minlongitude: minLongitude.toString(),
      maxlongitude: maxLongitude.toString(),
      minmagnitude: minMagnitude.toString(),
      orderby: 'time-asc'
    })

    if (startTime) {
      params.append('starttime', startTime.toISOString())
    }

    const url = `${baseUrl}?${params.toString()}`
    

    const response = await fetch(url, {
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status}`)
    }

    const data: USGSResponse = await response.json()
    
    return data.features.map(transformUSGSToEarthquake)
  } catch (error) {
    console.error('Error fetching earthquakes by region:', error)
    throw error
  }
}

/**
 * Fetch earthquakes in the Pacific Ring of Fire region (expanded coverage)
 * Includes: Philippines, Pacific Ocean, South China Sea, Brunei, Vietnam, 
 * Taiwan, Hong Kong, Japan, and surrounding regions for tsunami risk assessment
 */
export async function fetchPhilippineEarthquakes(
  minMagnitude: number = 2.5,
  days: number = 7
): Promise<Earthquake[]> {
  const startTime = new Date()
  startTime.setDate(startTime.getDate() - days)

  // Expanded Pacific Ring of Fire bounding box for tsunami risk assessment
  // Covers: Philippines, Pacific Ocean, South China Sea, Brunei, Vietnam, 
  // Taiwan, Hong Kong, Japan, Indonesia, Malaysia, and surrounding regions
  return fetchUSGSEarthquakesByRegion(
    -10.0, // Min latitude (southern Indonesia)
    50.0,  // Max latitude (northern Japan)
    100.0, // Min longitude (western Indonesia/Indian Ocean)
    160.0, // Max longitude (eastern Pacific)
    startTime,
    minMagnitude
  )
}

