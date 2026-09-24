#!/bin/bash
# Instala as dependências do projeto ao iniciar uma sessão do Claude Code na web.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm ci --no-audit --no-fund
