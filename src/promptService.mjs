import crypto from "node:crypto";

import { buildCodexPrompt } from "./promptBuilder.mjs";

function trimOptional(value) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function buildTitle(problem) {
  const normalized = problem.replace(/\s+/g, " ").trim();
  return normalized.length > 72 ? `${normalized.slice(0, 69)}...` : normalized;
}

function createRevision({ type, prompt, note }) {
  return {
    type,
    prompt,
    note,
    at: new Date().toISOString()
  };
}

export class PromptService {
  constructor({ store }) {
    this.store = store;
  }

  async draft(input) {
    const problem = trimOptional(input.problem);

    if (!problem) {
      throw new Error("`problem` zorunlu.");
    }

    const built = buildCodexPrompt({
      ...input,
      problem
    });
    const now = new Date().toISOString();
    const record = {
      id: crypto.randomUUID(),
      title: buildTitle(problem),
      status: "draft",
      createdAt: now,
      updatedAt: now,
      taskType: built.taskType,
      originalProblem: problem,
      inputs: input,
      draftPrompt: built.prompt,
      approvedPrompt: null,
      rejectedReason: null,
      missingContextHints: built.missingContextHints,
      qualityScore: built.qualityScore,
      qualityLabel: built.qualityLabel,
      revisions: [
        createRevision({
          type: "draft",
          prompt: built.prompt,
          note: "Initial draft"
        })
      ]
    };

    return this.store.create(record);
  }

  async finalize(input) {
    const problem = trimOptional(input.problem);
    const approvedPrompt = trimOptional(input.approvedPrompt);

    if (!problem) {
      throw new Error("`problem` zorunlu.");
    }

    if (!approvedPrompt) {
      throw new Error("`approvedPrompt` zorunlu.");
    }

    const built = buildCodexPrompt({
      ...input,
      problem
    });
    const now = new Date().toISOString();
    const record = {
      id: crypto.randomUUID(),
      title: buildTitle(problem),
      status: "approved",
      createdAt: now,
      updatedAt: now,
      taskType: built.taskType,
      originalProblem: problem,
      inputs: input,
      draftPrompt: approvedPrompt,
      approvedPrompt,
      rejectedReason: null,
      missingContextHints: built.missingContextHints,
      qualityScore: built.qualityScore,
      qualityLabel: built.qualityLabel,
      revisions: [
        createRevision({
          type: "approve",
          prompt: approvedPrompt,
          note: "Approved without prior persisted draft"
        })
      ]
    };

    return this.store.create(record);
  }

  async revise({ promptId, prompt, note }) {
    const normalizedPrompt = trimOptional(prompt);

    if (!normalizedPrompt) {
      throw new Error("`prompt` zorunlu.");
    }

    const normalizedNote = trimOptional(note) || "Manual revision";

    return this.#requireRecord(
      await this.store.update(promptId, (current) => ({
        ...current,
        status: "draft",
        updatedAt: new Date().toISOString(),
        draftPrompt: normalizedPrompt,
        approvedPrompt: null,
        rejectedReason: null,
        revisions: [
          ...current.revisions,
          createRevision({
            type: "revise",
            prompt: normalizedPrompt,
            note: normalizedNote
          })
        ]
      })),
      promptId
    );
  }

  async approve({ promptId, approvedPrompt }) {
    return this.#requireRecord(
      await this.store.update(promptId, (current) => {
        const nextPrompt = trimOptional(approvedPrompt) || current.draftPrompt;

        return {
          ...current,
          status: "approved",
          updatedAt: new Date().toISOString(),
          approvedPrompt: nextPrompt,
          rejectedReason: null,
          revisions: [
            ...current.revisions,
            createRevision({
              type: "approve",
              prompt: nextPrompt,
              note: "Approved by user"
            })
          ]
        };
      }),
      promptId
    );
  }

  async reject({ promptId, reason }) {
    return this.#requireRecord(
      await this.store.update(promptId, (current) => ({
        ...current,
        status: "rejected",
        updatedAt: new Date().toISOString(),
        approvedPrompt: null,
        rejectedReason: trimOptional(reason) || "Rejected by user",
        revisions: [
          ...current.revisions,
          createRevision({
            type: "reject",
            prompt: current.draftPrompt,
            note: trimOptional(reason) || "Rejected by user"
          })
        ]
      })),
      promptId
    );
  }

  async get(promptId) {
    return this.#requireRecord(await this.store.get(promptId), promptId);
  }

  async list({ limit = 20, status } = {}) {
    return this.store.list({ limit, status });
  }

  async stats() {
    return this.store.stats();
  }

  async preview(input) {
    const problem = trimOptional(input.problem);

    if (!problem) {
      throw new Error("`problem` zorunlu.");
    }

    return buildCodexPrompt({
      ...input,
      problem
    });
  }

  #requireRecord(record, promptId) {
    if (!record) {
      throw new Error(`Prompt bulunamadi: ${promptId}`);
    }

    return record;
  }
}
