import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { Volcano } from '@/types/hazard'

// Initialize S3 client with conditional credential configuration
// For local development: Use explicit credentials if available
// For production (Amplify): Use default credential chain (IAM role)
const createS3Client = () => {
  const region = process.env.PH_HAZARD_S3_REGION || process.env.AWS_REGION || process.env.S3_REGION || 'ap-southeast-1'
  
  // Debug logging for Amplify deployment
  console.log('🔍 S3 Configuration Debug:')
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`)
  console.log(`  - Region: ${region}`)
  console.log(`  - PH_HAZARD_S3_REGION: ${process.env.PH_HAZARD_S3_REGION}`)
  console.log(`  - AWS_REGION: ${process.env.AWS_REGION}`)
  console.log(`  - S3_REGION: ${process.env.S3_REGION}`)
  console.log(`  - PH_HAZARD_S3_BUCKET_NAME: ${process.env.PH_HAZARD_S3_BUCKET_NAME}`)
  console.log(`  - S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME}`)
  console.log(`  - AWS_S3_BUCKET_NAME: ${process.env.AWS_S3_BUCKET_NAME}`)
  
  // Check if we have explicit credentials (for local development)
  // Support multiple credential formats: PH_HAZARD_S3_*, AWS_*, and S3_*
  const hasExplicitCredentials = !!(
    (process.env.PH_HAZARD_S3_ACCESS_KEY_ID && process.env.PH_HAZARD_S3_SECRET_ACCESS_KEY) ||
    (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ||
    (process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY)
  )
  
  console.log(`  - Has explicit credentials: ${hasExplicitCredentials}`)
  
  if (hasExplicitCredentials) {
    console.log('🔑 Using explicit S3 credentials for local development')
    
    // Use credentials in priority order: PH_HAZARD_S3_* > AWS_* > S3_*
    const accessKeyId = process.env.PH_HAZARD_S3_ACCESS_KEY_ID || 
                       process.env.AWS_ACCESS_KEY_ID || 
                       process.env.S3_ACCESS_KEY_ID!
    const secretAccessKey = process.env.PH_HAZARD_S3_SECRET_ACCESS_KEY || 
                           process.env.AWS_SECRET_ACCESS_KEY || 
                           process.env.S3_SECRET_ACCESS_KEY!
    
    return new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    })
  } else {
    console.log('🏷️ Using default credential chain (IAM role for Amplify)')
    return new S3Client({
      region
      // No explicit credentials - uses default credential chain
    })
  }
}

const s3Client = createS3Client()

const BUCKET_NAME = process.env.PH_HAZARD_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME
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
  console.log('🔍 Attempting to get volcano data from S3...')
  console.log(`  - Bucket: ${BUCKET_NAME}`)
  console.log(`  - Key: ${OBJECT_KEY}`)
  
  if (!BUCKET_NAME) {
    console.log('⚠️ S3 bucket name not configured, skipping S3 retrieval')
    return null
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: OBJECT_KEY
    })

    console.log('📡 Sending GetObject command to S3...')
    const response = await s3Client.send(command)
    console.log('✅ S3 GetObject command successful')
    
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
 * Returns true if we have the necessary configuration for S3 access
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
  
  // Check if we have credentials (either explicit or via IAM role)
  const hasExplicitCredentials = !!(
    (process.env.PH_HAZARD_S3_ACCESS_KEY_ID && process.env.PH_HAZARD_S3_SECRET_ACCESS_KEY) ||
    (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ||
    (process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY)
  )
  
  // For local development: need explicit credentials
  // For Amplify deployment: IAM role provides credentials automatically
  const isLocalDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  
  console.log('🔍 S3 Configuration Check:')
  console.log(`  - Bucket configured: ${bucketConfigured} (${BUCKET_NAME})`)
  console.log(`  - Region configured: ${regionConfigured}`)
  console.log(`  - Has explicit credentials: ${hasExplicitCredentials}`)
  console.log(`  - Is local development: ${isLocalDevelopment}`)
  
  if (isLocalDevelopment) {
    // In local development, we need explicit credentials
    const result = bucketConfigured && regionConfigured && hasExplicitCredentials
    console.log(`  - Local development result: ${result}`)
    return result
  } else {
    // In production (Amplify), IAM role provides credentials
    const result = bucketConfigured && regionConfigured
    console.log(`  - Production result: ${result}`)
    return result
  }
}
