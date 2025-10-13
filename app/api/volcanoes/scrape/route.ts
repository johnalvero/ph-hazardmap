import { NextResponse } from 'next/server'
import { scrapePhivolcsBulletins } from '@/lib/data/volcanoes'
import { setVolcanoesInCache } from '@/lib/storage/cache'
import { saveVolcanoDataToS3, isS3Configured } from '@/lib/storage/s3'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🚀 Starting volcano data scraping...')
    
    // Scrape volcano data from PHIVOLCS
    const volcanoes = await scrapePhivolcsBulletins()
    
    if (volcanoes.length === 0) {
      console.log('📭 No volcano data found')
      return NextResponse.json({
        success: false,
        message: 'No volcano data found',
        count: 0,
        timestamp: new Date().toISOString()
      })
    }

    // Log the scraped data for debugging
    console.log('🌋 SCRAPED VOLCANO DATA:')
    console.log('=====================================')
    volcanoes.forEach((volcano, index) => {
      console.log(`\n${index + 1}. ${volcano.name}`)
      console.log(`   Status: ${volcano.status} (Level ${volcano.activityLevel})`)
      console.log(`   Location: ${volcano.location}`)
      console.log(`   Coordinates: [${volcano.coordinates[0]}, ${volcano.coordinates[1]}]`)
      console.log(`   Elevation: ${volcano.elevation}m`)
      console.log(`   Last Update: ${volcano.lastUpdate}`)
      console.log(`   Description: ${volcano.description || 'N/A'}`)
      
      if (volcano.parameters && Object.keys(volcano.parameters).length > 0) {
        console.log(`   Parameters:`)
        Object.entries(volcano.parameters).forEach(([key, value]) => {
          console.log(`     - ${key}: ${value}`)
        })
      }
      
      if (volcano.shouldNotBeAllowed) {
        console.log(`   Should Not Be Allowed: ${volcano.shouldNotBeAllowed}`)
      }
      
      if (volcano.reminder) {
        console.log(`   Reminder: ${volcano.reminder}`)
      }
      
      if (volcano.bulletinUrl) {
        console.log(`   Bulletin URL: ${volcano.bulletinUrl}`)
      }
      
      if (volcano.bulletinDate) {
        console.log(`   Bulletin Date: ${volcano.bulletinDate}`)
      }
    })
    console.log('=====================================')
    
    // Save to S3 if configured
    if (isS3Configured()) {
      try {
        await saveVolcanoDataToS3(volcanoes)
        console.log('☁️ Volcano data saved to S3')
      } catch (error) {
        console.error('❌ Error saving to S3:', error)
        // Continue even if S3 fails
      }
    } else {
      console.log('⚠️ S3 not configured, skipping S3 save')
    }
    
    // Update in-memory cache
    setVolcanoesInCache(volcanoes)
    
    console.log(`✅ Scraping completed: ${volcanoes.length} volcanoes processed`)

    return NextResponse.json({
      success: true,
      message: 'Volcano data scraped successfully',
      count: volcanoes.length,
      timestamp: new Date().toISOString(),
      source: 'PHIVOLCS WOVODAT',
      storage: isS3Configured() ? 'AWS S3 + In-memory cache' : 'In-memory cache only',
      data: volcanoes // Include data in response for debugging
    })

  } catch (error) {
    console.error('❌ Error in volcano scraping endpoint:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
