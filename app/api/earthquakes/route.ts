import { NextResponse } from 'next/server'
import { fetchPhilippineEarthquakes, type USGSTimeframe, type USGSMagnitude } from '@/lib/data/earthquakes'
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

    // Convert timeframe to days for Philippine-specific query
    const timeframeToDays = {
      'hour': 1,
      'day': 1,
      'week': 7,
      'month': 30
    }
    
    const days = timeframeToDays[timeframe] || 30
    
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
        region: 'Philippines (4.5°N-21.0°N, 116.0°E-127.0°E)',
        generated: new Date().toISOString(),
        count: earthquakes.length,
        timeframe,
        magnitude,
        minMagnitude,
        days,
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

