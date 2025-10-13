# AWS Amplify S3 Configuration Guide

This guide explains how to configure S3 functionality for the PH Hazard Map when deploying to AWS Amplify.

## 🔐 Credential Chain Priority

The S3 client is configured to use AWS SDK's default credential chain, which checks in this order:

1. **IAM Roles** (Amplify Compute Role) - **RECOMMENDED for Amplify**
2. **Environment Variables** (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
3. **Credential Files** (~/.aws/credentials)

## 🚀 Amplify Deployment Setup

### 1. Create S3 Bucket

```bash
# Create S3 bucket for volcano data
aws s3 mb s3://your-ph-hazard-volcano-data --region ap-southeast-1
```

### 2. Create IAM Role for Amplify

Create an IAM role with the following policy:

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
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::your-ph-hazard-volcano-data"
        }
    ]
}
```

### 3. Attach Role to Amplify App

1. Go to AWS Amplify Console
2. Select your app
3. Go to "App settings" → "General"
4. Under "Compute", attach the IAM role created above

### 4. Set Environment Variables

In Amplify Console, go to "App settings" → "Environment variables" and add:

```
PH_HAZARD_S3_BUCKET_NAME=your-ph-hazard-volcano-data
PH_HAZARD_S3_REGION=ap-southeast-1
```

**Note**: You do NOT need to set `PH_HAZARD_S3_ACCESS_KEY_ID` or `PH_HAZARD_S3_SECRET_ACCESS_KEY` when using IAM roles.

## 🔧 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PH_HAZARD_S3_BUCKET_NAME` | Yes | S3 bucket name for volcano data | `ph-hazard-volcano-data` |
| `PH_HAZARD_S3_REGION` | No | AWS region (defaults to ap-southeast-1) | `ap-southeast-1` |
| `PH_HAZARD_S3_ACCESS_KEY_ID` | No* | AWS access key (only if not using IAM role) | `AKIA...` |
| `PH_HAZARD_S3_SECRET_ACCESS_KEY` | No* | AWS secret key (only if not using IAM role) | `...` |

*Not required when using Amplify compute role

## 🧪 Testing S3 Configuration

### 1. Test Scraping Endpoint

```bash
# Trigger volcano data scraping
curl -X POST https://your-amplify-app.amplifyapp.com/api/volcanoes/scrape
```

### 2. Check S3 Bucket

```bash
# List objects in bucket
aws s3 ls s3://your-ph-hazard-volcano-data/volcano-data/

# Download and inspect data
aws s3 cp s3://your-ph-hazard-volcano-data/volcano-data/latest.json ./latest.json
```

## 🚨 Common Issues & Solutions

### Access Denied Error
```
S3 Access Denied. Please ensure the Amplify compute role has S3 permissions for the bucket.
```
**Solution**: Verify IAM role has proper S3 permissions and is attached to Amplify app.

### Bucket Not Found Error
```
S3 bucket 'bucket-name' not found. Please check the bucket name configuration.
```
**Solution**: Verify bucket name in environment variables and ensure bucket exists.

### Invalid Credentials Error
```
Invalid AWS credentials. Please check the Amplify compute role configuration.
```
**Solution**: Ensure IAM role is properly attached to Amplify app and has correct permissions.

## 📁 S3 Object Structure

The volcano data is stored in S3 with this structure:

```
s3://your-bucket/
└── volcano-data/
    └── latest.json
```

The JSON structure:
```json
{
  "data": [
    {
      "id": "vol_taal",
      "type": "volcano",
      "name": "Taal",
      "location": "Batangas, Luzon",
      "coordinates": [120.993, 14.002],
      "elevation": 311,
      "status": "advisory",
      "activityLevel": 1,
      "lastUpdate": "2024-01-15T10:30:00.000Z",
      "description": "Alert Level 1 - advisory",
      "country": "Philippines",
      "parameters": {
        "Seismic": "1 volcanic earthquake",
        "Ground Deformation": "No significant change"
      },
      "shouldNotBeAllowed": "Entry into Taal Volcano Island",
      "reminder": "People should remain vigilant",
      "bulletinUrl": "https://wovodat.phivolcs.dost.gov.ph/bulletin/activity-tvo?bid=12514&lang=en",
      "bulletinDate": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "PHIVOLCS WOVODAT",
  "count": 1
}
```

## 🔄 GitHub Actions Integration

For automated scraping, set up a GitHub Action:

```yaml
name: Scrape Volcano Data
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Scraping
        run: |
          curl -X POST ${{ secrets.AMPLIFY_SCRAPE_URL }}
```

Set `AMPLIFY_SCRAPE_URL` in GitHub repository secrets to your Amplify app's scrape endpoint.

## 🎯 Best Practices

1. **Use IAM Roles**: Always prefer IAM roles over access keys for Amplify deployments
2. **Least Privilege**: Grant only necessary S3 permissions to the compute role
3. **Environment Variables**: Use `PH_HAZARD_*` prefix to avoid conflicts with AWS Amplify reserved variables
4. **Error Handling**: The app provides detailed error messages for common S3 issues
5. **Monitoring**: Monitor S3 access logs and Amplify function logs for troubleshooting

## 🔍 Troubleshooting

### Check Amplify Function Logs
1. Go to AWS Amplify Console
2. Select your app
3. Go to "Functions" tab
4. Click on the function (e.g., `/api/volcanoes/scrape`)
5. View CloudWatch logs

### Verify IAM Role
```bash
# Check if role is attached to Amplify app
aws amplify get-app --app-id your-app-id
```

### Test S3 Access
```bash
# Test S3 access with the same role
aws sts get-caller-identity
aws s3 ls s3://your-bucket-name
```
