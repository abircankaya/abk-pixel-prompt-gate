import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PACKAGE_REF, MANAGED_BLOCK_END, MANAGED_BLOCK_START, upsertManagedAgentsBlock } from "../src/install.mjs";

test("managed AGENTS block is created for empty files", () => {
  const result = upsertManagedAgentsBlock("");

  assert.match(result, new RegExp(MANAGED_BLOCK_START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(result, /preview_codex_prompt/);
  assert.match(result, /finalize_codex_prompt/);
  assert.match(result, new RegExp(MANAGED_BLOCK_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("managed AGENTS block is appended without removing existing content", () => {
  const existing = "# Repo Rules\n\nOnce test calistir.\n";
  const result = upsertManagedAgentsBlock(existing);

  assert.match(result, /# Repo Rules/);
  assert.match(result, /## ABK Enhance Workflow/);
});

test("managed AGENTS block is replaced in place", () => {
  const existing = [
    "# Repo Rules",
    "",
    MANAGED_BLOCK_START,
    "eski icerik",
    MANAGED_BLOCK_END,
    "",
    "Son satir"
  ].join("\n");

  const result = upsertManagedAgentsBlock(existing);

  assert.ok(!result.includes("eski icerik"));
  assert.match(result, /Son satir/);
});

test("default package ref is pinned to the current release tag", () => {
  assert.match(DEFAULT_PACKAGE_REF, /^github:abircankaya\/abk-enhance#v\d+\.\d+\.\d+$/);
});
