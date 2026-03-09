import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export class FilePromptStore {
  constructor({ dataDir }) {
    this.dataDir = dataDir;
    this.storeFile = path.join(dataDir, "prompts.json");
  }

  async #readAll() {
    try {
      const raw = await readFile(this.storeFile, "utf8");
      const parsed = JSON.parse(raw);
      return parsed.prompts ?? {};
    } catch (error) {
      if (error && error.code === "ENOENT") {
        return {};
      }

      throw error;
    }
  }

  async #writeAll(prompts) {
    await mkdir(this.dataDir, { recursive: true });
    await writeFile(
      this.storeFile,
      JSON.stringify({ prompts }, null, 2),
      "utf8"
    );
  }

  async create(record) {
    const prompts = await this.#readAll();
    prompts[record.id] = record;
    await this.#writeAll(prompts);
    return record;
  }

  async update(id, updater) {
    const prompts = await this.#readAll();
    const current = prompts[id];

    if (!current) {
      return null;
    }

    const next = updater(current);
    prompts[id] = next;
    await this.#writeAll(prompts);
    return next;
  }

  async get(id) {
    const prompts = await this.#readAll();
    return prompts[id] ?? null;
  }

  async list({ limit = 20, status } = {}) {
    const prompts = await this.#readAll();
    return Object.values(prompts)
      .filter((item) => !status || item.status === status)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit);
  }

  async stats() {
    const prompts = await this.#readAll();
    const items = Object.values(prompts);
    const counts = items.reduce(
      (accumulator, item) => {
        accumulator[item.status] = (accumulator[item.status] || 0) + 1;
        return accumulator;
      },
      {
        draft: 0,
        approved: 0,
        rejected: 0
      }
    );

    return {
      total: items.length,
      counts
    };
  }
}
