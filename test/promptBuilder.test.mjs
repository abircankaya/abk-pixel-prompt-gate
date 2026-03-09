import test from "node:test";
import assert from "node:assert/strict";

import { buildCodexPrompt } from "../src/promptBuilder.mjs";

test("buildCodexPrompt creates a bug-fix oriented prompt", () => {
  const result = buildCodexPrompt({
    problem: "Checkout bug'ini duzelt",
    repoArea: "app/checkout",
    constraints: ["API kontratini degistirme"]
  });

  assert.equal(result.taskType, "bug_fix");
  assert.match(result.prompt, /Amac: Checkout bug'ini duzelt/);
  assert.match(result.prompt, /Ilgili alan:\n- app\/checkout/);
  assert.match(result.prompt, /API kontratini degistirme/);
  assert.match(result.prompt, /Dogrulama:/);
});

test("buildCodexPrompt computes quality hints and score", () => {
  const result = buildCodexPrompt({
    problem: "Bu PR'i review et"
  });

  assert.equal(result.taskType, "review");
  assert.match(result.prompt, /Ovguden cok bulgulara odaklan/);
  assert.match(result.prompt, /dosya\/satir referanslariyla yaz/);
  assert.ok(result.missingContextHints.length > 0);
  assert.equal(result.qualityLabel, "rough");
});
