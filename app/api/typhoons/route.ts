import { NextResponse } from 'next/server'
import { fetchWesternPacificTyphoons, fetchJTWCTyphoons } from '@/lib/data/typhoons'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const basin = searchParams.get('basin') || 'Western Pacific'

    // Fetch typhoon data based on basin
    let typhoons
    if (basin === 'Western Pacific') {
      typhoons = await fetchWesternPacificTyphoons()
    } else {
      // For other basins, get all typhoons and filter
      const allTyphoons = await fetchJTWCTyphoons()
      typhoons = allTyphoons.filter(typhoon => typhoon.basin === basin)
    }

    return NextResponse.json({
      typhoons,
      metadata: {
        source: 'Active Tropical Cyclones Only',
        basin,
        generated: new Date().toISOString(),
        count: typhoons.length,
        updateFrequency: '5 minutes (real-time)',
        mode: 'live',
        dataSources: [
          'JTWC ATCF Data (Primary - Official)',
          'IBTrACS (Same as Zoom Earth)',
          'NOAA National Hurricane Center (Official)',
          'Japan Meteorological Agency (Official)',
          'Digital Typhoon (Japan) - Atom Feed',
          'NOAA Weather Alerts API'
        ],
        note: typhoons.length === 0 ? 'No active tropical cyclones at this time' : 'Showing active tropical cyclones only'
      }
    })
  } catch (error) {
    console.error('Error in typhoons API:', error)
    
    return NextResponse.json({
      typhoons: [],
      metadata: {
        source: 'Error',
        generated: new Date().toISOString(),
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}

