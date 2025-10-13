import { NextResponse } from 'next/server'
import { isS3Configured } from '@/lib/storage/s3'

export async function GET() {
  try {
    console.log('🔍 S3 Debug Endpoint Called')
    
    // Get all environment variables related to S3
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      PH_HAZARD_S3_BUCKET_NAME: process.env.PH_HAZARD_S3_BUCKET_NAME,
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
      AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
      PH_HAZARD_S3_REGION: process.env.PH_HAZARD_S3_REGION,
      AWS_REGION: process.env.AWS_REGION,
      S3_REGION: process.env.S3_REGION,
      PH_HAZARD_S3_ACCESS_KEY_ID: process.env.PH_HAZARD_S3_ACCESS_KEY_ID ? '***SET***' : undefined,
      PH_HAZARD_S3_SECRET_ACCESS_KEY: process.env.PH_HAZARD_S3_SECRET_ACCESS_KEY ? '***SET***' : undefined,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? '***SET***' : undefined,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? '***SET***' : undefined,
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ? '***SET***' : undefined,
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ? '***SET***' : undefined,
    }
    
    // Check S3 configuration
    const s3Configured = isS3Configured()
    
    // Get AWS credentials info (without exposing actual values)
    const awsCredentials = {
      hasExplicitCredentials: !!(
        (process.env.PH_HAZARD_S3_ACCESS_KEY_ID && process.env.PH_HAZARD_S3_SECRET_ACCESS_KEY) ||
        (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ||
        (process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY)
      ),
      isLocalDevelopment: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    }
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      s3Configured,
      awsCredentials,
      envVars,
      recommendations: [] as string[]
    }
    
    // Add recommendations based on the configuration
    if (!s3Configured) {
      if (!envVars.S3_BUCKET_NAME && !envVars.PH_HAZARD_S3_BUCKET_NAME && !envVars.AWS_S3_BUCKET_NAME) {
        debugInfo.recommendations.push('Set S3_BUCKET_NAME environment variable in Amplify')
      }
      if (!envVars.S3_REGION && !envVars.PH_HAZARD_S3_REGION && !envVars.AWS_REGION) {
        debugInfo.recommendations.push('Set S3_REGION environment variable in Amplify')
      }
      if (awsCredentials.isLocalDevelopment && !awsCredentials.hasExplicitCredentials) {
        debugInfo.recommendations.push('Set S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY for local development')
      }
    }
    
    if (awsCredentials.isLocalDevelopment && awsCredentials.hasExplicitCredentials) {
      debugInfo.recommendations.push('Using explicit credentials for local development')
    } else if (!awsCredentials.isLocalDevelopment) {
      debugInfo.recommendations.push('Using IAM role for production (Amplify)')
    }
    
    return NextResponse.json(debugInfo, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    
  } catch (error) {
    console.error('❌ Error in S3 debug endpoint:', error)
    
    return NextResponse.json({
      error: 'Failed to get S3 debug information',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
