import { afterEach, describe, expect, it, vi } from "bun:test";
import {
  McpClientManager,
  type McpToolInfo,
} from "../../../src/mcp/client-manager.js";
import type { McpLocalServerConfig } from "../../../src/mcp/config.js";

function createMockClient(tools: McpToolInfo[] = []) {
  return {
    connect: vi.fn(async () => {}),
    listTools: vi.fn(async () => ({ tools })),
    callTool: vi.fn(async (params: { name: string; arguments?: Record<string, unknown> }) => ({
      content: [{ type: "text", text: `result for ${params.name}` }],
    })),
    close: vi.fn(async () => {}),
  };
}

function createMockTransport() {
  return { start: vi.fn(), close: vi.fn() };
}

const sampleConfig: McpLocalServerConfig = {
  name: "test-server",
  type: "local",
  command: ["node", "/fake/server.js"],
};

const sampleTools: McpToolInfo[] = [
  {
    name: "memory_store",
    description: "Store a memory",
    inputSchema: { type: "object", properties: { key: { type: "string" } }, required: ["key"] },
  },
];

describe("mcp/client-manager", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("connects to a server and discovers tools", async () => {
    const mockClient = createMockClient(sampleTools);
    const manager = new McpClientManager({
      createClient: () => mockClient as any,
      createTransport: () => createMockTransport() as any,
    });

    await manager.connectServer(sampleConfig);

    const tools = manager.listTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe("memory_store");
    expect(tools[0].serverName).toBe("test-server");
  });

  it("calls a tool on the correct server", async () => {
    const mockClient = createMockClient(sampleTools);
    const manager = new McpClientManager({
      createClient: () => mockClient as any,
      createTransport: () => createMockTransport() as any,
    });

    await manager.connectServer(sampleConfig);
    const result = await manager.callTool("test-server", "memory_store", { key: "hello" });

    expect(mockClient.callTool).toHaveBeenCalledWith({
      name: "memory_store",
      arguments: { key: "hello" },
    });
    expect(result).toContain("result for memory_store");
  });

  it("returns error for unknown server", async () => {
    const manager = new McpClientManager({
      createClient: () => createMockClient() as any,
      createTransport: () => createMockTransport() as any,
    });

    const result = await manager.callTool("nonexistent", "tool", {});
    expect(result).toContain("not connected");
  });

  it("disconnects all servers on shutdown", async () => {
    const mockClient = createMockClient(sampleTools);
    const manager = new McpClientManager({
      createClient: () => mockClient as any,
      createTransport: () => createMockTransport() as any,
    });

    await manager.connectServer(sampleConfig);
    await manager.disconnectAll();

    expect(mockClient.close).toHaveBeenCalled();
    expect(manager.listTools()).toHaveLength(0);
  });

  it("handles connection failure gracefully", async () => {
    const mockClient = createMockClient();
    mockClient.connect = vi.fn(async () => {
      throw new Error("spawn failed");
    });

    const manager = new McpClientManager({
      createClient: () => mockClient as any,
      createTransport: () => createMockTransport() as any,
    });

    await manager.connectServer(sampleConfig);
    expect(manager.listTools()).toHaveLength(0);
  });

  it("handles tool discovery failure gracefully", async () => {
    const mockClient = createMockClient();
    mockClient.listTools = vi.fn(async () => {
      throw new Error("timeout");
    });

    const manager = new McpClientManager({
      createClient: () => mockClient as any,
      createTransport: () => createMockTransport() as any,
    });

    await manager.connectServer(sampleConfig);
    expect(manager.listTools()).toHaveLength(0);
  });
});
