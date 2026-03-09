import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp } from "node:fs/promises";

import { PromptService } from "../src/promptService.mjs";
import { FilePromptStore } from "../src/store.mjs";

async function createService() {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "prompt-gate-"));
  const store = new FilePromptStore({ dataDir });
  return new PromptService({ store });
}

test("draft -> revise -> approve lifecycle works", async () => {
  const service = await createService();
  const drafted = await service.draft({
    problem: "Liste filtre degisince bosa dusuyor",
    repoArea: ["src/features/search"]
  });

  assert.equal(drafted.status, "draft");

  const revised = await service.revise({
    promptId: drafted.id,
    prompt: `${drafted.draftPrompt}\n\nEk not: loading state'i kontrol et.`,
    note: "Loading state eklendi"
  });

  assert.equal(revised.status, "draft");
  assert.equal(revised.revisions.length, 2);

  const approved = await service.approve({
    promptId: drafted.id
  });

  assert.equal(approved.status, "approved");
  assert.ok(approved.approvedPrompt);
  assert.equal(approved.revisions.length, 3);
});

test("reject updates stats", async () => {
  const service = await createService();
  const drafted = await service.draft({
    problem: "Readme hazirla"
  });

  await service.reject({
    promptId: drafted.id,
    reason: "Kapsam eksik"
  });

  const stats = await service.stats();
  assert.equal(stats.total, 1);
  assert.equal(stats.counts.rejected, 1);
});

test("finalize stores an approved prompt directly", async () => {
  const service = await createService();
  const approved = await service.finalize({
    problem: "Liste filtre degisince bosa dusuyor",
    approvedPrompt: "Amac: Liste filtre degisince bosa dusuyor."
  });

  assert.equal(approved.status, "approved");
  assert.equal(approved.approvedPrompt, "Amac: Liste filtre degisince bosa dusuyor.");
  assert.equal(approved.revisions.length, 1);
});
