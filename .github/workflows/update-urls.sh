#!/bin/bash

# Script to update Amplify app URLs in GitHub Actions workflows
# Usage: ./update-urls.sh <production-url> [staging-url] [development-url]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if at least production URL is provided
if [ $# -lt 1 ]; then
    print_error "Usage: $0 <production-url> [staging-url] [development-url]"
    print_error "Example: $0 https://my-app.amplifyapp.com https://my-staging.amplifyapp.com https://my-dev.amplifyapp.com"
    exit 1
fi

PRODUCTION_URL="$1"
STAGING_URL="${2:-$PRODUCTION_URL}"
DEVELOPMENT_URL="${3:-$PRODUCTION_URL}"

print_status "Updating GitHub Actions workflow URLs..."
print_status "Production: $PRODUCTION_URL"
print_status "Staging: $STAGING_URL"
print_status "Development: $DEVELOPMENT_URL"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# List of workflow files to update
WORKFLOW_FILES=(
    "scrape-volcano-data.yml"
    "volcano-monitoring.yml"
    "test-volcano-scraper.yml"
)

# Function to update URLs in a file
update_urls_in_file() {
    local file="$1"
    local temp_file=$(mktemp)
    
    print_status "Updating $file..."
    
    # Replace placeholder URLs with actual URLs
    sed -e "s|https://your-amplify-app\.amplifyapp\.com|$PRODUCTION_URL|g" \
        -e "s|https://your-staging-app\.amplifyapp\.com|$STAGING_URL|g" \
        -e "s|https://your-dev-app\.amplifyapp\.com|$DEVELOPMENT_URL|g" \
        "$file" > "$temp_file"
    
    # Check if any changes were made
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        print_success "Updated $file"
    else
        rm "$temp_file"
        print_warning "No changes needed in $file"
    fi
}

# Update each workflow file
for file in "${WORKFLOW_FILES[@]}"; do
    file_path="$SCRIPT_DIR/$file"
    if [ -f "$file_path" ]; then
        update_urls_in_file "$file_path"
    else
        print_error "File not found: $file_path"
    fi
done

# Update config.yml if it exists
config_file="$SCRIPT_DIR/config.yml"
if [ -f "$config_file" ]; then
    print_status "Updating config.yml..."
    
    # Create a temporary file for the updated config
    temp_config=$(mktemp)
    
    # Update the URLs in config.yml
    sed -e "s|url: \"https://your-amplify-app\.amplifyapp\.com\"|url: \"$PRODUCTION_URL\"|g" \
        -e "s|url: \"https://your-staging-app\.amplifyapp\.com\"|url: \"$STAGING_URL\"|g" \
        -e "s|url: \"https://your-dev-app\.amplifyapp\.com\"|url: \"$DEVELOPMENT_URL\"|g" \
        "$config_file" > "$temp_config"
    
    if ! cmp -s "$config_file" "$temp_config"; then
        mv "$temp_config" "$config_file"
        print_success "Updated config.yml"
    else
        rm "$temp_config"
        print_warning "No changes needed in config.yml"
    fi
fi

print_success "All workflow files have been updated!"
print_status "Next steps:"
print_status "1. Review the changes: git diff"
print_status "2. Commit the changes: git add . && git commit -m 'Update workflow URLs'"
print_status "3. Push to repository: git push"
print_status "4. Test the workflows in GitHub Actions"

# Show a summary of changes
print_status "Summary of changes:"
echo "  - Production URL: $PRODUCTION_URL"
echo "  - Staging URL: $STAGING_URL"
echo "  - Development URL: $DEVELOPMENT_URL"
echo "  - Files updated: ${#WORKFLOW_FILES[@]} workflow files + config.yml"
