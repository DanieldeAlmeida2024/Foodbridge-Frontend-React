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
      mv -- "$BACKUP" "$TARGET" || echo "ERRO CRITICO: restaurar $BACKUP manualmente" >&2
      sudo -n restorecon -RF "$TARGET" || true
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
DEPLOY_OK=1
echo "DEPLOY FRONTEND: PASS commit=$COMMIT backup=$BACKUP"
