import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPromptGateServer } from "./mcpServer.mjs";
import { createPromptService } from "./serviceFactory.mjs";

const service = createPromptService();
const server = createPromptGateServer({ service });
const transport = new StdioServerTransport();
await server.connect(transport);
