#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_PATH="${1:-$ROOT_DIR/config/team.yaml}"
OUTPUT_PATH="${2:-$ROOT_DIR/data/live/github-open-prs.json}"
TMP_PATH="$(mktemp)"

cleanup() {
  rm -f "$TMP_PATH"
}

run_gh_query() {
  local query="$1"
  local attempt=1

  while (( attempt <= 5 )); do
    if gh api --method GET search/issues \
      -f q="$query" \
      -f per_page=100 \
      --jq '{items: [.items[] | {created_at, draft, html_url, repository_url, title}]}' ; then
      return 0
    fi

    if (( attempt == 5 )); then
      return 1
    fi

    sleep "$attempt"
    attempt=$((attempt + 1))
  done
}

trap cleanup EXIT

mkdir -p "$(dirname "$OUTPUT_PATH")"

CONFIG_JSON="$(
  ruby -ryaml -rjson -e '
    config = YAML.load_file(ARGV[0])
    payload = {
      organization: config.dig("github", "organization"),
      engineers: config.dig("github", "engineers")
    }
    puts JSON.generate(payload)
  ' "$CONFIG_PATH"
)"

ORGANIZATION="$(printf '%s' "$CONFIG_JSON" | jq -r '.organization')"

if [[ -z "$ORGANIZATION" || "$ORGANIZATION" == "null" ]]; then
  echo "Missing github.organization in $CONFIG_PATH" >&2
  exit 1
fi

printf '{"generatedAt":%s,"organization":%s,"engineers":[]}' \
  "$(date -u +"\"%Y-%m-%dT%H:%M:%SZ\"")" \
  "$(printf '%s' "$ORGANIZATION" | ruby -rjson -e 'puts JSON.generate(STDIN.read)')" > "$TMP_PATH"

while IFS= read -r engineer_json; do
  engineer_name="$(printf '%s' "$engineer_json" | jq -r '.name')"
  engineer_login="$(printf '%s' "$engineer_json" | jq -r '.github')"

  if [[ -z "$engineer_name" || "$engineer_name" == "null" || -z "$engineer_login" || "$engineer_login" == "null" ]]; then
    echo "Skipping engineer entry with missing name or github login." >&2
    continue
  fi

  query="is:pr is:open author:${engineer_login} org:${ORGANIZATION}"
  response_json="$(run_gh_query "$query")"

  jq \
    --arg engineer "$engineer_name" \
    --arg author "$engineer_login" \
    --argjson response "$response_json" \
    '.engineers += [{engineer: $engineer, author: $author, items: $response.items}]' \
    "$TMP_PATH" > "${TMP_PATH}.next"

  mv "${TMP_PATH}.next" "$TMP_PATH"
done < <(printf '%s' "$CONFIG_JSON" | jq -c '.engineers[]')

mv "$TMP_PATH" "$OUTPUT_PATH"
trap - EXIT

echo "Saved live GitHub PR snapshot to $OUTPUT_PATH"
