import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp } from "node:fs/promises";

import { createHttpApp } from "../src/httpServer.mjs";
import { PromptService } from "../src/promptService.mjs";
import { FilePromptStore } from "../src/store.mjs";

async function createService() {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "prompt-gate-http-"));
  return new PromptService({
    store: new FilePromptStore({ dataDir })
  });
}

test("healthz and draft api respond", async () => {
  const service = await createService();
  const app = createHttpApp({ service });

  const server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const healthResponse = await fetch(`${baseUrl}/healthz`);
    assert.equal(healthResponse.status, 200);

    const draftResponse = await fetch(`${baseUrl}/api/prompts/draft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        problem: "Arama sonucu yanlis siralaniyor"
      })
    });

    assert.equal(draftResponse.status, 201);
    const draftPayload = await draftResponse.json();
    assert.equal(draftPayload.item.status, "draft");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});
