#!/usr/bin/env bash
set -Eeuo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"
PUBLIC_URL="https://skripsihub.simas.biz.id"

log() {
  printf '[SkripsiHub] %s\n' "$1"
}

fail() {
  printf '[SkripsiHub] Error: %s\n' "$1" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 || fail "Docker tidak ditemukan."
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 tidak tersedia."
[ -f "$COMPOSE_FILE" ] || fail "$COMPOSE_FILE tidak ditemukan."
[ -f "$ENV_FILE" ] || fail "File .env tidak ditemukan. Salin .env.production.example ke .env lalu isi semua secret."

required_keys=(
  DB_ROOT_PASSWORD
  DB_PASSWORD
  JWT_SECRET
  VITE_API_URL
  CORS_ORIGINS
  CLOUDFLARE_TUNNEL_TOKEN
  SUPABASE_URL
  SUPABASE_KEY
)

for key in "${required_keys[@]}"; do
  if ! grep -Eq "^[[:space:]]*${key}[[:space:]]*=[[:space:]]*[^[:space:]].*$" "$ENV_FILE"; then
    fail "$key belum diatur di $ENV_FILE."
  fi
done

if grep -Eq '(^|=).*CHANGE_ME' "$ENV_FILE"; then
  fail "$ENV_FILE masih berisi nilai CHANGE_ME."
fi

env_value() {
  awk -F= -v key="$1" '$1 ~ "^[[:space:]]*" key "[[:space:]]*$" { sub(/^[^=]*=/, ""); gsub(/^[[:space:]\"'\'' ]+|[[:space:]\"'\'' ]+$/, ""); value=$0 } END { print value }' "$ENV_FILE"
}

db_password="$(env_value DB_PASSWORD)"
db_root_password="$(env_value DB_ROOT_PASSWORD)"
jwt_secret="$(env_value JWT_SECRET)"

[ "${#db_password}" -ge 24 ] || fail "DB_PASSWORD harus memiliki minimal 24 karakter."
[ "${#db_root_password}" -ge 24 ] || fail "DB_ROOT_PASSWORD harus memiliki minimal 24 karakter."
[ "${#jwt_secret}" -ge 32 ] || fail "JWT_SECRET harus memiliki minimal 32 karakter."

if ! grep -Eq "^[[:space:]]*VITE_API_URL[[:space:]]*=[[:space:]]*['\"]?/api['\"]?[[:space:]]*$" "$ENV_FILE"; then
  fail "VITE_API_URL harus bernilai /api agar request API tetap same-origin."
fi

if ! grep -Eq "^[[:space:]]*CORS_ORIGINS[[:space:]]*=[[:space:]]*['\"]?${PUBLIC_URL}['\"]?[[:space:]]*$" "$ENV_FILE"; then
  fail "CORS_ORIGINS harus bernilai ${PUBLIC_URL}."
fi

log "Memvalidasi konfigurasi production..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config --quiet

log "Mengunduh image production..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull

log "Menjalankan container..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans

log "Status container:"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

log "Deployment selesai: ${PUBLIC_URL}"
log "Jika tunnel belum aktif, periksa: docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs cloudflared"
