const state = {
  currentId: null,
  currentItem: null
};

const elements = {
  draftForm: document.querySelector("#draft-form"),
  problem: document.querySelector("#problem"),
  context: document.querySelector("#context"),
  repoArea: document.querySelector("#repoArea"),
  constraints: document.querySelector("#constraints"),
  validation: document.querySelector("#validation"),
  outputFormat: document.querySelector("#outputFormat"),
  askForPlan: document.querySelector("#askForPlan"),
  promptEditor: document.querySelector("#promptEditor"),
  note: document.querySelector("#note"),
  statusLine: document.querySelector("#status-line"),
  meta: document.querySelector("#meta"),
  hints: document.querySelector("#hints"),
  promptList: document.querySelector("#promptList"),
  stats: document.querySelector("#stats"),
  reviseBtn: document.querySelector("#reviseBtn"),
  approveBtn: document.querySelector("#approveBtn"),
  rejectBtn: document.querySelector("#rejectBtn")
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Istek basarisiz oldu.");
  }

  return payload;
}

function setCurrent(item) {
  state.currentId = item?.id || null;
  state.currentItem = item || null;

  if (!item) {
    elements.statusLine.textContent = "Henuz bir prompt secilmedi.";
    elements.meta.innerHTML = "";
    elements.promptEditor.value = "";
    elements.hints.innerHTML = "";
    return;
  }

  const currentPrompt = item.status === "approved" ? item.approvedPrompt : item.draftPrompt;
  elements.statusLine.textContent = `${item.title} | ${item.status}`;
  elements.meta.innerHTML = `
    <span class="pill">${item.taskType}</span>
    <span class="pill">quality ${item.qualityScore}/100</span>
    <span class="pill">${item.revisions.length} revizyon</span>
  `;
  elements.promptEditor.value = currentPrompt;
  elements.hints.innerHTML = item.missingContextHints.length
    ? item.missingContextHints.map((hint) => `<li>${hint}</li>`).join("")
    : "<li>Eksik baglam sinyali yok.</li>";
}

function renderStats(stats) {
  elements.stats.innerHTML = `
    <div class="stat-card">
      <strong>${stats.total}</strong>
      <span>Toplam prompt</span>
    </div>
    <div class="stat-card">
      <strong>${stats.counts.draft}</strong>
      <span>Taslak</span>
    </div>
    <div class="stat-card">
      <strong>${stats.counts.approved}</strong>
      <span>Onayli</span>
    </div>
    <div class="stat-card">
      <strong>${stats.counts.rejected}</strong>
      <span>Reddedilen</span>
    </div>
  `;
}

function renderList(items) {
  if (items.length === 0) {
    elements.promptList.innerHTML = "<p class='empty'>Kayitli prompt yok.</p>";
    return;
  }

  elements.promptList.innerHTML = items
    .map(
      (item) => `
        <button class="list-item ${item.id === state.currentId ? "active" : ""}" data-id="${item.id}">
          <span class="list-top">
            <strong>${item.title}</strong>
            <em>${item.status}</em>
          </span>
          <span class="list-bottom">
            <span>${item.taskType}</span>
            <span>${item.qualityScore}/100</span>
          </span>
        </button>
      `
    )
    .join("");

  document.querySelectorAll(".list-item").forEach((button) => {
    button.addEventListener("click", async () => {
      const payload = await api(`/api/prompts/${button.dataset.id}`);
      setCurrent(payload.item);
      await refreshList();
    });
  });
}

async function refreshList() {
  const [listPayload, statsPayload] = await Promise.all([
    api("/api/prompts"),
    api("/api/stats")
  ]);
  renderList(listPayload.items);
  renderStats(statsPayload);
}

elements.draftForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = await api("/api/prompts/draft", {
    method: "POST",
    body: JSON.stringify({
      problem: elements.problem.value,
      context: elements.context.value,
      repoArea: elements.repoArea.value ? [elements.repoArea.value] : [],
      constraints: elements.constraints.value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      validation: elements.validation.value,
      outputFormat: elements.outputFormat.value,
      askForPlan: elements.askForPlan.checked
    })
  });

  setCurrent(payload.item);
  elements.note.value = "";
  await refreshList();
});

elements.reviseBtn.addEventListener("click", async () => {
  if (!state.currentId) {
    return;
  }

  const payload = await api(`/api/prompts/${state.currentId}/revise`, {
    method: "POST",
    body: JSON.stringify({
      prompt: elements.promptEditor.value,
      note: elements.note.value
    })
  });

  setCurrent(payload.item);
  await refreshList();
});

elements.approveBtn.addEventListener("click", async () => {
  if (!state.currentId) {
    return;
  }

  const payload = await api(`/api/prompts/${state.currentId}/approve`, {
    method: "POST",
    body: JSON.stringify({
      approvedPrompt: elements.promptEditor.value
    })
  });

  setCurrent(payload.item);
  await refreshList();
});

elements.rejectBtn.addEventListener("click", async () => {
  if (!state.currentId) {
    return;
  }

  const payload = await api(`/api/prompts/${state.currentId}/reject`, {
    method: "POST",
    body: JSON.stringify({
      reason: elements.note.value
    })
  });

  setCurrent(payload.item);
  await refreshList();
});

refreshList().catch((error) => {
  elements.promptList.innerHTML = `<p class="empty">${error.message}</p>`;
});
