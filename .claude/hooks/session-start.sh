#!/bin/bash
# Installs the case-comp kit's Node libraries (exceljs, hyperformula) in Claude Code cloud sessions.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR/case-comp-kit"
npm install --no-audit --no-fund --loglevel=error
