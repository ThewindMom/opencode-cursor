#!/usr/bin/env node

/**
 * mcptool — CLI for calling MCP server tools from the shell.
 *
 * Usage:
 *   mcptool servers                          List configured MCP servers
 *   mcptool tools [server]                   List tools (optionally filter by server)
 *   mcptool call <server> <tool> [json-args] Call a tool
 *
 * Reads MCP server configuration from opencode.json (same config the plugin uses).
 */

import { readMcpConfigs } from "../mcp/config.js";
import { McpClientManager } from "../mcp/client-manager.js";

const USAGE = `mcptool — call MCP server tools from the shell

Usage:
  mcptool servers                          List configured servers
  mcptool tools [server]                   List available tools
  mcptool call <server> <tool> [json-args] Call a tool

Examples:
  mcptool servers
  mcptool tools
  mcptool tools hybrid-memory
  mcptool call hybrid-memory memory_stats
  mcptool call hybrid-memory memory_search '{"query":"auth"}'
  mcptool call test-filesystem list_directory '{"path":"/tmp"}'`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(USAGE);
    process.exit(0);
  }

  const command = args[0];
  const configs = readMcpConfigs();

  if (configs.length === 0) {
    console.error("No MCP servers configured in opencode.json");
    process.exit(1);
  }

  const manager = new McpClientManager();

  if (command === "servers") {
    for (const c of configs) {
      const detail =
        c.type === "local" ? c.command.join(" ") : (c as any).url ?? "";
      console.log(`${c.name}  (${c.type})  ${detail}`);
    }
    process.exit(0);
  }

  if (command === "tools") {
    const filter = args[1];
    const toConnect = filter
      ? configs.filter((c) => c.name === filter)
      : configs;

    if (filter && toConnect.length === 0) {
      console.error(`Unknown server: ${filter}`);
      console.error(`Available: ${configs.map((c) => c.name).join(", ")}`);
      process.exit(1);
    }

    await Promise.allSettled(toConnect.map((c) => manager.connectServer(c)));
    const tools = manager.listTools();

    if (tools.length === 0) {
      console.log("No tools discovered.");
    } else {
      for (const t of tools) {
        const params = t.inputSchema
          ? Object.keys((t.inputSchema as any).properties ?? {}).join(", ")
          : "";
        console.log(`${t.serverName}/${t.name}  ${t.description ?? ""}`);
        if (params) console.log(`  params: ${params}`);
      }
    }

    await manager.disconnectAll();
    process.exit(0);
  }

  if (command === "call") {
    const serverName = args[1];
    const toolName = args[2];
    const rawArgs = args[3];

    if (!serverName || !toolName) {
      console.error("Usage: mcptool call <server> <tool> [json-args]");
      process.exit(1);
    }

    const config = configs.find((c) => c.name === serverName);
    if (!config) {
      console.error(`Unknown server: ${serverName}`);
      console.error(`Available: ${configs.map((c) => c.name).join(", ")}`);
      process.exit(1);
    }

    let toolArgs: Record<string, unknown> = {};
    if (rawArgs) {
      try {
        toolArgs = JSON.parse(rawArgs);
      } catch {
        console.error(`Invalid JSON args: ${rawArgs}`);
        process.exit(1);
      }
    }

    await manager.connectServer(config);
    const result = await manager.callTool(serverName, toolName, toolArgs);
    console.log(result);

    await manager.disconnectAll();
    process.exit(0);
  }

  console.error(`Unknown command: ${command}`);
  console.log(USAGE);
  process.exit(1);
}

main().catch((err) => {
  console.error(`mcptool error: ${err.message || err}`);
  process.exit(1);
});
