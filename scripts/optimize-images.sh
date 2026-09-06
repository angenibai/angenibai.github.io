#!/usr/bin/env bash
# Resize + recompress oversized images in place, so committed screenshots
# don't ship at raw Retina resolution. Requires ImageMagick (`magick`).
#
# Usage: scripts/optimize-images.sh [path] [--max-width PX] [--dry-run]
#   path        Directory to scan recursively (default: public/img)
#   --max-width Images wider than this are downscaled to it (default: 1600)
#   --dry-run   Report what would change without writing any files
#
# Filenames and extensions are never changed, so nothing in _data/ needs to
# be updated. Already-small images are skipped, so re-running this is safe.

set -euo pipefail

TARGET_DIR="public/img"
MAX_WIDTH=1600
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --max-width)
      MAX_WIDTH="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    *)
      TARGET_DIR="$1"
      shift
      ;;
  esac
done

if ! command -v magick >/dev/null 2>&1; then
  echo "error: ImageMagick's 'magick' command is required (brew install imagemagick)" >&2
  exit 1
fi

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "error: '$TARGET_DIR' is not a directory" >&2
  exit 1
fi

total_before=0
total_after=0
changed=0

while IFS= read -r -d '' file; do
  width=$(magick identify -format "%w" "$file[0]")
  size_before=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")

  if (( width <= MAX_WIDTH )); then
    continue
  fi

  changed=$((changed + 1))
  total_before=$((total_before + size_before))

  ext="${file##*.}"
  ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "would resize: $file (${width}px -> ${MAX_WIDTH}px, currently $(numfmt --to=iec --suffix=B "$size_before" 2>/dev/null || echo "${size_before}B"))"
    total_after=$((total_after + size_before)) # unknown until run; assume no change for the dry-run total
    continue
  fi

  case "$ext_lower" in
    png)
      magick "$file" -resize "${MAX_WIDTH}x" -strip \
        -define png:compression-level=9 -define png:compression-filter=5 \
        "$file"
      ;;
    jpg|jpeg)
      magick "$file" -resize "${MAX_WIDTH}x" -strip -quality 82 "$file"
      ;;
    *)
      changed=$((changed - 1))
      total_before=$((total_before - size_before))
      continue
      ;;
  esac

  size_after=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
  total_after=$((total_after + size_after))

  pct=$(( (size_before - size_after) * 100 / size_before ))
  echo "resized: $file (${width}px -> ${MAX_WIDTH}px, -${pct}%)"
done < <(find "$TARGET_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -print0)

echo ""
if [[ "$changed" -eq 0 ]]; then
  echo "No images wider than ${MAX_WIDTH}px found - nothing to do."
  exit 0
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "$changed image(s) would be resized (dry run - sizes above are pre-resize only)."
else
  saved=$((total_before - total_after))
  pct_total=$(( saved * 100 / total_before ))
  echo "Resized $changed image(s): $(numfmt --to=iec --suffix=B "$total_before" 2>/dev/null || echo "${total_before}B") -> $(numfmt --to=iec --suffix=B "$total_after" 2>/dev/null || echo "${total_after}B") (-${pct_total}%)"
fi
