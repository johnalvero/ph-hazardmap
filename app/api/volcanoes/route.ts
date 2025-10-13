import { NextResponse } from 'next/server'
import { getVolcanoesFromCache, setVolcanoesInCache } from '@/lib/storage/cache'
import { getVolcanoDataFromS3, isS3Configured } from '@/lib/storage/s3'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check in-memory cache first (L1 - fastest)
    const cachedVolcanoes = getVolcanoesFromCache()
    if (cachedVolcanoes && cachedVolcanoes.length > 0) {
      console.log('📦 Serving volcano data from in-memory cache')
      return NextResponse.json({
        volcanoes: cachedVolcanoes,
        metadata: {
          source: 'PHIVOLCS WOVODAT (Cached)',
          generated: new Date().toISOString(),
          count: cachedVolcanoes.length,
          cache: 'in-memory'
        }
      })
    }

    // Check S3 storage (L2 - persistent)
    if (isS3Configured()) {
      try {
        const s3Data = await getVolcanoDataFromS3()
        if (s3Data && s3Data.data.length > 0) {
          // Update in-memory cache
          setVolcanoesInCache(s3Data.data)
          
          console.log('☁️ Serving volcano data from S3')
          return NextResponse.json({
            volcanoes: s3Data.data,
            metadata: {
              source: s3Data.source,
              generated: s3Data.timestamp,
              count: s3Data.count,
              cache: 's3'
            }
          })
        }
      } catch (error) {
        console.error('❌ Error fetching from S3:', error)
      }
    } else {
      console.log('⚠️ S3 not configured, skipping S3 fetch')
    }

    // No data available
    console.log('📭 No volcano data available')
    return NextResponse.json({
      volcanoes: [],
      metadata: {
        source: 'No data available',
        generated: new Date().toISOString(),
        count: 0,
        message: 'No volcano data found. Run scraping endpoint to fetch data.',
        cache: 'none'
      }
    })

  } catch (error) {
    console.error('❌ Error in volcanoes API:', error)
    
    return NextResponse.json({
      volcanoes: [],
      metadata: {
        source: 'Error',
        generated: new Date().toISOString(),
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        cache: 'error'
      }
    }, { status: 500 })
  }
}

