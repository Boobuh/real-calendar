#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY_DIR="$ROOT/desktop/.keys"
PRIVATE_KEY="$KEY_DIR/updater.key"
PUBLIC_KEY="$PRIVATE_KEY.pub"

mkdir -p "$KEY_DIR"

if [[ -f "$PRIVATE_KEY" && "${1:-}" != "--force" ]]; then
  echo "Keys already exist at $KEY_DIR (use --force to regenerate)."
else
  echo "Generating updater signing keys in $KEY_DIR ..."
  (
    cd "$ROOT/desktop"
    CI=true npx tauri signer generate -w "$PRIVATE_KEY" -f -p ""
  )
fi

echo
echo "Public key (already in desktop/src-tauri/tauri.release.conf.json if you used the repo default):"
cat "$PUBLIC_KEY"
echo
echo "Add the private key to GitHub → Settings → Secrets → Actions:"
echo "  Name: TAURI_SIGNING_PRIVATE_KEY"
echo "  Value: contents of $PRIVATE_KEY"
echo
echo "Used by desktop-release.yml for signed updater artifacts on GitHub Releases."
echo
echo "Optional local builds:"
echo "  export TAURI_SIGNING_PRIVATE_KEY=\"\$(cat '$PRIVATE_KEY')\""
echo
echo "WARNING: If you regenerate keys, update pubkey in tauri.release.conf.json and re-release."
