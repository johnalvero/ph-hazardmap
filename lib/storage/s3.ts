import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { Volcano } from '@/types/hazard'

// Initialize S3 client with default credential chain
// This will automatically check for:
// 1. IAM roles (Amplify compute role)
// 2. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
// 3. Credential files (~/.aws/credentials)
const s3Client = new S3Client({
  region: process.env.PH_HAZARD_S3_REGION || process.env.AWS_REGION || 'ap-southeast-1'
  // No explicit credentials - uses default credential chain
})

const BUCKET_NAME = process.env.PH_HAZARD_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME
const OBJECT_KEY = 'volcano-data/latest.json'

interface VolcanoData {
  data: Volcano[]
  timestamp: string
  source: string
  count: number
}

/**
 * Save volcano data to S3
 */
export async function saveVolcanoDataToS3(volcanoes: Volcano[]): Promise<void> {
  if (!BUCKET_NAME) {
    throw new Error('S3 bucket name not configured. Please set PH_HAZARD_S3_BUCKET_NAME or S3_BUCKET_NAME environment variable.')
  }

  try {
    const volcanoData: VolcanoData = {
      data: volcanoes,
      timestamp: new Date().toISOString(),
      source: 'PHIVOLCS WOVODAT',
      count: volcanoes.length
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: OBJECT_KEY,
      Body: JSON.stringify(volcanoData, null, 2),
      ContentType: 'application/json',
      Metadata: {
        'last-updated': new Date().toISOString(),
        'volcano-count': volcanoes.length.toString()
      }
    })

    await s3Client.send(command)
    console.log(`✅ Saved ${volcanoes.length} volcanoes to S3: s3://${BUCKET_NAME}/${OBJECT_KEY}`)
  } catch (error) {
    console.error('❌ Error saving volcano data to S3:', error)
    
    // Provide specific error messages for common Amplify issues
    if (error instanceof Error) {
      if (error.message.includes('Access Denied')) {
        throw new Error('S3 Access Denied. Please ensure the Amplify compute role has S3 permissions for the bucket.')
      } else if (error.message.includes('NoSuchBucket')) {
        throw new Error(`S3 bucket '${BUCKET_NAME}' not found. Please check the bucket name configuration.`)
      } else if (error.message.includes('InvalidAccessKeyId')) {
        throw new Error('Invalid AWS credentials. Please check the Amplify compute role configuration.')
      }
    }
    
    throw new Error(`Failed to save volcano data to S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get volcano data from S3
 */
export async function getVolcanoDataFromS3(): Promise<VolcanoData | null> {
  if (!BUCKET_NAME) {
    console.log('⚠️ S3 bucket name not configured, skipping S3 retrieval')
    return null
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: OBJECT_KEY
    })

    const response = await s3Client.send(command)
    
    if (!response.Body) {
      console.log('📭 No volcano data found in S3')
      return null
    }

    const body = await response.Body.transformToString()
    const volcanoData: VolcanoData = JSON.parse(body)
    
    console.log(`📥 Retrieved ${volcanoData.count} volcanoes from S3 (${volcanoData.timestamp})`)
    return volcanoData
  } catch (error) {
    if (error instanceof Error && error.name === 'NoSuchKey') {
      console.log('📭 No volcano data found in S3')
      return null
    }
    
    console.error('❌ Error retrieving volcano data from S3:', error)
    
    // Provide specific error messages for common Amplify issues
    if (error instanceof Error) {
      if (error.message.includes('Access Denied')) {
        console.error('S3 Access Denied. Please ensure the Amplify compute role has S3 permissions for the bucket.')
      } else if (error.message.includes('NoSuchBucket')) {
        console.error(`S3 bucket '${BUCKET_NAME}' not found. Please check the bucket name configuration.`)
      } else if (error.message.includes('InvalidAccessKeyId')) {
        console.error('Invalid AWS credentials. Please check the Amplify compute role configuration.')
      }
    }
    
    throw new Error(`Failed to retrieve volcano data from S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if S3 is configured for use
 * In Amplify, this will return true if:
 * 1. IAM role is attached (Amplify compute role)
 * 2. Environment variables are set
 * 3. Credential files are available
 * We only need to check for bucket name and region
 */
export function isS3Configured(): boolean {
  // Check if bucket name is configured
  const bucketConfigured = !!(BUCKET_NAME)
  
  // Check if region is configured (either custom or AWS default)
  const regionConfigured = !!(
    process.env.PH_HAZARD_S3_REGION || 
    process.env.AWS_REGION || 
    process.env.S3_REGION
  )
  
  // For Amplify deployment, we only need bucket name and region
  // Credentials will be provided by the compute role
  return bucketConfigured && regionConfigured
}
