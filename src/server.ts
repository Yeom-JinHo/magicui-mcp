#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registryService } from "./services/registry-service.js";
import { registerCategoryTools } from "./tools/register-category-tools.js";
import { registerGenericTools } from "./tools/register-generic-tools.js";
import { createErrorResponse, createTextResponse } from "./tools/responses.js";

const server = new McpServer({
  name: "Magic UI MCP",
  version: "1.0.4",
});

server.tool(
  "getUIComponents",
  "Provides a comprehensive list of all Magic UI components.",
  {},
  async () => {
    try {
      const uiComponents = await registryService.listUIComponents();
      return createTextResponse(uiComponents);
    } catch (error) {
      return createErrorResponse("Failed to fetch MagicUI components", error);
    }
  },
);

registerGenericTools(server);

registerCategoryTools(server)
  .then(() => {
    const transport = new StdioServerTransport();
    server.connect(transport);
  })
  .catch((error) => {
    console.error("Error registering category tools:", error);
    const transport = new StdioServerTransport();
    server.connect(transport);
  });
