import { NextResponse } from 'next/server'
import { scrapePhivolcsBulletins } from '@/lib/data/volcanoes'
import { setVolcanoesInCache } from '@/lib/storage/cache'
import { saveVolcanoDataToS3, isS3Configured } from '@/lib/storage/s3'
import { generateVolcanoInsight, isBedrockConfigured } from '@/lib/services/bedrock'

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

    // Generate AI insights for each volcano if Bedrock is configured
    const bedrockConfigured = isBedrockConfigured()
    
    if (bedrockConfigured) {
      // Create a new array with AI insights
      const volcanoesWithInsights = []
      
      for (let i = 0; i < volcanoes.length; i++) {
        const volcano = volcanoes[i]
        
        try {
          const aiInsight = await generateVolcanoInsight(volcano)
          
          if (aiInsight) {
            const volcanoWithInsight = { ...volcano, aiInsight }
            volcanoesWithInsights.push(volcanoWithInsight)
          } else {
            volcanoesWithInsights.push(volcano)
          }
        } catch {
          volcanoesWithInsights.push(volcano)
          // Continue with other volcanoes even if one fails
        }
        
        // Add a longer delay to avoid rate limiting (7 seconds)
        if (i < volcanoes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 7000))
        }
      }
      
      // Replace the original volcanoes array with the one that has AI insights
      volcanoes.length = 0
      volcanoes.push(...volcanoesWithInsights)
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

    const responseVolcanoesWithInsights = volcanoes.filter(v => v.aiInsight).length

    return NextResponse.json({
      success: true,
      message: 'Volcano data scraped successfully',
      count: volcanoes.length,
      aiInsightsGenerated: responseVolcanoesWithInsights,
      timestamp: new Date().toISOString(),
      source: 'PHIVOLCS WOVODAT',
      storage: isS3Configured() ? 'AWS S3 + In-memory cache' : 'In-memory cache only',
      aiService: isBedrockConfigured() ? 'AWS Bedrock (Claude 3 Haiku)' : 'Not configured',
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
