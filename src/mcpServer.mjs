import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function renderRecord(record) {
  const currentPrompt = record.status === "approved" ? record.approvedPrompt : record.draftPrompt;
  const hints =
    record.missingContextHints.length > 0
      ? `\nEksik olabilecek baglam notlari:\n${record.missingContextHints.map((hint) => `- ${hint}`).join("\n")}`
      : "";

  return [
    `prompt_id: ${record.id}`,
    `durum: ${record.status}`,
    `baslik: ${record.title}`,
    `task_type: ${record.taskType}`,
    `quality: ${record.qualityScore}/100 (${record.qualityLabel})`,
    "",
    "Prompt:",
    "```text",
    currentPrompt,
    "```",
    record.rejectedReason ? `\nRed nedeni: ${record.rejectedReason}` : "",
    hints,
    "",
    `revizyon_sayisi: ${record.revisions.length}`
  ]
    .filter(Boolean)
    .join("\n");
}

function renderPreview(preview) {
  const hints =
    preview.missingContextHints.length > 0
      ? `\nEksik olabilecek baglam notlari:\n${preview.missingContextHints.map((hint) => `- ${hint}`).join("\n")}`
      : "";

  return [
    `task_type: ${preview.taskType}`,
    `quality: ${preview.qualityScore}/100 (${preview.qualityLabel})`,
    "",
    "Onerilen prompt taslagi:",
    "```text",
    preview.prompt,
    "```",
    hints
  ]
    .filter(Boolean)
    .join("\n");
}

export function createPromptGateServer({ service }) {
  const server = new McpServer({
    name: "abk-pixel-prompt-gate",
    version: "0.2.0"
  });

  server.registerTool(
    "preview_codex_prompt",
    {
      description: "Generate a fast prompt preview without persisting any draft.",
      inputSchema: {
        problem: z.string().min(1),
        context: z.string().optional(),
        repoArea: z.union([z.string(), z.array(z.string())]).optional(),
        constraints: z.union([z.string(), z.array(z.string())]).optional(),
        validation: z.string().optional(),
        outputFormat: z.string().optional(),
        askForPlan: z.boolean().optional()
      }
    },
    async (input) => ({
      content: [
        {
          type: "text",
          text: renderPreview(await service.preview(input))
        }
      ]
    })
  );

  server.registerTool(
    "draft_codex_prompt",
    {
      description: "Turn a raw problem statement into a structured Codex prompt draft and store it for approval.",
      inputSchema: {
        problem: z.string().min(1),
        context: z.string().optional(),
        repoArea: z.union([z.string(), z.array(z.string())]).optional(),
        constraints: z.union([z.string(), z.array(z.string())]).optional(),
        validation: z.string().optional(),
        outputFormat: z.string().optional(),
        askForPlan: z.boolean().optional()
      }
    },
    async (input) => ({
      content: [
        {
          type: "text",
          text: renderRecord(await service.draft(input))
        }
      ]
    })
  );

  server.registerTool(
    "finalize_codex_prompt",
    {
      description: "Persist an approved prompt directly in a single call.",
      inputSchema: {
        problem: z.string().min(1),
        approvedPrompt: z.string().min(1),
        context: z.string().optional(),
        repoArea: z.union([z.string(), z.array(z.string())]).optional(),
        constraints: z.union([z.string(), z.array(z.string())]).optional(),
        validation: z.string().optional(),
        outputFormat: z.string().optional(),
        askForPlan: z.boolean().optional()
      }
    },
    async (input) => ({
      content: [
        {
          type: "text",
          text: renderRecord(await service.finalize(input))
        }
      ]
    })
  );

  server.registerTool(
    "revise_codex_prompt",
    {
      description: "Update a stored prompt draft. Approved prompts become draft again and require re-approval.",
      inputSchema: {
        promptId: z.string().min(1),
        prompt: z.string().min(1),
        note: z.string().optional()
      }
    },
    async ({ promptId, prompt, note }) => ({
      content: [
        {
          type: "text",
          text: renderRecord(await service.revise({ promptId, prompt, note }))
        }
      ]
    })
  );

  server.registerTool(
    "approve_codex_prompt",
    {
      description: "Approve a stored prompt. Optionally pass an edited final prompt body.",
      inputSchema: {
        promptId: z.string().min(1),
        approvedPrompt: z.string().optional()
      }
    },
    async ({ promptId, approvedPrompt }) => ({
      content: [
        {
          type: "text",
          text: renderRecord(await service.approve({ promptId, approvedPrompt }))
        }
      ]
    })
  );

  server.registerTool(
    "reject_codex_prompt",
    {
      description: "Reject a stored prompt and capture the reason.",
      inputSchema: {
        promptId: z.string().min(1),
        reason: z.string().optional()
      }
    },
    async ({ promptId, reason }) => ({
      content: [
        {
          type: "text",
          text: renderRecord(await service.reject({ promptId, reason }))
        }
      ]
    })
  );

  server.registerTool(
    "get_codex_prompt",
    {
      description: "Fetch a stored prompt by id.",
      inputSchema: {
        promptId: z.string().min(1)
      }
    },
    async ({ promptId }) => ({
      content: [
        {
          type: "text",
          text: renderRecord(await service.get(promptId))
        }
      ]
    })
  );

  server.registerTool(
    "list_codex_prompts",
    {
      description: "List recent prompt drafts and approvals.",
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional(),
        status: z.enum(["draft", "approved", "rejected"]).optional()
      }
    },
    async ({ limit = 20, status }) => {
      const items = await service.list({ limit, status });
      const body =
        items.length === 0
          ? "Kayitli prompt yok."
          : items
              .map(
                (item) =>
                  `- ${item.id} | ${item.status} | ${item.taskType} | ${item.qualityScore}/100 | ${item.title}`
              )
              .join("\n");

      return {
        content: [
          {
            type: "text",
            text: body
          }
        ]
      };
    }
  );

  server.registerTool(
    "codex_prompt_gate_stats",
    {
      description: "Return prompt lifecycle statistics for this server.",
      inputSchema: {}
    },
    async () => {
      const stats = await service.stats();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(stats, null, 2)
          }
        ]
      };
    }
  );

  server.registerPrompt(
    "codex-gated-workflow",
    {
      description: "Returns the recommended agent workflow for using the prompt gate.",
      argsSchema: {
        task: z.string().optional()
      }
    },
    async ({ task }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              "Kullanici bir teknik sorun anlattiginda dogrudan uygulamaya gecme.",
              "Once preview_codex_prompt ile hizli bir prompt taslagi uret.",
              "Taslagi goster, kullanicidan acik onay al.",
              "Onay gelmeden degisiklik veya analiz tamamlama.",
              "Onay gelirse finalize_codex_prompt ile promptu tek adimda kaydet.",
              "Onaydan sonra sadece onayli prompt uzerinden calis.",
              task ? `Bu oturumun gorevi: ${task}` : ""
            ]
              .filter(Boolean)
              .join("\n")
          }
        }
      ]
    })
  );

  server.registerResource(
    "workflow-guide",
    "abk-pixel-prompt-gate://guides/workflow",
    {
      mimeType: "text/plain",
      description: "Workflow guide for the draft -> revise -> approve -> execute loop."
    },
    async () => ({
      contents: [
        {
          uri: "abk-pixel-prompt-gate://guides/workflow",
          text: [
            "1. preview_codex_prompt",
            "2. Kullanici duzeltir veya aynen kabul eder",
            "3. finalize_codex_prompt",
            "4. Onayli prompt ile asil goreve gec"
          ].join("\n")
        }
      ]
    })
  );

  server.registerResource(
    "agent-rule",
    "abk-pixel-prompt-gate://guides/agent-rule",
    {
      mimeType: "text/plain",
      description: "Recommended agent rule text for enforcing the gated workflow."
    },
    async () => ({
      contents: [
        {
          uri: "abk-pixel-prompt-gate://guides/agent-rule",
          text: [
            "Kullanici bir sorun anlattiginda once promptu iyilestir.",
            "Kullanici onay vermeden uygulamaya gecme.",
            "Onayli prompt disina cikma.",
            "Yeni bilgi gelirse promptu yeniden duzenleyip tekrar onay al."
          ].join("\n")
        }
      ]
    })
  );

  return server;
}
