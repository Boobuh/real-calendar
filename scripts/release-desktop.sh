#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  echo "Usage: $0 VERSION" >&2
  echo "Example: $0 2.0.0   → tags desktop-v2.0.0 and pushes" >&2
  exit 1
fi

TAG="desktop-v${VERSION}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Tag $TAG already exists locally." >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree has uncommitted changes. Commit or stash first." >&2
  exit 1
fi

git tag "$TAG"
git push origin "$TAG"

echo "Pushed $TAG — CI will build a draft GitHub Release with Windows/macOS/Linux installers."
echo "Publish when ready: https://github.com/Boobuh/real-calendar/releases"
