import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  componentCategories,
  getComponentCategoryNames,
} from "../registry/categories.js";
import { registryService } from "../services/registry-service.js";
import { createErrorResponse, createTextResponse } from "./responses.js";

export async function registerCategoryTools(server: McpServer) {
  const snapshot = await registryService.createSnapshot();

  for (const category of getComponentCategoryNames()) {
    const categoryComponents = componentCategories[category];
    const componentNamesString = categoryComponents.join(", ");

    server.tool(
      `get${category}`,
      `Provides implementation details for ${componentNamesString} components.`,
      {},
      async () => {
        try {
          const categoryResults = await registryService.getCategoryComponents(
            category,
            snapshot,
          );

          return createTextResponse(categoryResults);
        } catch (error) {
          return createErrorResponse(
            `Error processing ${category} components`,
            error,
          );
        }
      },
    );
  }
}
