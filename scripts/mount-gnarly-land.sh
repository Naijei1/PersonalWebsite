#!/usr/bin/env bash
# Copy the gnarly-land Vite build into the personal site output at /gnarly-land.
# Usage: scripts/mount-gnarly-land.sh <gnarly-land-dist> <site-dist>/gnarly-land
# This does not read or write dist/gnarly, and it does not touch Cognito settings.
set -euo pipefail

src=${1:?gnarly-land dist directory}
dest=${2:?site dist/gnarly-land directory}
site_root=$(dirname "$dest")

if [[ ! -f "$src/index.html" ]]; then
  echo "gnarly-land build has no index.html at $src" >&2
  exit 1
fi

rm -rf "$dest"
mkdir -p "$dest"
cp -a "$src"/. "$dest"/

if [[ ! -f "$dest/index.html" ]]; then
  echo "mount failed: $dest/index.html is missing" >&2
  exit 1
fi

if grep -q 'Backend & Systems' "$dest/index.html"; then
  echo "refusing to mount: $dest/index.html is the personal site, not the landing page" >&2
  exit 1
fi

if ! grep -q '/gnarly-land/' "$dest/index.html"; then
  echo "refusing to mount: asset URLs are not under /gnarly-land/" >&2
  exit 1
fi

if grep -Eq 'href="\.\./|src="\.\./' "$dest/index.html"; then
  echo "refusing to mount: index.html links outside /gnarly-land/" >&2
  exit 1
fi

echo "mounted $(find "$dest" -type f | wc -l) files at $dest"
if [[ -f "$site_root/404.html" ]]; then
  echo "root 404.html exists; /gnarly-land/index.html is a real file and is not that fallback"
fi
