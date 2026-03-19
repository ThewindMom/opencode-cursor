# User Testing Knowledge - CliCursorProxyAPI

## Testing Surface: cursor-proxy (standalone proxy server)

### URLs & Ports
- Proxy server: `http://localhost:32124`
- Health: `http://localhost:32124/health`
- Models: `http://localhost:32124/v1/models`
- Chat completions: `http://localhost:32124/v1/chat/completions`

### Service Management
```bash
# Start
cd /Users/thewindmom/Developer/01_Random_Coding/opencode-cursor && bun run proxy

# Stop
pkill -f "bun run proxy" || pkill -f "standalone-server" || true

# Health check
curl -sf http://localhost:32124/health
```

### Cursor-Agent Auth State
- `cursor-agent status` returns "Not logged in" or "✓ Logged in as..."
- `cursor-agent models` lists available models (requires auth)
- `cursor-agent login` starts OAuth flow

**Important:** cursor-agent stores tokens internally, NOT in ~/.cursor/ files. The cli-config.json file only contains user settings (permissions, editor, model preferences) - NO access tokens.

### Validation Concurrency
- Max concurrent validators: 1 (single proxy server, shared cursor-agent process)
- All assertions should be tested serially against the same proxy instance

### Key Findings
1. **Auth detection**: `verifyCursorAuth()` uses `cursor-agent status` command (not file-based). Returns true only when cursor-agent is logged in.
2. **Model validation order**: Model validation happens BEFORE auth check. Unknown models return HTTP 400 before auth is checked.
3. **cli-config.json**: Does NOT contain access tokens - only user settings.
4. **cursor-agent internal storage**: Tokens stored internally by cursor-agent, not accessible to proxy.

### Blocked Assertions
- **VAL-PROXY-005**: Cannot test 401 for missing auth without a known-valid model (requires authenticated cursor-agent to establish valid model list)
- **VAL-ERROR-002**: Cannot trigger quota exceeded without real API usage
- **VAL-AUTH-003**: Architectural limitation - cursor-agent tokens not in files

### Testing Without Auth
The proxy can still be tested without cursor-agent auth:
- `/health` returns auth status
- `/v1/models` returns empty list (or limited models)
- Unknown model requests return 400 with model_not_found error
