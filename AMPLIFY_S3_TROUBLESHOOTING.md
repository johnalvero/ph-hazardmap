# AWS Amplify S3 Troubleshooting Guide

## 🔍 **Debugging Steps**

### **1. Check Environment Variables in Amplify**

Go to your Amplify Console → App Settings → Environment Variables and verify:

```
S3_BUCKET_NAME=your-bucket-name
S3_REGION=ap-southeast-1
```

**Important**: Do NOT set any `*_ACCESS_KEY_ID` or `*_SECRET_ACCESS_KEY` variables in Amplify - these will override the IAM role.

### **2. Test the Debug Endpoint**

After deploying, visit: `https://your-app.amplifyapp.com/api/debug-s3`

This will show you:
- All environment variables
- S3 configuration status
- Specific recommendations

### **3. Check IAM Role Permissions**

Your Amplify compute role needs these permissions:

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
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name"
        }
    ]
}
```

### **4. Verify S3 Bucket Exists**

```bash
aws s3 ls s3://your-bucket-name
```

### **5. Check Amplify Function Logs**

1. Go to Amplify Console → Functions
2. Click on your function (e.g., `/api/volcanoes`)
3. View CloudWatch logs for errors

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Could not load credentials from any providers"**

**Cause**: IAM role not properly attached or permissions insufficient

**Solution**:
1. Verify IAM role is attached to Amplify app
2. Check role has S3 permissions
3. Ensure no explicit credentials are set in environment variables

### **Issue 2: "S3 not configured"**

**Cause**: Missing environment variables

**Solution**:
1. Set `S3_BUCKET_NAME` in Amplify environment variables
2. Set `S3_REGION` in Amplify environment variables
3. Redeploy the app

### **Issue 3: "Access Denied"**

**Cause**: IAM role lacks S3 permissions

**Solution**:
1. Update IAM role policy with S3 permissions
2. Ensure bucket name in policy matches your bucket
3. Wait 5-10 minutes for permissions to propagate

### **Issue 4: "NoSuchBucket"**

**Cause**: Bucket doesn't exist or wrong name

**Solution**:
1. Verify bucket exists: `aws s3 ls s3://your-bucket-name`
2. Check bucket name in environment variables
3. Ensure bucket is in the correct region

## 🔧 **Step-by-Step Fix**

### **Step 1: Verify Environment Variables**

In Amplify Console, ensure you have:
```
S3_BUCKET_NAME=ph-hazard
S3_REGION=ap-southeast-1
```

### **Step 2: Check IAM Role**

1. Go to IAM Console
2. Find your Amplify compute role
3. Verify it has the S3 policy attached
4. Ensure the bucket ARN in the policy matches your bucket

### **Step 3: Test S3 Access**

```bash
# Test if the role can access S3
aws sts get-caller-identity
aws s3 ls s3://ph-hazard
```

### **Step 4: Deploy and Test**

1. Redeploy your Amplify app
2. Visit `/api/debug-s3` to check configuration
3. Test `/api/volcanoes` endpoint

## 📊 **Expected Debug Output**

When working correctly, `/api/debug-s3` should show:

```json
{
  "s3Configured": true,
  "awsCredentials": {
    "hasExplicitCredentials": false,
    "isLocalDevelopment": false
  },
  "envVars": {
    "S3_BUCKET_NAME": "ph-hazard",
    "S3_REGION": "ap-southeast-1",
    "NODE_ENV": "production"
  },
  "recommendations": [
    "Using IAM role for production (Amplify)"
  ]
}
```

## 🆘 **If Still Not Working**

1. **Check CloudWatch Logs**: Look for detailed error messages
2. **Test IAM Role**: Use AWS CLI with the same role
3. **Verify Bucket**: Ensure bucket exists and is accessible
4. **Contact Support**: If all else fails, check AWS support

## 🔄 **Quick Fix Commands**

```bash
# Check if bucket exists
aws s3 ls s3://ph-hazard

# Test role permissions
aws sts get-caller-identity

# List objects in bucket
aws s3 ls s3://ph-hazard/volcano-data/

# Check Amplify app environment variables
aws amplify get-app --app-id YOUR_APP_ID
```
