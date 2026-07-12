#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

if [ -f "package.json" ]; then
  echo "Installing npm dependencies..."
  npm install
  echo "npm install complete."
fi
