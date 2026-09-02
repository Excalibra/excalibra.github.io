#!/usr/bin/env bash
# Featured article management tool
# - Lists all articles with featured: true (sorted by weight descending)
# - Interactively adjust weight (higher = more prominent, determines order in homepage featured section)
#
# Articles are not moved, URLs are unaffected; featured status is entirely controlled by frontmatter.
#
# Usage:
#   scripts/featured.sh            # Interactive mode: list + modify weights
#   scripts/featured.sh --list     # Only list, no interactive mode
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTENT_DIR="$ROOT_DIR/content/posts"
map_file=""  # Global: for EXIT trap to clean up after main returns

# Colors
if [[ -t 1 ]]; then
  B='\033[1m'; DIM='\033[2m'; CYAN='\033[36m'; YEL='\033[33m'; GRN='\033[32m'; RED='\033[31m'; R='\033[0m'
else
  B=''; DIM=''; CYAN=''; YEL=''; GRN=''; RED=''; R=''
fi

# Scan all .md files under content/posts, extract frontmatter fields, filter featured: true
# Output (TAB-separated): weight \t title \t date \t filepath
scan_featured() {
  find "$CONTENT_DIR" -name "*.md" -print0 | while IFS= read -r -d '' f; do
    awk -v file="$f" '
      BEGIN { in_fm=0; featured=""; weight=""; title=""; date="" }
      /^---[[:space:]]*$/ {
        in_fm++
        if (in_fm == 2) {
          if (featured == "true") {
            w = (weight == "" ? "0" : weight)
            printf "%s\t%s\t%s\t%s\n", w, title, date, file
          }
          exit
        }
        next
      }
      in_fm == 1 {
        line = $0
        sub(/^[[:space:]]+/, "", line)
        if (line ~ /^featured:/) {
          val = line; sub(/^featured:[[:space:]]*/, "", val)
          sub(/[[:space:]]*#.*$/, "", val); sub(/[[:space:]]+$/, "", val)
          featured = val
        } else if (line ~ /^weight:/) {
          val = line; sub(/^weight:[[:space:]]*/, "", val)
          sub(/[[:space:]]*#.*$/, "", val); sub(/[[:space:]]+$/, "", val)
          weight = val
        } else if (line ~ /^title:/) {
          val = line; sub(/^title:[[:space:]]*/, "", val)
          gsub(/^["'"'"']/, "", val); gsub(/["'"'"']$/, "", val)
          title = val
        } else if (line ~ /^date:/) {
          val = line; sub(/^date:[[:space:]]*/, "", val)
          sub(/[[:space:]]*#.*$/, "", val); sub(/[[:space:]]+$/, "", val)
          date = val
        }
      }
    ' "$f"
  done
}

# Render the list, and write "number:path" mappings to a temporary file for interactive queries
render_list() {
  local map_file="$1"
  : > "$map_file"
  printf "\n${B}Featured Articles${R} (sorted by weight descending, higher = more prominent)\n"
  printf "${DIM}──────────────────────────────────────────────────────────────────────${R}\n"
  printf "${B}%-4s %-6s %-12s %-40s %s${R}\n" "Num" "Weight" "Date" "Title" "Path"
  printf "${DIM}──────────────────────────────────────────────────────────────────────${R}\n"
  local idx=1
  scan_featured | sort -t$'\t' -k1,1nr | while IFS=$'\t' read -r weight title date filepath; do
    local rel="${filepath#$ROOT_DIR/}"
    # Truncate long titles
    local t="$title"; ((${#t} > 36)) && t="${t:0:35}…"
    printf "%-6s %-8s %-14s %-38s ${DIM}%s${R}\n" "[$idx]" "$weight" "${date:0:10}" "$t" "$rel"
    echo "$idx:$filepath" >> "$map_file"
    idx=$((idx + 1))
  done
  printf "${DIM}──────────────────────────────────────────────────────────────────────${R}\n"
}

# Update the weight in the frontmatter of a given file
# If the weight field does not exist, insert it after the featured: line
set_weight() {
  local filepath="$1" new_w="$2"
  if grep -qE '^[[:space:]]*weight:' "$filepath"; then
    sed -i '' -E "s/^([[:space:]]*weight:[[:space:]]*).*/\1${new_w}/" "$filepath"
  else
    # Insert weight after featured: line
    sed -i '' -E "/^[[:space:]]*featured:.*/a\\
weight: ${new_w}
" "$filepath"
  fi
}

main() {
  if [[ ! -d "$CONTENT_DIR" ]]; then
    printf "${RED}✗ Content directory does not exist: $CONTENT_DIR${R}\n" >&2
    exit 1
  fi

  map_file="$(mktemp -t featured_map.XXXXXX)"  # assign to global for trap cleanup
  trap 'rm -f "$map_file"' EXIT

  render_list "$map_file"

  # List-only mode
  if [[ "${1:-}" == "--list" ]]; then
    return 0
  fi

  # Interactive mode
  local count
  count="$(wc -l < "$map_file" | tr -d ' ')"
  if [[ "$count" == "0" ]]; then
    printf "${YEL}No articles with featured: true found.${R}\n"
    return 0
  fi

  echo
  while true; do
    printf "${CYAN}Enter number to adjust weight (1-%s), or q to quit: ${R}" "$count"
    read -r choice
    case "$choice" in
      q|Q|quit|exit) printf "${GRN}Exited.${R}\n"; break ;;
      ''|*[!0-9]*) printf "${RED}Invalid input, please enter a number or q.${R}\n"; continue ;;
    esac
    if (( choice < 1 || choice > count )); then
      printf "${RED}Number out of range (1-%s).${R}\n" "$count"
      continue
    fi
    local target
    target="$(grep "^${choice}:" "$map_file" | head -1 | cut -d: -f2-)"
    [[ -z "$target" ]] && { printf "${RED}File not found.${R}\n"; continue; }

    local cur_w
    cur_w="$(awk -v f="$target" '
      BEGIN{in_fm=0;w=""}
      /^---[[:space:]]*$/{in_fm++;if(in_fm==2)exit;next}
      in_fm==1 && /^[[:space:]]*weight:/{w=$0;sub(/^[^:]*:[[:space:]]*/,"",w);sub(/[[:space:]]*#.*$/,"",w);sub(/[[:space:]]+$/,"",w)}
    ' "$target")"
    cur_w="${cur_w:-（not set）}"
    local tname
    tname="$(awk -v f="$target" '
      BEGIN{in_fm=0;t=""}
      /^---[[:space:]]*$/{in_fm++;if(in_fm==2)exit;next}
      in_fm==1 && /^[[:space:]]*title:/{t=$0;sub(/^[^:]*:[[:space:]]*/,"",t);gsub(/^["'"'"']/,"",t);gsub(/["'"'"']$/,"",t)}
    ' "$target")"

    printf "${B}Article:${R} %s\n" "$tname"
    printf "${B}Current weight:${R} %s  ${DIM}(higher = more prominent)${R}\n" "$cur_w"
    printf "${CYAN}Enter new weight (press Enter to skip): ${R}"
    read -r new_w
    [[ -z "$new_w" ]] && { printf "${DIM}Skipped.${R}\n"; continue; }
    if [[ ! "$new_w" =~ ^[0-9]+$ ]]; then
      printf "${RED}Weight must be a non-negative integer.${R}\n"
      continue
    fi

    set_weight "$target" "$new_w"
    printf "${GRN}✓ Updated weight = %s${R}\n" "$new_w"
    printf "${DIM}%s${R}\n" "${target#$ROOT_DIR/}"

    # Refresh the list
    echo
    render_list "$map_file"
    echo
  done
}

main "$@"
