import { NextResponse } from 'next/server'
import { fetchUSGSEarthquakes, type USGSTimeframe, type USGSMagnitude } from '@/lib/data/earthquakes'
import { mockEarthquakes } from '@/lib/mock-data'

// Force this route to be dynamic (uses query parameters)
export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidate every 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = (searchParams.get('timeframe') || 'month') as USGSTimeframe
    const magnitude = (searchParams.get('magnitude') || 'all') as USGSMagnitude
    const useMock = searchParams.get('mock') === 'true'

    // Allow fallback to mock data for development
    if (useMock) {
      return NextResponse.json({
        earthquakes: mockEarthquakes,
        metadata: {
          source: 'Mock Data',
          generated: new Date().toISOString(),
          count: mockEarthquakes.length,
          mode: 'mock'
        }
      })
    }

    // Fetch real earthquake data from USGS
    const earthquakes = await fetchUSGSEarthquakes(timeframe, magnitude)

    return NextResponse.json({
      earthquakes,
      metadata: {
        source: 'USGS Earthquake Hazards Program',
        api: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php',
        generated: new Date().toISOString(),
        count: earthquakes.length,
        timeframe,
        magnitude,
        mode: 'live'
      }
    })
  } catch (error) {
    console.error('Error in earthquakes API:', error)
    
    // Fallback to mock data on error
    return NextResponse.json({
      earthquakes: mockEarthquakes,
      metadata: {
        source: 'Mock Data (Fallback)',
        generated: new Date().toISOString(),
        count: mockEarthquakes.length,
        mode: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 200 }) // Return 200 with fallback data instead of error
  }
}

