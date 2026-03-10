import { describe, expect, it, vi } from "bun:test";
import { readMcpConfigs } from "../../../src/mcp/config.js";
import { McpClientManager } from "../../../src/mcp/client-manager.js";
import { buildMcpToolHookEntries } from "../../../src/mcp/tool-bridge.js";

describe("mcp integration", () => {
  it("full pipeline: config → connect → discover → bridge → execute", async () => {
    // 1. Read configs
    const configs = readMcpConfigs({
      configJson: JSON.stringify({
        mcp: {
          "test-memory": {
            type: "local",
            command: ["node", "/fake/server.js"],
          },
        },
      }),
    });
    expect(configs).toHaveLength(1);

    // 2. Connect with mock client
    const callToolFn = vi.fn(async (params: any) => ({
      content: [{ type: "text", text: `stored: ${params.arguments?.key}` }],
    }));

    const manager = new McpClientManager({
      createClient: () => ({
        connect: async () => {},
        listTools: async () => ({
          tools: [
            {
              name: "memory_store",
              description: "Store a value",
              inputSchema: {
                type: "object",
                properties: { key: { type: "string" } },
                required: ["key"],
              },
            },
          ],
        }),
        callTool: callToolFn,
        close: async () => {},
      }),
      createTransport: () => ({ start: async () => {}, close: async () => {} }),
    });

    await manager.connectServer(configs[0]);
    const tools = manager.listTools();
    expect(tools).toHaveLength(1);

    // 3. Build tool hook entries
    const entries = buildMcpToolHookEntries(tools, manager);
    const hookName = "mcp__test_memory__memory_store";
    expect(entries[hookName]).toBeDefined();

    // 4. Verify tool execution via callTool
    const result = await manager.callTool("test-memory", "memory_store", { key: "hello" });
    expect(result).toBe("stored: hello");
    expect(callToolFn).toHaveBeenCalledWith({
      name: "memory_store",
      arguments: { key: "hello" },
    });

    // 5. Cleanup
    await manager.disconnectAll();
    expect(manager.listTools()).toHaveLength(0);
  });
});
