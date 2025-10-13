import { NextResponse } from 'next/server'
import { getVolcanoesFromCache, setVolcanoesInCache } from '@/lib/storage/cache'
import { getVolcanoDataFromS3, saveVolcanoDataToS3, isS3Configured } from '@/lib/storage/s3'
import { generateBatchVolcanoInsights, isBedrockConfigured } from '@/lib/services/bedrock'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Load volcano data from cache or S3
    let volcanoes = getVolcanoesFromCache()
    
    if (!volcanoes || volcanoes.length === 0) {
      // Try to load from S3
      if (isS3Configured()) {
        try {
          const s3Data = await getVolcanoDataFromS3()
          if (s3Data && s3Data.data.length > 0) {
            volcanoes = s3Data.data
          }
        } catch {
          // S3 fetch failed, continue with empty array
        }
      }
    }

    if (!volcanoes || volcanoes.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No volcano data found. Please run scraping first.',
        count: 0,
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Generate AI insights for each volcano if Bedrock is configured
    const bedrockConfigured = isBedrockConfigured()
    
    if (!bedrockConfigured) {
      return NextResponse.json({
        success: false,
        message: 'Bedrock is not configured',
        count: volcanoes.length,
        timestamp: new Date().toISOString(),
        debug: {
          hasAccessKey: !!process.env.S3_ACCESS_KEY_ID,
          hasSecretKey: !!process.env.S3_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || process.env.S3_REGION || 'not set'
        }
      }, { status: 500 })
    }

    // Generate AI insights for all volcanoes in a single batch call
    const batchResults = await generateBatchVolcanoInsights(volcanoes)
    
    // Create a new array with AI insights
    const volcanoesWithInsights = []
    let successCount = 0
    
    for (let i = 0; i < volcanoes.length; i++) {
      const volcano = volcanoes[i]
      const result = batchResults.find(r => r.name === volcano.name)
      
      if (result && result.insight) {
        const volcanoWithInsight = { ...volcano, aiInsight: result.insight }
        volcanoesWithInsights.push(volcanoWithInsight)
        successCount++
      } else {
        volcanoesWithInsights.push(volcano)
      }
    }
    
    // Replace the original volcanoes array with the one that has AI insights
    volcanoes.length = 0
    volcanoes.push(...volcanoesWithInsights)
    
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
      message: 'AI insights generated successfully',
      count: volcanoes.length,
      aiInsightsGenerated: successCount,
      timestamp: new Date().toISOString(),
      source: 'AWS Bedrock (Claude 3 Haiku)',
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

