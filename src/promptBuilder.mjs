const TASK_PATTERNS = [
  {
    type: "review",
    patterns: ["review", "code review", "pr", "pull request", "incele", "inceleme"]
  },
  {
    type: "bug_fix",
    patterns: ["bug", "hata", "duzelt", "fix", "sorun", "crash", "bozul", "yanlis"]
  },
  {
    type: "refactor",
    patterns: ["refactor", "sadelestir", "temizle", "clean up", "yeniden duzenle"]
  },
  {
    type: "documentation",
    patterns: ["dokuman", "documentation", "readme", "md", "doc", "runbook"]
  },
  {
    type: "test",
    patterns: ["test", "coverage", "spec", "senaryo", "unit test", "integration"]
  },
  {
    type: "feature",
    patterns: ["ekle", "implement", "feature", "ozellik", "create", "build"]
  }
];

function normalizeLines(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildQualityScore({ contextLines, repoAreas, constraints, validation, outputFormat }) {
  let score = 40;

  if (contextLines.length > 0) {
    score += 15;
  }

  if (repoAreas.length > 0) {
    score += 15;
  }

  if (constraints.length > 0) {
    score += 10;
  }

  if (validation) {
    score += 10;
  }

  if (outputFormat) {
    score += 10;
  }

  return Math.min(score, 100);
}

function getQualityLabel(score) {
  if (score >= 85) {
    return "strong";
  }

  if (score >= 65) {
    return "solid";
  }

  return "rough";
}

function detectTaskType(problem) {
  const haystack = problem.toLowerCase();

  for (const entry of TASK_PATTERNS) {
    if (entry.patterns.some((pattern) => haystack.includes(pattern))) {
      return entry.type;
    }
  }

  return "analysis";
}

function getDefaultConstraints(taskType) {
  switch (taskType) {
    case "review":
      return [
        "Ovguden cok bulgulara odaklan.",
        "Davranis bozulmasi, edge case ve test bosluklarini oncele."
      ];
    case "bug_fix":
      return [
        "Minimal ve hedefe yonelik bir duzeltme yap.",
        "Ilgisiz refactor'a girme."
      ];
    case "refactor":
      return [
        "Davranisi degistirme.",
        "Public API sabit kalsin."
      ];
    case "documentation":
      return [
        "Dokumani kisa, taranabilir ve yeni gelen bir muhendisin anlayacagi sekilde yaz."
      ];
    case "test":
      return [
        "En kritik senaryolari oncele.",
        "Gereksiz tekrar iceren testler yazma."
      ];
    case "feature":
      return [
        "Mevcut kod kaliplarina ve mimariye uy.",
        "Kapsam disi degisiklik yapma."
      ];
    default:
      return [
        "Kapsam disina cikma.",
        "Varsayimlari acikca belirt."
      ];
  }
}

function getDefaultValidation(taskType) {
  switch (taskType) {
    case "review":
      return "Bulgulari oncelik sirasiyla, dosya/satir referanslariyla yaz. Eger bulgu yoksa bunu acikca belirt ve kalan riskleri ekle.";
    case "documentation":
      return "Dokumanin kapsamli ama kisa oldugunu, basliklarin taranabilir oldugunu kontrol et.";
    case "test":
      return "Eklenen veya guncellenen testleri calistir. Calistiramiyorsan nedeni net sekilde yaz.";
    default:
      return "Ilgili testleri veya dogrulama adimlarini calistir. Calistiramiyorsan nedeni net sekilde yaz.";
  }
}

function getDefaultOutput(taskType) {
  switch (taskType) {
    case "review":
      return "Once bulgulari yaz, sonra kisa bir ozet ve kalan riskleri ekle.";
    case "documentation":
      return "Sonucu Markdown olarak ver ve kapsami kisa ozetle.";
    default:
      return "Yapilan degisiklikleri, calisan dogrulama adimlarini ve kalan riskleri kisa ozetle.";
  }
}

function buildMissingContextHints({ repoArea, constraints, validation, outputFormat }) {
  const hints = [];

  if (!repoArea) {
    hints.push("Ilgili klasor veya dosya belirtilirse prompt daha hedefli olur.");
  }

  if (constraints.length === 0) {
    hints.push("Degismemesi gereken davranislar veya kontratlar eklenebilir.");
  }

  if (!validation) {
    hints.push("Hangi test veya dogrulama beklendigi belirtilirse cikti kalitesi artar.");
  }

  if (!outputFormat) {
    hints.push("Istenen cikti formati belirtilirse ozet daha kullanisli olur.");
  }

  return hints;
}

export function buildCodexPrompt(input) {
  const taskType = detectTaskType(input.problem);
  const constraints = normalizeLines(input.constraints);
  const repoAreas = normalizeLines(input.repoArea);
  const contextLines = normalizeLines(input.context);
  const manualValidation = input.validation?.trim();
  const manualOutput = input.outputFormat?.trim();
  const askForPlan = input.askForPlan !== false;

  const effectiveConstraints = [
    ...getDefaultConstraints(taskType),
    ...constraints
  ];

  const sections = [];
  sections.push(`Amac: ${input.problem.trim()}`);

  if (contextLines.length > 0) {
    sections.push(["Baglam:", ...contextLines.map((line) => `- ${line}`)].join("\n"));
  }

  if (repoAreas.length > 0) {
    sections.push(["Ilgili alan:", ...repoAreas.map((line) => `- ${line}`)].join("\n"));
  }

  sections.push(
    [
      "Calisma sekli:",
      "- Kod degistirmeden once ilgili alanlari incele.",
      askForPlan ? "- Kisa bir plan veya yaklasim ozeti ver." : "- Gerekli varsayimlari acikca belirt."
    ].join("\n")
  );

  sections.push(
    ["Sinirlar:", ...effectiveConstraints.map((line) => `- ${line}`)].join("\n")
  );

  sections.push(`Dogrulama: ${manualValidation || getDefaultValidation(taskType)}`);
  sections.push(`Cikti: ${manualOutput || getDefaultOutput(taskType)}`);
  sections.push(
    [
      "Ek kurallar:",
      "- Varsayim yapman gerekirse acikca belirt.",
      "- Riskli veya yikici bir adim atmadan once dur ve belirt.",
      "- Kapsam disina cikma."
    ].join("\n")
  );

  const prompt = sections.join("\n\n");
  const missingContextHints = buildMissingContextHints({
    repoArea: repoAreas.join("\n"),
    constraints,
    validation: manualValidation,
    outputFormat: manualOutput
  });
  const qualityScore = buildQualityScore({
    contextLines,
    repoAreas,
    constraints,
    validation: manualValidation,
    outputFormat: manualOutput
  });

  return {
    taskType,
    prompt,
    missingContextHints,
    qualityScore,
    qualityLabel: getQualityLabel(qualityScore)
  };
}
