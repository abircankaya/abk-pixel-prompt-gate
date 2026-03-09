import os from "node:os";
import path from "node:path";

export function getDataDir(env = process.env, cwd = process.cwd()) {
  if (env.PROMPT_GATE_DATA_DIR) {
    return env.PROMPT_GATE_DATA_DIR;
  }

  if (cwd && cwd !== "/") {
    return path.join(cwd, ".codex-prompt-mcp");
  }

  return path.join(os.homedir(), ".codex", "abk-pixel-prompt-gate");
}

export function getHttpConfig(env = process.env) {
  return {
    host: env.PROMPT_GATE_HOST || "127.0.0.1",
    port: Number(env.PROMPT_GATE_PORT || "3334")
  };
}
