import { NextResponse } from 'next/server'
import { getVolcanoesFromCache } from '@/lib/storage/cache'
import { getVolcanoDataFromS3, isS3Configured } from '@/lib/storage/s3'
import { isBedrockConfigured } from '@/lib/services/bedrock'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check cache
    const cacheData = getVolcanoesFromCache()
    
    // Check S3
    let s3Data = null
    if (isS3Configured()) {
      try {
        s3Data = await getVolcanoDataFromS3()
      } catch (error) {
        s3Data = { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // Check Bedrock configuration
    const bedrockConfigured = isBedrockConfigured()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      cache: {
        count: cacheData?.length || 0,
        hasData: !!cacheData,
        sampleVolcano: cacheData?.[0]?.name || null
      },
      s3: {
        configured: isS3Configured(),
        hasData: !!s3Data?.data,
        count: s3Data?.data?.length || 0,
        error: (s3Data && 'error' in s3Data) ? s3Data.error : null,
        sampleVolcano: s3Data?.data?.[0]?.name || null
      },
      bedrock: {
        configured: bedrockConfigured,
        region: process.env.AWS_REGION || process.env.S3_REGION || 'not set',
        hasAccessKey: !!process.env.S3_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.S3_SECRET_ACCESS_KEY
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
