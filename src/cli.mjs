#!/usr/bin/env node

import { startHttpServer } from "./httpServer.mjs";
import { installPromptGate } from "./install.mjs";
import { createPromptService } from "./serviceFactory.mjs";
import { startStdioServer } from "./stdioServer.mjs";

function parseArgs(argv) {
  const command = argv[0];
  const flags = {};
  const arrays = new Set(["repo-area", "constraint"]);

  for (let index = 1; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    const value = !next || next.startsWith("--") ? true : next;

    if (value !== true) {
      index += 1;
    }

    if (arrays.has(key)) {
      flags[key] = flags[key] || [];
      flags[key].push(value);
      continue;
    }

    flags[key] = value;
  }

  return { command, flags };
}

function formatRecord(record) {
  const prompt = record.status === "approved" ? record.approvedPrompt : record.draftPrompt;
  return JSON.stringify(
    {
      id: record.id,
      title: record.title,
      status: record.status,
      taskType: record.taskType,
      qualityScore: record.qualityScore,
      prompt
    },
    null,
    2
  );
}

function printHelp() {
  console.log(`
Kullanim:
  npm run cli -- draft --problem "..."
  npm run cli -- finalize --problem "..." --prompt "..."
  npm run cli -- revise --id <prompt-id> --prompt "..."
  npm run cli -- approve --id <prompt-id> [--prompt "..."]
  npm run cli -- reject --id <prompt-id> [--reason "..."]
  npm run cli -- show --id <prompt-id>
  npm run cli -- list [--limit 20] [--status draft|approved|rejected]
  npm run cli -- install [--data-dir .codex-prompt-mcp] [--skip-agents]
  npm run cli -- mcp-server
  npm run cli -- serve-http [--host 127.0.0.1] [--port 3334]
`);
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));
  const service = createPromptService();

  if (!command || command === "help") {
    printHelp();
    return;
  }

  switch (command) {
    case "draft": {
      const record = await service.draft({
        problem: flags.problem,
        context: flags.context,
        repoArea: flags["repo-area"],
        constraints: flags.constraint,
        validation: flags.validation,
        outputFormat: flags["output-format"],
        askForPlan: flags["no-plan"] ? false : true
      });
      console.log(formatRecord(record));
      return;
    }

    case "finalize": {
      const record = await service.finalize({
        problem: flags.problem,
        approvedPrompt: flags.prompt,
        context: flags.context,
        repoArea: flags["repo-area"],
        constraints: flags.constraint,
        validation: flags.validation,
        outputFormat: flags["output-format"],
        askForPlan: flags["no-plan"] ? false : true
      });
      console.log(formatRecord(record));
      return;
    }

    case "revise": {
      const record = await service.revise({
        promptId: flags.id,
        prompt: flags.prompt,
        note: flags.note
      });
      console.log(formatRecord(record));
      return;
    }

    case "approve": {
      const record = await service.approve({
        promptId: flags.id,
        approvedPrompt: flags.prompt
      });
      console.log(formatRecord(record));
      return;
    }

    case "reject": {
      const record = await service.reject({
        promptId: flags.id,
        reason: flags.reason
      });
      console.log(formatRecord(record));
      return;
    }

    case "show": {
      console.log(formatRecord(await service.get(flags.id)));
      return;
    }

    case "list": {
      console.log(
        JSON.stringify(
          await service.list({
            limit: Number(flags.limit || "20"),
            status: flags.status
          }),
          null,
          2
        )
      );
      return;
    }

    case "serve-http": {
      const host = flags.host ? String(flags.host) : undefined;
      const port = flags.port ? Number(flags.port) : undefined;
      await startHttpServer({ host, port, service });
      console.log(`ABK Enhance UI hazir: http://${host || "127.0.0.1"}:${port || 3334}`);
      return;
    }

    case "install": {
      const result = await installPromptGate({
        cwd: process.cwd(),
        dataDir: flags["data-dir"] ? String(flags["data-dir"]) : undefined,
        serverName: flags.name ? String(flags.name) : undefined,
        packageRef: flags["package-ref"] ? String(flags["package-ref"]) : undefined,
        agentFile: flags["agent-file"] ? String(flags["agent-file"]) : undefined,
        skipAgents: Boolean(flags["skip-agents"])
      });

      console.log(
        JSON.stringify(
          {
            ok: true,
            nextStep: "Bu repo icinde yeni bir Codex thread'i acin.",
            ...result
          },
          null,
          2
        )
      );
      return;
    }

    case "mcp-server": {
      await startStdioServer({ service });
      return;
    }

    default:
      printHelp();
      process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
