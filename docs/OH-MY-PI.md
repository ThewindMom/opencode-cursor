# oh-my-pi Integration Guide

This guide is for integrating CliCursorProxyAPI with **your own oh-my-pi installation** (not pi.dev). The oh-my-pi coding agent uses the same extension API as pi.dev.

## Overview

oh-my-pi supports custom providers via TypeScript extensions using `pi.registerProvider()`. Create an extension that registers CliCursorProxyAPI as an OpenAI-compatible provider.

## Prerequisites

1. **oh-my-pi installed and built**: `bun install && bun build` in oh-my-pi root
2. **CliCursorProxyAPI running**: `bun run proxy` in CliCursorProxyAPI
3. **cursor-agent installed and authenticated**: `cursor-agent login`

## Extension Location

For oh-my-pi, place extensions in your project's `.omp/extensions/` directory or user-level `~/.omp/extensions/`.

## Configuration

### Step 1: Ensure Proxy is Running

```bash
cd /path/to/CliCursorProxyAPI
bun run proxy
curl http://localhost:32124/health
```

### Step 2: Create Extension File

Create `~/.omp/extensions/cursor-acp.ts` (or in your project):

```typescript
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerProvider("cursor-acp", {
    baseUrl: "http://127.0.0.1:32124/v1",
    apiKey: "dummy",
    api: "openai-completions",
    models: [
      {
        id: "auto",
        name: "Auto",
        reasoning: true,
        input: ["text", "image"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 200000,
        maxTokens: 16384
      },
      {
        id: "composer-2-fast",
        name: "Composer 2 Fast",
        reasoning: false,
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 200000,
        maxTokens: 16384
      },
      {
        id: "sonnet-4.6",
        name: "Sonnet 4.6",
        reasoning: false,
        input: ["text", "image"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 200000,
        maxTokens: 16384
      },
      {
        id: "opus-4.6",
        name: "Opus 4.6",
        reasoning: false,
        input: ["text", "image"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 200000,
        maxTokens: 16384
      }
    ]
  });
}
```

### Step 3: Reload oh-my-pi

If oh-my-pi was already running:
```
/reload
```

Or restart oh-my-pi to load the new extension.

## Verification

Check models are available:
```
/models
```

Look for "cursor-acp" provider and registered models.
