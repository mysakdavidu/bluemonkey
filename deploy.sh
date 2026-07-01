#!/usr/bin/env bash
# Sestaví web (Tailwind + Zola) a nasadí obsah public/ přes rsync
# do produkčního volume (/srv/data/bluemonkey → httpd kontejner).
#
# Konfigurace serveru se čte z .env (gitignorováno) nebo z prostředí:
#   DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH, DEPLOY_PORT (volitelné, default 22)
#
# Použití:
#   ./deploy.sh            # build + nasazení
#   ./deploy.sh --dry-run  # jen náhled, co by rsync udělal (nic nezmění)

set -euo pipefail
cd "$(dirname "$0")"

# Načti lokální konfiguraci, pokud existuje
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  source .env
fi

: "${DEPLOY_USER:?Chybí DEPLOY_USER (nastav v .env — viz .env.example)}"
: "${DEPLOY_HOST:?Chybí DEPLOY_HOST (nastav v .env — viz .env.example)}"
: "${DEPLOY_PATH:?Chybí DEPLOY_PATH (nastav v .env — viz .env.example)}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"

DRY_RUN=""
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN="--dry-run"
  echo "▶ DRY-RUN: nic se nezmění, jen náhled."
fi

echo "▶ 1/3  Tailwind CSS…"
npm run build:css

echo "▶ 2/3  Zola build…"
zola build

echo "▶ 3/3  rsync → ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH%/}/"
# Lomítko za public/ = kopíruje se OBSAH složky do kořene webu.
# --delete odstraní na serveru soubory, které web už neobsahuje.
rsync -avz --delete ${DRY_RUN} \
  -e "ssh -p ${DEPLOY_PORT}" \
  public/ "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH%/}/"

echo "✅ Hotovo — httpd servíruje novou verzi okamžitě (bez restartu)."
