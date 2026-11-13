#!/usr/bin/env bash
# Publica somente o dist React/Vite aprovado no CI; preserva Nginx e versao anterior.
# Uso remoto: bash -se -- <commit-sha> <sha256-do-arquivo>
set -Eeuo pipefail
umask 077

[[ "$#" == 2 ]] || { echo "Uso: atualizar-frontend.sh <sha-git> <sha256>" >&2; exit 2; }
COMMIT="$1"
HASH="$2"
[[ "$COMMIT" =~ ^[a-f0-9]{40}$ && "$HASH" =~ ^[a-f0-9]{64}$ ]] || {
  echo "Hash/commit invalido" >&2; exit 2;
}
BASE="/opt/foodbridge/foodbridge-frontend/foodbridge-frontend"
TARGET="$BASE/dist"
ARCHIVE="/tmp/foodbridge-frontend-${COMMIT}.tar.gz"
STAGE=""
BACKUP=""
TARGET_MOVED=0
DEPLOY_OK=0

cleanup() {
  rc=$?
  trap - EXIT
  if (( rc != 0 && TARGET_MOVED == 1 )); then
    FAILED="$BASE/.dist-failed-${COMMIT}-$(date -u +%s)"
    if [[ -d "$TARGET" ]]; then
      mv -- "$TARGET" "$FAILED" || echo "ERRO: falha ao afastar versao nova" >&2
    fi
    if [[ -n "$BACKUP" && -d "$BACKUP" ]]; then
      if mv -- "$BACKUP" "$TARGET"; then
        # Restabelece leitura do Nginx caso o backup tenha modes 0700/0600.
        find "$TARGET" -type d -exec chmod 0755 {} +
        find "$TARGET" -type f -exec chmod 0644 {} +
        sudo -n restorecon -RF "$TARGET" || true
      else
        echo "ERRO CRITICO: restaurar $BACKUP manualmente" >&2
      fi
    fi
  fi
  [[ -z "$STAGE" || ! -d "$STAGE" ]] || rm -rf -- "$STAGE"
  [[ ! -f "$ARCHIVE" ]] || rm -f -- "$ARCHIVE"
  exit "$rc"
}
trap cleanup EXIT

[[ -f "$ARCHIVE" && -d "$TARGET" && -w "$BASE" ]] || {
  echo "Frontend, pacote ou permissoes ausentes; sem alteracoes" >&2; exit 1;
}
printf '%s  %s\n' "$HASH" "$ARCHIVE" | sha256sum -c --status || {
  echo "Checksum SHA-256 nao confere" >&2; exit 1;
}
sudo -n nginx -t
sudo -n systemctl is-active --quiet nginx || { echo "Nginx inativo; sem deploy" >&2; exit 1; }

# Rejeitar caminhos fora do dist e links no tar antes de extrair como usuario sem privilegios.
python3 - "$ARCHIVE" <<'PY'
import pathlib
import sys
import tarfile

with tarfile.open(sys.argv[1], "r:gz") as archive:
    found = False
    for member in archive.getmembers():
        path = pathlib.PurePosixPath(member.name)
        if path.is_absolute() or ".." in path.parts or not (member.isfile() or member.isdir()):
            raise SystemExit("Arquivo tar inseguro: entrada fora do dist ou link")
        if path.name == "index.html" and str(path) in ("index.html", "./index.html"):
            found = True
    if not found:
        raise SystemExit("index.html ausente do pacote")
PY

STAGE="$(mktemp -d "$BASE/.dist-next.XXXXXXXX")"
tar -xzf "$ARCHIVE" -C "$STAGE" --no-same-owner --no-same-permissions
test -s "$STAGE/index.html" || { echo "index.html vazio no pacote" >&2; exit 1; }
# mktemp cria o stage com mode 0700 e umask 077: Nginx nao consegue atravessar.
# dist contem apenas arquivos publicos do build Vite; normalizar modes antes do mv.
find "$STAGE" -type d -exec chmod 0755 {} +
find "$STAGE" -type f -exec chmod 0644 {} +
sudo -n restorecon -RF "$STAGE"
mkdir -p "$BASE/backups"
BACKUP="$BASE/backups/github-actions-${COMMIT}-$(date -u +%Y%m%dT%H%M%SZ)"
mv -- "$TARGET" "$BACKUP"
TARGET_MOVED=1
mv -- "$STAGE" "$TARGET"
STAGE=""
sudo -n restorecon -RF "$TARGET"
sudo -n nginx -t
test -s "$TARGET/index.html"
HTTP_LOCAL="$(curl --noproxy '*' --silent --show-error --connect-timeout 3 --max-time 15 --output /dev/null --write-out '%{http_code}' http://127.0.0.1/ || true)"
[[ "$HTTP_LOCAL" == '200' ]] || { echo "Nginx local respondeu HTTP $HTTP_LOCAL apos trocar dist; acionando rollback" >&2; exit 1; }
DEPLOY_OK=1
echo "DEPLOY FRONTEND: PASS commit=$COMMIT backup=$BACKUP HTTP_LOCAL=$HTTP_LOCAL"
