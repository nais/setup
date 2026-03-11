#!/usr/bin/env bash
set -euo pipefail

VERSION="${INPUT_VERSION:-latest}"

# Detect platform
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
Linux) OS_NAME="linux" ;;
Darwin) OS_NAME="darwin" ;;
MINGW* | MSYS* | CYGWIN*) OS_NAME="windows" ;;
*) echo "::error::Unsupported OS: $OS" && exit 1 ;;
esac

case "$ARCH" in
x86_64) ARCH_NAME="amd64" ;;
aarch64 | arm64) ARCH_NAME="arm64" ;;
*) echo "::error::Unsupported architecture: $ARCH" && exit 1 ;;
esac

FILENAME="nais-cli_${OS_NAME}_${ARCH_NAME}.tgz"
BINARY="nais"
if [[ "$OS_NAME" == "windows" ]]; then
	BINARY="nais.exe"
fi

# Resolve version via GitHub CLI
if [[ "$VERSION" == "latest" ]]; then
	TAG="$(gh release view --repo nais/cli --json tagName --jq '.tagName')"
else
	TAG="$VERSION"
fi

echo "Installing nais CLI $TAG ($FILENAME)"

# Download archive and checksums
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

gh release download "$TAG" --repo nais/cli \
	--pattern "$FILENAME" \
	--pattern "checksums.txt" \
	--dir "$TMPDIR"

# Verify checksum
EXPECTED="$(grep "$FILENAME" "$TMPDIR/checksums.txt" | awk '{print $1}')"
ACTUAL="$(sha256sum "$TMPDIR/$FILENAME" | awk '{print $1}')"

if [[ "$EXPECTED" != "$ACTUAL" ]]; then
	echo "::error::Checksum mismatch for $FILENAME: expected $EXPECTED, got $ACTUAL"
	exit 1
fi

echo "Checksum OK"

# Extract and install
tar -xzf "$TMPDIR/$FILENAME" -C "$TMPDIR"

INSTALL_DIR="$HOME/.local/bin"
mkdir -p "$INSTALL_DIR"
cp "$TMPDIR/$BINARY" "$INSTALL_DIR/$BINARY"
chmod 755 "$INSTALL_DIR/$BINARY"

echo "$INSTALL_DIR" >>"$GITHUB_PATH"
echo "Installed nais $TAG to $INSTALL_DIR/$BINARY"
