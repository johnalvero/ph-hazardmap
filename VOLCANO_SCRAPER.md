# PHIVOLCS Volcano Data Scraper

## Overview

This system scrapes real-time volcano bulletin data from PHIVOLCS WOVODAT (https://wovodat.phivolcs.dost.gov.ph/bulletin/list-of-bulletin), focusing on Parameters and Recommendations sections, with AWS S3 persistent storage and in-memory caching for performance.

## Architecture

### Two-Tier Caching System

```
Request Flow:
1. Check in-memory cache (node-cache, 5 min TTL) → Return if hit
2. Check S3 storage (persistent) → Update in-memory cache → Return
3. Return empty array with metadata indicating no data available

Scrape Flow:
1. Scrape PHIVOLCS bulletins
2. Save to S3 (persistent storage)
3. Update in-memory cache (5 min TTL)
4. Return data
```

### Components

- **lib/storage/s3.ts** - AWS S3 storage functions
- **lib/data/volcanoes.ts** - Scraping logic
- **app/api/volcanoes/scrape/route.ts** - Trigger endpoint (no authentication)
- **app/api/volcanoes/route.ts** - Main API with two-tier cache

## Setup

### 1. Environment Variables

#### For Local Development

Create `.env.local` with the following variables:

```bash
# AWS S3 Configuration
PH_HAZARD_S3_ACCESS_KEY_ID=your_access_key_id
PH_HAZARD_S3_SECRET_ACCESS_KEY=your_secret_access_key
PH_HAZARD_S3_REGION=ap-southeast-1
PH_HAZARD_S3_BUCKET_NAME=your-bucket-name
```

#### For AWS Amplify Deployment

The S3 client uses AWS SDK's default credential chain, which checks in this order:

1. **IAM Roles** (Amplify Compute Role) - **RECOMMENDED**
2. **Environment Variables** (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
3. **Credential Files** (~/.aws/credentials)

For Amplify, you only need to set:

```bash
# S3 Configuration for Amplify
PH_HAZARD_S3_BUCKET_NAME=your-bucket-name
PH_HAZARD_S3_REGION=ap-southeast-1
```

**Important**: Do NOT set `PH_HAZARD_S3_ACCESS_KEY_ID` or `PH_HAZARD_S3_SECRET_ACCESS_KEY` when using Amplify compute roles, as this will override the IAM role credentials.

#### Amplify Setup Steps:

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://your-ph-hazard-volcano-data --region ap-southeast-1
   ```

2. **Create IAM Role** with S3 permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::your-ph-hazard-volcano-data/*"
       },
       {
         "Effect": "Allow",
         "Action": ["s3:ListBucket"],
         "Resource": "arn:aws:s3:::your-ph-hazard-volcano-data"
       }
     ]
   }
   ```

3. **Attach Role to Amplify App**:
   - Go to AWS Amplify Console
   - Select your app → "App settings" → "General"
   - Under "Compute", attach the IAM role

4. **Set Environment Variables** in Amplify Console:
   - `PH_HAZARD_S3_BUCKET_NAME=your-ph-hazard-volcano-data`
   - `PH_HAZARD_S3_REGION=ap-southeast-1`

See `AMPLIFY_S3_SETUP.md` for detailed Amplify configuration guide.

### 2. AWS S3 Setup

1. Create an S3 bucket in your preferred region
2. Create an IAM user with the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/volcano-data/*"
        }
    ]
}
```

3. Generate access keys for the IAM user
4. Add the credentials to your environment variables

### 3. Dependencies

The following packages are required:

```bash
npm install cheerio node-cache @aws-sdk/client-s3
npm install --save-dev @types/cheerio
```

## Usage

### Manual Scraping

Trigger scraping manually by calling the endpoint:

```bash
curl -X GET "https://your-app.com/api/volcanoes/scrape"
```

### Automated Scraping with GitHub Actions

Create `.github/workflows/scrape-volcanoes.yml`:

```yaml
name: Scrape PHIVOLCS Volcano Data
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:  # Manual trigger
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger scrape endpoint
        run: |
          curl -X GET "${{ secrets.APP_URL }}/api/volcanoes/scrape"
```

Add the following secrets to your GitHub repository:
- `APP_URL` - Your application URL (e.g., https://your-app.vercel.app)

### API Endpoints

#### GET /api/volcanoes/scrape

Triggers scraping of PHIVOLCS bulletins.

**Response:**
```json
{
  "success": true,
  "message": "Volcano data scraped successfully",
  "count": 5,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "PHIVOLCS WOVODAT",
  "storage": "AWS S3 + In-memory cache"
}
```

#### GET /api/volcanoes

Returns volcano data from cache or S3.

**Response:**
```json
{
  "volcanoes": [...],
  "metadata": {
    "source": "PHIVOLCS WOVODAT (Cached)",
    "generated": "2024-01-15T10:30:00.000Z",
    "count": 5,
    "cache": "in-memory"
  }
}
```

## Data Structure

### Volcano Interface

```typescript
interface Volcano {
  id: string
  type: 'volcano'
  name: string
  location: string
  coordinates: [number, number]
  elevation: number
  status: 'normal' | 'advisory' | 'watch' | 'warning'
  activityLevel: number
  lastUpdate: string
  description?: string
  country: string
  parameters?: { [key: string]: string | number } // NEW
  recommendations?: string // NEW
  bulletinUrl?: string // NEW
  bulletinDate?: string // NEW
}
```

### S3 Storage Format

```json
{
  "data": [...],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "PHIVOLCS WOVODAT",
  "count": 5
}
```

## Scraping Details

### Rate Limiting

- 1.5-2 second delays between requests
- Respects server resources

### User Agent

Uses browser-like User-Agent to avoid blocking:
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

### Data Extraction

The scraper extracts:
- Volcano name and alert level
- Parameters section (seismic activity, gas emissions, ground deformation, etc.)
- Recommendations/Comments section
- Bulletin date and time
- Original bulletin URL

### Error Handling

- Graceful failure for individual bulletins
- Continues processing other bulletins if one fails
- Returns empty array if no data available
- No fallback to mock data

## Monitoring

### Logs

The system provides detailed logging:
- `🔍 Fetching bulletin list page...`
- `📋 Found X bulletin links`
- `📄 Scraping bulletin: URL`
- `✅ Successfully scraped X volcanoes from PHIVOLCS`
- `☁️ Serving volcano data from S3`
- `📦 Serving volcano data from in-memory cache`

### Cache Status

The API returns cache status in metadata:
- `in-memory` - Data served from memory cache
- `s3` - Data served from S3 storage
- `none` - No data available
- `error` - Error occurred

## Troubleshooting

### Common Issues

1. **S3 Access Denied**
   - Check IAM permissions
   - Verify bucket name and region
   - Ensure credentials are correct

2. **Scraping Fails**
   - Check if PHIVOLCS website is accessible
   - Verify HTML structure hasn't changed
   - Check rate limiting isn't too aggressive

3. **No Data Returned**
   - Run scraping endpoint first
   - Check S3 bucket has data
   - Verify environment variables

### Debug Mode

Enable debug logging by checking browser console or server logs for detailed information about the scraping process.

## Implementation Considerations

1. **Rate Limiting**: 1-2 second delays between requests to avoid overwhelming the server
2. **User Agent**: Set User-Agent to mimic a normal browser (Chrome/Firefox)
3. **Caching**: Use two-tier cache to minimize requests to PHIVOLCS
4. **Error Handling**: Fail gracefully without overwhelming server
5. **Frequency**: Limit scraping to every 15-30 minutes maximum via GitHub Actions

## Security Notes

- No authentication required for scraping endpoint
- S3 credentials should be kept secure
- Consider IP whitelisting for production use
- Monitor for unusual scraping patterns
