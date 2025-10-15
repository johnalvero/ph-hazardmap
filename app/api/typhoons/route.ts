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
        source: 'NHC RSS Feeds (Atlantic & Eastern Pacific)',
        basin,
        generated: new Date().toISOString(),
        count: typhoons.length,
        updateFrequency: '6 hours (00, 06, 12, 18 UTC)',
        mode: 'live'
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

