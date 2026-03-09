import { getDataDir } from "./config.mjs";
import { PromptService } from "./promptService.mjs";
import { FilePromptStore } from "./store.mjs";

export function createPromptService(options = {}) {
  const dataDir = options.dataDir || getDataDir();
  const store = options.store || new FilePromptStore({ dataDir });
  return new PromptService({ store });
}
