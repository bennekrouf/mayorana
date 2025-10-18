#!/bin/sh

# Base content directory (relative to your current location)
CONTENT_DIR="./content"

# Collect all French filenames (base names only) across all fr subdirs
temp_fr_list=$(mktemp)
for fr_sub in blog queue drafts; do
  fr_dir="$CONTENT_DIR/fr/$fr_sub"
  if [ -d "$fr_dir" ]; then
    for f in "$fr_dir"/*.md; do
      [ -f "$f" ] && basename "$f" >>"$temp_fr_list"
    done
  fi
done

# Sort and deduplicate (in case same file appears in multiple fr folders)
sort -u "$temp_fr_list" -o "$temp_fr_list"

echo "📝 English posts with NO French translation anywhere:"
echo "--------------------------------------------------"

missing_count=0

# Scan all English subdirs
for en_sub in blog queue drafts; do
  en_dir="$CONTENT_DIR/en/$en_sub"
  if [ -d "$en_dir" ]; then
    for en_file in "$en_dir"/*.md; do
      [ -f "$en_file" ] || continue
      base=$(basename "$en_file")
      if ! grep -Fxq "$base" "$temp_fr_list"; then
        echo "📄 $base  →  en/$en_sub/"
        missing_count=$((missing_count + 1))
      fi
    done
  fi
done

if [ "$missing_count" -eq 0 ]; then
  echo "(All English posts have a French version somewhere!)"
else
  echo
  echo "✅ Found $missing_count post(s) needing translation."
fi

# Cleanup
rm -f "$temp_fr_list"
