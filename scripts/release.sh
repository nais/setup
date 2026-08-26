#!/bin/bash
set -euo pipefail

# Release script for GitHub Actions
# Handles creating tags and updating major version branches

# Get version from package.json
VERSION=$(jq -r '.version' package.json)
MAJOR_VERSION="v$(echo "$VERSION" | cut -d. -f1)"
TAG="v$VERSION"

echo "Published version: $VERSION"
echo "Major version: $MAJOR_VERSION"
echo "Tag: $TAG"

# Check if this is a prerelease version (contains alpha, beta, rc, or has more than 3 parts)
if [[ "$VERSION" =~ (alpha|beta|rc) ]] || [[ $(echo "$VERSION" | tr '.' '\n' | wc -l) -gt 3 ]]; then
  echo "🔖 Prerelease detected - only creating tag, skipping major version branch update"
  IS_PRERELEASE=true
else
  echo "🚀 Stable release detected - will update major version branch"
  IS_PRERELEASE=false
fi

# Configure git
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

# Commit built files
echo "Adding dist files to git..."
git add -f dist/
git add .

if git diff --staged --quiet; then
  echo "ℹ️ No changes to commit (dist already up to date)"
else
  git commit -m "build: add compiled dist for release"
  echo "✅ Committed built files"
fi

# For stable releases, create/update the major version branch
if [ "$IS_PRERELEASE" = false ]; then
  echo "Updating major version branch $MAJOR_VERSION"

  # Create/update the major version branch
  git checkout -B "$MAJOR_VERSION"

  # Push the release branch
  git push origin "$MAJOR_VERSION" --force

  echo "✅ Updated release branch $MAJOR_VERSION"
fi

pnpm changeset git-tag

echo "✅ Created tag $TAG"
