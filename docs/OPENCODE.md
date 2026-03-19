# OpenCode Integration Guide

This document describes how to configure OpenCode to use CliCursorProxyAPI as a custom provider.

## Overview

OpenCode supports custom providers via the `provider` section in `opencode.json`. CliCursorProxyAPI provides an OpenAI-compatible REST API that can be registered using `@ai-sdk/openai-compatible`.

## Prerequisites

1. **OpenCode installed**: Download from [opencode.ai](https://opencode.ai)
2. **CliCursorProxyAPI running**: `bun run proxy` in CliCursorProxyAPI directory
3. **cursor-agent authenticated**: `cursor-agent login`

## Configuration

### Step 1: Ensure Proxy is Running

```bash
cd /path/to/CliCursorProxyAPI
bun run proxy
curl http://localhost:32124/health
```

### Step 2: Configure opencode.json

Edit `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "cursor-acp": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Cursor ACP",
      "options": {
        "baseURL": "http://127.0.0.1:32124/v1"
      },
      "models": {
        "cursor-acp/auto": { "name": "Auto" },
        "cursor-acp/composer-2-fast": { "name": "Composer 2 Fast" },
        "cursor-acp/sonnet-4.6": { "name": "Sonnet 4.6" }
      }
    }
  }
}
```

### Step 3: Verify Models

```bash
opencode models cursor-acp
```

You should see the configured models listed.

## Testing

### Via curl (Direct Proxy)

```bash
curl -X POST http://localhost:32124/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Hello"}],"stream":true}'
```

### Via OpenCode

```bash
opencode run --model "cursor-acp/cursor-acp/auto" "Your prompt here"
```

## Troubleshooting

### Models Not Appearing

1. Verify the proxy is running: `curl http://localhost:32124/health`
2. Validate JSON syntax: `python3 -m json.tool ~/.config/opencode/opencode.json`
3. Restart OpenCode after config changes

### Config File Error

JSON must be valid. Common issues:
- Trailing commas are not allowed
- All strings must use double quotes

### Unknown Model Error

Use the full model name format: `cursor-acp/cursor-acp/auto`

## Notes

- OpenCode integration via config file may require the provider to also be registered via `/connect` command
- Some OpenCode versions may require additional setup or plugin installation for custom providers
