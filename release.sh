#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"

if [[ -z "$VERSION" ]]; then
  echo "Usage: $0 <version> (e.g. v1.2.3)"
  exit 1
fi

if [[ ! "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+ ]]; then
  echo "Version must match vMAJOR.MINOR.PATCH (got: $VERSION)"
  exit 1
fi

MAJOR="v$(echo "$VERSION" | cut -d. -f1 | tr -d v)"

git tag -fa "$VERSION" -m "Release $VERSION"
git push origin "$VERSION"

if [[ "$VERSION" =~ [-] ]]; then
  echo "Pre-release: skipping $MAJOR branch update"
else
  git push origin "HEAD:$MAJOR" --force
  echo "Updated $MAJOR branch"
fi

echo "Released $VERSION"
