import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { getHttpConfig } from "./config.mjs";
import { createPromptGateServer } from "./mcpServer.mjs";
import { createPromptService } from "./serviceFactory.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

function sendError(res, error, status = 400) {
  res.status(status).json({
    error: error.message
  });
}

export function createHttpApp({ service, host = "127.0.0.1" }) {
  const app = createMcpExpressApp({ host });

  app.get("/healthz", async (_req, res) => {
    res.json({
      ok: true,
      ...(await service.stats())
    });
  });

  app.get("/api/stats", async (_req, res) => {
    res.json(await service.stats());
  });

  app.get("/api/prompts", async (req, res) => {
    const limit = Number(req.query.limit || "20");
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    res.json({
      items: await service.list({ limit, status })
    });
  });

  app.get("/api/prompts/:id", async (req, res) => {
    try {
      res.json({
        item: await service.get(req.params.id)
      });
    } catch (error) {
      sendError(res, error, 404);
    }
  });

  app.post("/api/prompts/draft", async (req, res) => {
    try {
      res.status(201).json({
        item: await service.draft(req.body)
      });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post("/api/prompts/:id/revise", async (req, res) => {
    try {
      res.json({
        item: await service.revise({
          promptId: req.params.id,
          prompt: req.body.prompt,
          note: req.body.note
        })
      });
    } catch (error) {
      sendError(res, error, 404);
    }
  });

  app.post("/api/prompts/:id/approve", async (req, res) => {
    try {
      res.json({
        item: await service.approve({
          promptId: req.params.id,
          approvedPrompt: req.body.approvedPrompt
        })
      });
    } catch (error) {
      sendError(res, error, 404);
    }
  });

  app.post("/api/prompts/:id/reject", async (req, res) => {
    try {
      res.json({
        item: await service.reject({
          promptId: req.params.id,
          reason: req.body.reason
        })
      });
    } catch (error) {
      sendError(res, error, 404);
    }
  });

  app.post("/mcp", async (req, res) => {
    const server = createPromptGateServer({ service });

    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);

      res.on("close", () => {
        transport.close();
        server.close();
      });
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: error.message
          },
          id: null
        });
      }
    }
  });

  app.get("/mcp", (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed."
      },
      id: null
    });
  });

  app.delete("/mcp", (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed."
      },
      id: null
    });
  });

  app.use(express.static(publicDir));

  app.get("/{*path}", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/mcp") || req.path === "/healthz") {
      next();
      return;
    }

    res.sendFile(path.join(publicDir, "index.html"));
  });

  return app;
}

export function startHttpServer(options = {}) {
  const service = options.service || createPromptService();
  const config = getHttpConfig();
  const host = options.host || config.host;
  const port = options.port || config.port;
  const app = createHttpApp({ service, host });

  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      resolve({ app, server, host, port });
    });

    server.on("error", reject);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { host, port } = getHttpConfig();
  startHttpServer({ host, port })
    .then(() => {
      console.log(`ABK Pixel Prompt Gate HTTP server listening on http://${host}:${port}`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
