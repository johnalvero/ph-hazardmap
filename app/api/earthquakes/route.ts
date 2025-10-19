import { NextResponse } from 'next/server'
import { fetchPhilippineEarthquakes, type USGSMagnitude } from '@/lib/data/earthquakes'

// Force this route to be dynamic (uses query parameters)
export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidate every 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const daysAgo = parseInt(searchParams.get('daysAgo') || '7')
    const magnitude = (searchParams.get('magnitude') || 'all') as USGSMagnitude
    // No mock data - only real-time sources

    // Validate daysAgo parameter (1-30 days)
    const days = Math.max(1, Math.min(30, daysAgo))
    
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
    
    // Return empty data on error - no mock data fallback
    return NextResponse.json({
      earthquakes: [],
      metadata: {
        source: 'USGS Earthquake Hazards Program',
        generated: new Date().toISOString(),
        count: 0,
        mode: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}

