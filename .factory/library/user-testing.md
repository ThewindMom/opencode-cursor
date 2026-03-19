# User Testing Guide for CliCursorProxyAPI

## Testing Surface: HTTP REST API (curl)

All assertions in the foundation milestone are tested via HTTP requests to the proxy server.

### Proxy URL
- Base URL: `http://localhost:32124`
- All endpoints accept JSON request/response

### Testing Tool
- **curl** - for all HTTP testing
- No browser automation needed for foundation milestone
- No terminal automation needed for foundation milestone

### Test Commands

#### Health Check
```bash
curl -s http://localhost:32124/health
# Expected: {"status":"ok","version":"2.3.20","auth":"authenticated"}
```

#### List Models
```bash
curl -s http://localhost:32124/v1/models
# Expected: JSON with object:"list" and data array of models
```

#### Chat Completions (Streaming)
```bash
curl -s -X POST http://localhost:32124/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"auto","messages":[{"role":"user","content":"Say hello"}],"stream":true}'
# Expected: SSE stream with data: {...}\n\n format, ends with data: [DONE]
```

#### Error Cases
```bash
# Invalid JSON
curl -s -X POST http://localhost:32124/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d 'not valid json'
# Expected: 400

# Missing messages
curl -s -X POST http://localhost:32124/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"auto"}'
# Expected: 400

# Unknown model
curl -s -X POST http://localhost:32124/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"nonexistent-model","messages":[{"role":"user","content":"hi"}]}'
# Expected: 400
```

## Validation Concurrency

**Max concurrent validators**: 3

The proxy is a stateless HTTP server. Multiple curl requests can run concurrently against different endpoints without interference. The only shared state is the cursor-agent subprocess which handles its own concurrency.

## Flow Validator Guidance: HTTP API

### Isolation Rules
- Each flow validator tests assertions independently
- No shared state between validators
- cursor-agent handles authentication internally (no conflict)
- Safe to run up to 3 validators concurrently

### What to Avoid
- Do not run multiple streaming chat requests simultaneously on the same validator (hard to parse)
- Each assertion group should run its tests sequentially within the subagent

### Evidence Collection
- Save raw curl output to evidence files
- Capture HTTP status codes
- For streaming, capture first 5 lines and last 3 lines
