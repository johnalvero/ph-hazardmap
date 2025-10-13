import { NextResponse } from 'next/server'
import { scrapePhivolcsBulletins } from '@/lib/data/volcanoes'
import { setVolcanoesInCache } from '@/lib/storage/cache'
import { saveVolcanoDataToS3, isS3Configured } from '@/lib/storage/s3'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Scrape volcano data from PHIVOLCS
    const volcanoes = await scrapePhivolcsBulletins()

    if (volcanoes.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No volcano data found',
        count: 0,
        timestamp: new Date().toISOString()
      })
    }

    // Save to S3 if configured
    if (isS3Configured()) {
      try {
        await saveVolcanoDataToS3(volcanoes)
      } catch {
        // Continue even if S3 fails
      }
    }

    // Update in-memory cache
    setVolcanoesInCache(volcanoes)

    return NextResponse.json({
      success: true,
      message: 'Volcano data scraped successfully. AI insights will be generated separately.',
      count: volcanoes.length,
      aiInsightsPending: true,
      timestamp: new Date().toISOString(),
      source: 'PHIVOLCS WOVODAT',
      storage: isS3Configured() ? 'AWS S3 + In-memory cache' : 'In-memory cache only',
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
