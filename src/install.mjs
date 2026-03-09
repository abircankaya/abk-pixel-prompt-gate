import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import packageJson from "../package.json" with { type: "json" };
import { getDataDir } from "./config.mjs";

export const DEFAULT_SERVER_NAME = "abk-enhance";
export const DEFAULT_PACKAGE_REF = `github:abircankaya/abk-enhance#v${packageJson.version}`;
export const MANAGED_BLOCK_START = "<!-- abk-enhance:start -->";
export const MANAGED_BLOCK_END = "<!-- abk-enhance:end -->";

function buildManagedBlock(serverName = DEFAULT_SERVER_NAME) {
  return [
    MANAGED_BLOCK_START,
    "## ABK Enhance Workflow",
    "",
    "Bu repo icinde teknik bir gorev, bug, review, refactor veya implementasyon talebi geldiginde varsayilan davranis su olmalidir:",
    "",
    "1. Kullanici girdisini dogrudan uygulamaya gecme.",
    `2. Once \`${serverName}\` MCP sunucusundaki \`preview_codex_prompt\` aracini cagir.`,
    "3. Uretilen prompt taslagini minimum metinle kullaniciya goster.",
    "4. Kullanici onay vermeden veya promptu duzeltmeden esas isi yapma.",
    "5. Kullanici promptu degistirirse duzeltilmis promptu esas al.",
    "6. Kullanici onay verdiginde `finalize_codex_prompt` ile onayli promptu tek adimda kaydet.",
    "7. Sonraki analiz, plan, kod degisikligi veya review sadece onayli prompt uzerinden ilerlesin.",
    "8. Yeni baglam gelirse tekrar `preview_codex_prompt` ile yeni taslak uret ve yeniden onay al.",
    "",
    "Beklenen kullanici deneyimi:",
    "",
    "- Kullanici ham problemi yazar.",
    '- Codex once "Bunu su sekilde yazarsan daha iyi anlarim" diyerek iyilestirilmis promptu sunar.',
    "- Kullanici `onay` verir veya duzeltme yapar.",
    "- Ancak bundan sonra asil gorev baslar.",
    "- Ilk yanit hizli olmali; gereksiz repo kesfi veya uzun aciklama yapma.",
    "",
    "Not:",
    "",
    "- MCP, Codex'in input text alanini fiziksel olarak degistirmez.",
    "- Bu akis sohbet/agent davranisi olarak uygulanir.",
    MANAGED_BLOCK_END
  ].join("\n");
}

export function upsertManagedAgentsBlock(existingContent = "", serverName = DEFAULT_SERVER_NAME) {
  const block = buildManagedBlock(serverName);
  const startIndex = existingContent.indexOf(MANAGED_BLOCK_START);
  const endIndex = existingContent.indexOf(MANAGED_BLOCK_END);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const before = existingContent.slice(0, startIndex).replace(/\s*$/, "");
    const after = existingContent.slice(endIndex + MANAGED_BLOCK_END.length).replace(/^\s*/, "");
    return [before, block, after].filter(Boolean).join("\n\n").trimEnd() + "\n";
  }

  const trimmed = existingContent.trimEnd();
  return trimmed ? `${trimmed}\n\n${block}\n` : `${block}\n`;
}

function defaultRunCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env,
    encoding: "utf8"
  });

  return {
    code: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error
  };
}

function ensureSuccess(result, context) {
  if (result.code === 0) {
    return;
  }

  if (result.error?.code === "ENOENT") {
    throw new Error(`${context}: komut bulunamadi`);
  }

  const details = result.stderr.trim() || result.stdout.trim() || "bilinmeyen hata";
  throw new Error(`${context}: ${details}`);
}

export async function installPromptGate(options = {}) {
  const cwd = options.cwd || process.cwd();
  const serverName = options.serverName || DEFAULT_SERVER_NAME;
  const codexCommand = options.codexCommand || "codex";
  const packageRef = options.packageRef || DEFAULT_PACKAGE_REF;
  const dataDir = path.resolve(options.dataDir || getDataDir(process.env, cwd));
  const agentFile = path.resolve(cwd, options.agentFile || "AGENTS.md");
  const skipAgents = options.skipAgents || false;
  const runCommand = options.runCommand || defaultRunCommand;

  await fs.mkdir(dataDir, { recursive: true });

  ensureSuccess(runCommand(codexCommand, ["--version"], { cwd }), "Codex CLI kontrolu basarisiz");

  const existing = runCommand(codexCommand, ["mcp", "get", serverName], { cwd });
  const hadExistingServer = existing.code === 0;

  if (hadExistingServer) {
    ensureSuccess(runCommand(codexCommand, ["mcp", "remove", serverName], { cwd }), "Mevcut MCP kaydi silinemedi");
  }

  ensureSuccess(
    runCommand(
      codexCommand,
      [
        "mcp",
        "add",
        serverName,
        "--env",
        `PROMPT_GATE_DATA_DIR=${dataDir}`,
        "--",
        "npx",
        "-y",
        packageRef,
        "mcp-server"
      ],
      { cwd }
    ),
    "MCP kaydi eklenemedi"
  );

  let agentsAction = "skipped";

  if (!skipAgents) {
    let existingAgents = "";

    try {
      existingAgents = await fs.readFile(agentFile, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    const nextAgents = upsertManagedAgentsBlock(existingAgents, serverName);
    agentsAction = existingAgents ? "updated" : "created";

    if (existingAgents === nextAgents) {
      agentsAction = "unchanged";
    } else {
      await fs.writeFile(agentFile, nextAgents, "utf8");
    }
  }

  return {
    serverName,
    packageRef,
    dataDir,
    agentFile,
    mcpAction: hadExistingServer ? "updated" : "created",
    agentsAction
  };
}
