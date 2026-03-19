# Environment

Environment variables, external dependencies, and setup notes.

## Prerequisites

- **Bun runtime**: Required for development and building
  - Install: `curl -fsSL https://bun.sh/install | bash`

- **cursor-agent**: Cursor CLI for authentication and API access
  - Install: `curl https://cursor.com/install -fsS | bash`
  - Auth: `cursor-agent login`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CURSOR_ACP_PORT` | Proxy server port | 32124 |
| `CURSOR_ACP_LOG_LEVEL` | Logging level (debug/info/warn/error) | info |
| `CURSOR_ACP_WORKSPACE` | Workspace directory | cwd |

## Auth Files

cursor-agent auth files are checked in these locations:
- macOS: `~/.cursor/auth.json`, `~/.cursor/cli-config.json`
- Linux: `~/.cursor/auth.json`, `~/.cursor/cli-config.json`

## Port Configuration

Default port is 32124. If busy, proxy auto-selects next available port.
