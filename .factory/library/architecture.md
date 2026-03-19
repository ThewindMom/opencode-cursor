# Architecture

## Overview

CliCursorProxyAPI is a standalone HTTP proxy that exposes Cursor Pro models via an OpenAI-compatible REST API.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CliCursorProxyAPI                          │
│                                                              │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Auth Layer  │───▶│ Proxy Server │───▶│   Tool      │  │
│  │ (cursor-    │    │ (/v1/*)     │    │   Bridge    │  │
│  │  agent)      │    └──────────────┘    └──────────────┘  │
│  └─────────────┘           │                     │           │
└─────────────────────────────┼─────────────────────┼───────────┘
                              │                     │
                              ▼                     ▼
                    ┌─────────────────┐   ┌───────────────┐
                    │  SSE Stream     │   │   mcptool    │
                    │  (OpenAI compat)│   │   CLI        │
                    └─────────────────┘   └───────────────┘
                              │                     │
                              ▼                     ▼
                    ┌─────────────────────────────────────────┐
                    │              OpenAI-Compatible Clients   │
                    │  (OpenCode, Factory Droid, oh-my-pi,   │
                    │   Claude Code, curl, etc.)               │
                    └─────────────────────────────────────────┘
```

## Components

### Proxy Server (`src/proxy/server.ts`)
- HTTP server using Bun.serve()
- Handles /health, /v1/models, /v1/chat/completions
- Port auto-selection

### Request Handler (`src/proxy/handler.ts`)
- Parses OpenAI request format
- Converts messages to cursor-agent format
- Extracts streaming parameters

### Streaming (`src/streaming/`)
- `openai-sse.ts`: Converts cursor-agent NDJSON to SSE
- `line-buffer.ts`: Parses NDJSON lines
- `parser.ts`: Stream event parsing

### Authentication (`src/auth.ts`)
- Detects auth files
- Extracts access token
- Handles token refresh

### Tool Bridge (`src/mcp/`)
- MCP server discovery
- Tool call routing
- Result formatting

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/v1/models` | GET | List available models |
| `/v1/chat/completions` | POST | Streaming chat completions |

## Data Flow

1. Client sends POST /v1/chat/completions
2. Proxy parses request, extracts auth token
3. Proxy spawns cursor-agent with stream-json output
4. cursor-agent streams NDJSON events
5. Proxy converts NDJSON to SSE
6. SSE streamed to client
7. For tool calls: client sends result, proxy forwards to cursor-agent
