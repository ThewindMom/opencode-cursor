#!/bin/bash
# Initialize CliCursorProxyAPI development environment

set -e

echo "Initializing CliCursorProxyAPI environment..."

# Check for Bun
if ! command -v bun &> /dev/null; then
    echo "Error: Bun is required but not installed."
    echo "Install: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Check for cursor-agent
if ! command -v cursor-agent &> /dev/null; then
    echo "Warning: cursor-agent not found. Install from https://cursor.com/install"
fi

# Install dependencies
bun install

# Build
bun run build

echo "Environment ready!"
echo ""
echo "To start the proxy: bun run proxy"
echo "To run tests: bun test"
echo "To lint: bun lint"
