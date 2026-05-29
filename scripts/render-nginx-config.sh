#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="${repo_root}/.env"
template_file="${repo_root}/nginx/stream.domain.de.conf"
output_file="${1:-${repo_root}/nginx/rendered/stream-site.conf}"

if [[ ! -f "${env_file}" ]]; then
  echo "Missing ${env_file}. Create it first and set STREAM_DOMAIN." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${env_file}"
set +a

: "${STREAM_DOMAIN:?STREAM_DOMAIN must be set in .env}"

mkdir -p "$(dirname "${output_file}")"
sed "s/\${STREAM_DOMAIN}/${STREAM_DOMAIN}/g" "${template_file}" > "${output_file}"

echo "Wrote ${output_file}"