#!/usr/bin/env bash
# Resize + recompress oversized images in place, so committed screenshots
# don't ship at raw Retina resolution. Requires ImageMagick (`magick`).
#
# Usage: scripts/optimize-images.sh [path] [--max-width PX] [--max-size KB] [--dry-run]
#   path        Directory to scan recursively (default: public/img)
#   --max-width Images wider than this are downscaled to it (default: 1200)
#   --max-size  Images within the width limit but larger than this are
#               recompressed losslessly (JPEG at quality 82) (default: 300)
#   --dry-run   Report what would change without writing any files
#
# Filenames and extensions are never changed, so nothing in _data/ needs to
# be updated. A file is only overwritten if the result is smaller, so
# re-running this is safe.

set -euo pipefail

TARGET_DIR="public/img"
MAX_WIDTH=1200
MAX_SIZE_KB=300
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --max-width)
      MAX_WIDTH="$2"
      shift 2
      ;;
    --max-size)
      MAX_SIZE_KB="$2"
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

human() {
  numfmt --to=iec --suffix=B "$1" 2>/dev/null || echo "${1}B"
}

total_before=0
total_after=0
changed=0
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT

while IFS= read -r -d '' file; do
  width=$(magick identify -format "%w" "$file[0]")
  size_before=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")

  too_wide=$(( width > MAX_WIDTH ))
  too_big=$(( size_before > MAX_SIZE_KB * 1024 ))
  if (( ! too_wide && ! too_big )); then
    continue
  fi

  ext="${file##*.}"
  ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
  case "$ext_lower" in
    png|jpg|jpeg) ;;
    *) continue ;;
  esac

  if (( too_wide )); then
    resize_args=(-resize "${MAX_WIDTH}x")
    action="resize (${width}px -> ${MAX_WIDTH}px)"
  else
    resize_args=()
    action="recompress"
  fi

  if [[ "$DRY_RUN" -eq 1 ]]; then
    changed=$((changed + 1))
    total_before=$((total_before + size_before))
    total_after=$((total_after + size_before)) # unknown until run; assume no change for the dry-run total
    echo "would ${action}: $file (currently $(human "$size_before"))"
    continue
  fi

  case "$ext_lower" in
    png)
      magick "$file" ${resize_args[@]+"${resize_args[@]}"} -strip \
        -define png:compression-level=9 -define png:compression-filter=5 \
        "png:$tmp"
      ;;
    *)
      magick "$file" ${resize_args[@]+"${resize_args[@]}"} -strip -quality 82 "jpg:$tmp"
      ;;
  esac

  size_after=$(stat -f%z "$tmp" 2>/dev/null || stat -c%s "$tmp")
  # A resize always applies; a recompress is kept only if it helps.
  if (( ! too_wide && size_after >= size_before )); then
    continue
  fi

  cp "$tmp" "$file"
  changed=$((changed + 1))
  total_before=$((total_before + size_before))
  total_after=$((total_after + size_after))

  pct=$(( (size_before - size_after) * 100 / size_before ))
  echo "done ${action}: $file (-${pct}%)"
done < <(find "$TARGET_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -print0)

echo ""
if [[ "$changed" -eq 0 ]]; then
  echo "No images wider than ${MAX_WIDTH}px or larger than ${MAX_SIZE_KB}KB can be shrunk - nothing to do."
  exit 0
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "$changed image(s) would be changed (dry run - sizes above are pre-change only)."
else
  saved=$((total_before - total_after))
  pct_total=$(( saved * 100 / total_before ))
  echo "Optimized $changed image(s): $(human "$total_before") -> $(human "$total_after") (-${pct_total}%)"
fi
