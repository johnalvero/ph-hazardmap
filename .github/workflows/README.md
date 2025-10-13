# GitHub Actions Workflows for PH Hazard Map

This directory contains GitHub Actions workflows for automating volcano data scraping and monitoring.

## 📁 Workflow Files

### 1. `scrape-volcano-data.yml`
**Purpose**: Automatically scrape volcano data every 5 minutes

**Triggers**:
- ⏰ **Scheduled**: Every 5 minutes (`*/5 * * * *`)
- 🖱️ **Manual**: Workflow dispatch with environment selection
- 🔄 **Push**: When scraping-related files are updated

**Features**:
- Multi-environment support (production, staging, development)
- Automatic scraping trigger
- Response verification
- Health checks
- Detailed logging and summaries

### 2. `volcano-monitoring.yml`
**Purpose**: Monitor data freshness and trigger scraping when needed

**Triggers**:
- ⏰ **Scheduled**: Every 10 minutes (`*/10 * * * *`)
- 🖱️ **Manual**: Workflow dispatch with custom check interval

**Features**:
- Data freshness monitoring
- Automatic scraping trigger for stale data
- Performance monitoring
- Comprehensive reporting

### 3. `test-volcano-scraper.yml`
**Purpose**: Manual testing and debugging of the scraping system

**Triggers**:
- 🖱️ **Manual Only**: Workflow dispatch

**Features**:
- Multiple test types (full, scraping-only, api-only, s3-only)
- Environment selection
- Verbose logging option
- Comprehensive test reporting

### 4. `config.yml`
**Purpose**: Centralized configuration for all workflows

**Contains**:
- Environment URLs
- Scraping intervals
- Monitoring thresholds
- Notification settings

## 🚀 Setup Instructions

### 1. Update Configuration

Edit `.github/workflows/config.yml` and update the URLs:

```yaml
environments:
  production:
    url: "https://your-actual-amplify-app.amplifyapp.com"
  staging:
    url: "https://your-staging-app.amplifyapp.com"
  development:
    url: "https://your-dev-app.amplifyapp.com"
```

### 2. Update Workflow URLs

In each workflow file, replace the placeholder URLs:

```bash
# Find and replace in all workflow files
sed -i 's/your-amplify-app.amplifyapp.com/your-actual-app.amplifyapp.com/g' *.yml
```

### 3. Enable Workflows

1. Push the workflow files to your repository
2. Go to GitHub → Actions tab
3. Enable workflows if prompted
4. Verify workflows appear in the Actions list

### 4. Test the Setup

1. Go to Actions → "Test Volcano Scraper"
2. Click "Run workflow"
3. Select your environment and test type
4. Monitor the execution

## ⚙️ Configuration Options

### Scraping Interval

To change the scraping frequency, update the cron expression in `scrape-volcano-data.yml`:

```yaml
schedule:
  - cron: '*/5 * * * *'  # Every 5 minutes
  - cron: '*/10 * * * *' # Every 10 minutes
  - cron: '0 * * * *'    # Every hour
```

### Monitoring Frequency

To change monitoring frequency, update the cron expression in `volcano-monitoring.yml`:

```yaml
schedule:
  - cron: '*/10 * * * *' # Every 10 minutes
  - cron: '*/15 * * * *' # Every 15 minutes
```

### Data Freshness Threshold

To change when data is considered stale, update the threshold in `volcano-monitoring.yml`:

```bash
# Consider data stale if older than 30 minutes
if [ "$age_minutes" -lt 30 ]; then
```

## 📊 Monitoring and Alerts

### Workflow Status

Monitor workflow execution in:
- GitHub Actions tab
- Workflow run summaries
- Step-by-step logs

### Data Freshness

The monitoring workflow checks:
- ✅ Data age (should be < 30 minutes)
- ✅ API response times
- ✅ Application health

### Failure Handling

When workflows fail:
1. Check the error logs in GitHub Actions
2. Verify Amplify app is accessible
3. Check S3 configuration
4. Verify PHIVOLCS website accessibility

## 🔧 Troubleshooting

### Common Issues

#### 1. Workflow Not Triggering
- Check if workflows are enabled in repository settings
- Verify cron syntax is correct
- Ensure repository has recent activity

#### 2. Scraping Failures
- Verify Amplify app URL is correct
- Check if scraping endpoint is accessible
- Review Amplify function logs

#### 3. Data Not Updating
- Check S3 permissions
- Verify environment variables in Amplify
- Review scraping logs for errors

### Debug Steps

1. **Run Test Workflow**:
   ```
   Actions → Test Volcano Scraper → Run workflow
   ```

2. **Check Manual Scraping**:
   ```bash
   curl -X POST https://your-app.amplifyapp.com/api/volcanoes/scrape
   ```

3. **Verify API Response**:
   ```bash
   curl https://your-app.amplifyapp.com/api/volcanoes
   ```

## 📈 Performance Optimization

### Reduce Scraping Frequency

If you want to reduce API calls to PHIVOLCS:

1. Update cron schedule to run less frequently
2. Increase data freshness threshold
3. Implement smarter caching strategies

### Optimize Monitoring

To reduce GitHub Actions usage:

1. Increase monitoring interval
2. Use conditional monitoring (only when needed)
3. Implement local health checks

## 🔐 Security Considerations

### Repository Secrets

Consider using GitHub Secrets for sensitive configuration:

```yaml
# In workflow file
env:
  SCRAPING_URL: ${{ secrets.SCRAPING_URL }}
  API_KEY: ${{ secrets.API_KEY }}
```

### Access Control

- Limit workflow permissions to necessary actions
- Use least-privilege IAM roles
- Monitor workflow execution logs

## 📝 Customization

### Adding New Environments

1. Update `config.yml` with new environment
2. Add environment selection to workflow inputs
3. Update URL determination logic

### Adding Notifications

1. Configure Slack webhook or email settings
2. Add notification steps to workflows
3. Set up failure and success notifications

### Custom Monitoring

1. Add new monitoring checks
2. Create custom alerting logic
3. Implement custom reporting

## 📚 Related Documentation

- [AWS Amplify S3 Setup Guide](../AMPLIFY_S3_SETUP.md)
- [Volcano Scraper Documentation](../VOLCANO_SCRAPER.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cron Expression Guide](https://crontab.guru/)

## 🤝 Contributing

When modifying workflows:

1. Test changes in development environment first
2. Update documentation accordingly
3. Consider backward compatibility
4. Add appropriate error handling
5. Update configuration files if needed
