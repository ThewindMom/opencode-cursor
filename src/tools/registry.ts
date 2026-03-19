import type { ToolDefinition, ToolHandler } from "./types.js";

interface RegisteredTool {
  definition: ToolDefinition;
  executor: ToolHandler;
}

export class ToolRegistry {
  private tools: Map<string, RegisteredTool> = new Map();

  register(name: string, definition: ToolDefinition, executor: ToolHandler): void {
    this.tools.set(name, { definition, executor });
  }

  get(name: string): RegisteredTool | undefined {
    return this.tools.get(name);
  }

  getAllDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(t => t.definition);
  }

  getExecutor(name: string): ToolHandler | undefined {
    return this.tools.get(name)?.executor;
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  getAllToolNames(): string[] {
    return Array.from(this.tools.keys());
  }
}