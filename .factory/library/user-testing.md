# User Testing

## Testing Surfaces

### 1. curl (Universal)
- **Tool**: Standard curl command
- **Setup**: None (just needs running proxy)
- **What to test**: All endpoints work with basic HTTP

### 2. OpenCode
- **Tool**: OpenCode TUI with @ai-sdk/openai-compatible
- **Setup**: Configure opencode.json provider
- **What to test**: Model selection, chat, tool calling

### 3. Browser (optional)
- **Tool**: Browser for any web interfaces
- **Setup**: None if proxy has admin UI
- **What to test**: N/A for this project

## Validation Concurrency

- **Max concurrent validators**: 3
- **Rationale**: Resource-intensive operations (cursor-agent spawns) per validator

## Test Scenarios

### Basic Flow
1. Start proxy: `bun run proxy`
2. Health check: `curl http://localhost:32124/health`
3. List models: `curl http://localhost:32124/v1/models`
4. Chat: `curl -X POST http://localhost:32124/v1/chat/completions -d '...'`

### Auth Flow
1. Run `cursor-agent login`
2. Verify proxy accepts authenticated requests
3. Verify proxy rejects without auth

### Tool Call Flow
1. Send prompt that triggers tool use
2. Verify tool_calls appear in stream
3. Send tool result back
4. Verify continuation

## Resource Classification

| Surface | Memory/CPU | Notes |
|---------|-------------|-------|
| curl | Minimal | Just HTTP client |
| OpenCode | Medium | Full IDE integration |
| Proxy server | Low | Node.js process |
