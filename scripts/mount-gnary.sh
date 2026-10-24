#!/usr/bin/env bash
# Copy a built gnarly web dist/ into the personal site output at /gnary.
# Usage: scripts/mount-gnary.sh <gnarly-dist> <site-dist>/gnary
set -euo pipefail

src=${1:?gnarly dist directory}
dest=${2:?site dist/gnary directory}
site_root=$(dirname "$dest")

if [[ ! -f "$src/index.html" ]]; then
  echo "gnarly build has no index.html at $src" >&2
  exit 1
fi

rm -rf "$dest"
mkdir -p "$dest"
cp -a "$src"/. "$dest"/

if [[ ! -f "$dest/index.html" ]]; then
  echo "mount failed: $dest/index.html is missing" >&2
  exit 1
fi

# The companion is a static tree. GitHub Pages serves that file for /gnary/
# and only uses a root 404.html when no file matches, so the SPA fallback
# cannot replace this page.
if grep -q 'Naijei Jiang' "$dest/index.html"; then
  echo "refusing to mount: $dest/index.html is the personal site, not the gnarly companion" >&2
  exit 1
fi

if ! grep -q '/gnary/' "$dest/index.html"; then
  echo "refusing to mount: asset URLs are not under /gnary/" >&2
  exit 1
fi

# Relative links inside the mounted app must not climb into the site shell.
if grep -Eq 'href="\.\./|src="\.\./' "$dest/index.html"; then
  echo "refusing to mount: index.html links outside /gnary/" >&2
  exit 1
fi

echo "mounted $(find "$dest" -type f | wc -l) files at $dest"
if [[ -f "$site_root/404.html" ]]; then
  echo "root 404.html exists; /gnary/index.html is a real file and is not that fallback"
fi
