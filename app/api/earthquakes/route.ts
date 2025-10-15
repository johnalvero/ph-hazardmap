import { NextResponse } from 'next/server'
import { fetchPhilippineEarthquakes, type USGSMagnitude } from '@/lib/data/earthquakes'
import { mockEarthquakes } from '@/lib/mock-data'

// Force this route to be dynamic (uses query parameters)
export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidate every 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const daysAgo = parseInt(searchParams.get('daysAgo') || '7')
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

    // Validate daysAgo parameter (0-30 days)
    const days = Math.max(0, Math.min(30, daysAgo))
    
    // Convert magnitude filter to minimum magnitude
    const magnitudeToMin = {
      'all': 2.5,
      'significant': 6.0,
      'M4.5': 4.5,
      'M2.5': 2.5,
      'M1.0': 1.0
    }
    
    const minMagnitude = magnitudeToMin[magnitude] || 2.5

    // Fetch Philippine earthquake data (filtered by region)
    const earthquakes = await fetchPhilippineEarthquakes(minMagnitude, days)

    return NextResponse.json({
      earthquakes,
      metadata: {
        source: 'USGS Earthquake Hazards Program',
        api: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
        region: 'Pacific Ring of Fire (-10.0°N-50.0°N, 100.0°E-160.0°E)',
        generated: new Date().toISOString(),
        count: earthquakes.length,
        daysAgo: days,
        magnitude,
        minMagnitude,
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

