# Factory Droid Integration Guide

This guide describes how CliCursorProxyAPI can be used with Factory Droid via the `.factory/services.yaml` manifest.

## Overview

Factory Droid uses a declarative manifest (`.factory/services.yaml`) to manage services. You can add CliCursorProxyAPI as a managed service to:

- Automatically start the proxy on the configured port (32124)
- Verify health via `/health` endpoint
- Track service dependencies

## Configuration

Add the following to your project's `.factory/services.yaml`:

```yaml
services:
  cursor-proxy:
    name: cursor-proxy
    description: Standalone proxy server for Cursor API
    type: web-server
    port: 32124
    host: 127.0.0.1
    start: |
      cd /path/to/CliCursorProxyAPI && bun run proxy
    stop: |
      lsof -ti :32124 | xargs kill 2>/dev/null || true
    healthcheck: |
      curl -sf http://localhost:32124/health
    depends_on: []
```

## Service Fields

| Field | Description |
|-------|-------------|
| `name` | Unique service identifier |
| `description` | Human-readable description |
| `type` | Service type (e.g., `web-server`) |
| `port` | Port number for conflict detection |
| `host` | Host binding address |
| `start` | Command to start the service |
| `stop` | Command to stop the service |
| `healthcheck` | Command to verify service health |

## Usage

```bash
# Start the proxy as a managed service
droid service start cursor-proxy

# Check health
droid service status cursor-proxy

# Stop the proxy
droid service stop cursor-proxy
```

## Notes

- The proxy requires `cursor-agent` to be installed and authenticated
- Run `cursor-agent login` before first use if auth is required
- The proxy binds to localhost (127.0.0.1) by default for security
