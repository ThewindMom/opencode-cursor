# CliCursorProxyAPI

**Universal Cursor Proxy Gateway** — Standalone OpenAI-compatible proxy for Cursor Pro subscription models.

Forked from [Nomadcxx/opencode-cursor](https://github.com/Nomadcxx/opencode-cursor) with a different focus: **standalone proxy** instead of OpenCode plugin.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Port: 32124](https://img.shields.io/badge/Port-32124-32124)](#)

## What Is This?

A standalone HTTP proxy that provides OpenAI-compatible REST API access to Cursor Pro models. Works with **any** OpenAI-compatible client (curl, scripts, custom tools) without requiring OpenCode.

**This vs Nomadcxx/opencode-cursor:**

| | CliCursorProxyAPI | [Nomadcxx/opencode-cursor](https://github.com/Nomadcxx/opencode-cursor) |
|---|---|---|
| **Purpose** | Standalone proxy server | OpenCode plugin |
| **Client support** | Any OpenAI-compatible client | OpenCode only |
| **Dependencies** | None (just bun) | OpenCode + plugin system |
| **Setup complexity** | Low | Medium |

## Architecture

```
Client (curl/script/app)
        │
        ▼
┌───────────────────────┐
│   CliCursorProxyAPI    │  ← Standalone proxy on :32124
│   /v1/chat/completions│
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│    cursor-agent CLI    │  ← Handles auth, API communication
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│      Cursor API        │
└───────────────────────┘
```

## Quickstart

### 1. Build

```bash
git clone https://github.com/ThewindMom/CliCursorProxyAPI.git
cd CliCursorProxyAPI
bun install
bun run build
```

### 2. Start Proxy

```bash
bun run proxy
```

### 3. Authenticate

```bash
cursor-agent login
```

### 4. Test

```bash
curl http://localhost:32124/health
curl http://localhost:32124/v1/models
curl -X POST http://localhost:32124/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Hello"}],"stream":true}'
```

## API Endpoints

### GET /health

```bash
curl http://localhost:32124/health
# {"status":"ok","version":"2.3.20","auth":"authenticated","mcp":{...}}
```

### GET /v1/models

```bash
curl http://localhost:32124/v1/models
```

### POST /v1/chat/completions

OpenAI-compatible streaming endpoint:

```bash
curl -X POST http://localhost:32124/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
```

## Available Models

| Model | Description | Usage Pool |
|-------|-------------|------------|
| `auto` | Auto-select best model | Composer |
| `composer-2` | Composer 2 (standard) | Composer |
| `composer-2-fast` | Composer 2 Fast | Composer |
| `composer-1.5` | Composer 1.5 | Composer |
| `sonnet-4.6` | Claude Sonnet 4.6 | API |
| `opus-4.6` | Claude Opus 4.6 | API |

See `/v1/models` for full list.

## Client Integration

### curl (Verified Working)

```bash
# Health check
curl http://localhost:32124/health

# List models
curl http://localhost:32124/v1/models

# Chat completions
curl -X POST http://localhost:32124/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Hi"}],"stream":false}'
```

### OpenCode

Add to `~/.config/opencode/opencode.json`:

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
        "cursor-acp/sonnet-4.6": { "name": "Sonnet 4.6" }
      }
    }
  }
}
```

Then: `opencode run --model "cursor-acp/cursor-acp/auto" "Your prompt"`

### Claude Code

Not supported. Claude Code uses Anthropic Messages API, not OpenAI format.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 32124 | Proxy port |
| `HOST` | 127.0.0.1 | Bind address |
| `TOOL_LOOP_MAX_REPEAT` | 2 | Max tool call repeats |

## Troubleshooting

### Proxy won't start

```bash
# Check port
lsof -i :32124
# Use different port
PORT=32125 bun run proxy
```

### Authentication fails

```bash
cursor-agent login
curl http://localhost:32124/health  # should show "authenticated"
```

### Model not found

```bash
# Use bare model name (no provider prefix)
curl -d '{"model":"sonnet-4.6",...}'  # NOT "cursor-acp/sonnet-4.6"
```

## Project Structure

```
CliCursorProxyAPI/
├── src/
│   ├── proxy/
│   │   ├── server.ts           # HTTP server
│   │   ├── handler.ts          # Request routing
│   │   └── standalone-server.ts # Standalone entry point
│   ├── streaming/
│   │   ├── parser.ts           # NDJSON → SSE conversion
│   │   ├── line-buffer.ts      # Line buffering
│   │   └── delta-tracker.ts    # Delta tracking
│   ├── auth.ts                 # Authentication
│   └── models/
│       └── sync.ts             # Model list sync
├── docs/
│   ├── OPENCODE.md             # OpenCode integration
│   └── FACTORY-DROID.md        # Factory Droid integration
├── tests/                      # Test suite
└── package.json
```

## What We Added (vs Nomadcxx/opencode-cursor)

- **Standalone proxy** — Runs independently, no OpenCode required
- **Minimal API** — Only essential endpoints (health, models, chat)
- **Clean build** — Fixed TypeScript errors, proper error handling
- **No plugin dependency** — Works with any OpenAI-compatible client
- **Factory Droid support** — Service manifest for agent orchestration

## Comparison with Alternatives

| Feature | CliCursorProxyAPI | Nomadcxx/opencode-cursor |
|---------|------------------|--------------------------|
| Architecture | Standalone proxy | OpenCode plugin |
| Platform | Any | OpenCode only |
| Streaming | SSE | SSE |
| Tool calling | Via cursor-agent | Via cursor-agent |
| MCP bridge | Not implemented | Via mcptool |

## License

ISC
