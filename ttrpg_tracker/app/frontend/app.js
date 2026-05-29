const today = () => new Date().toISOString().slice(0, 10);

const state = {
  sessions: [],
  campaigns: [],
  systems: [],
  sortKey: "date",
  sortDirection: "desc",
  search: "",
  filters: {
    campaign: "",
    gm: "",
    system: "",
  },
};

const els = {
  tabs: document.querySelectorAll(".tab-button"),
  panels: document.querySelectorAll("[data-panel]"),
  sessionCount: document.querySelector("#session-count"),
  status: document.querySelector("#status"),
  search: document.querySelector("#search"),
  campaignFilter: document.querySelector("#campaign-filter"),
  gmFilter: document.querySelector("#gm-filter"),
  systemFilter: document.querySelector("#system-filter"),
  sessionsBody: document.querySelector("#sessions-body"),
  campaignsBody: document.querySelector("#campaigns-body"),
  systemsBody: document.querySelector("#systems-body"),
  quickAddList: document.querySelector("#quick-add-list"),
  toast: document.querySelector("#toast"),
  sessionDialog: document.querySelector("#session-dialog"),
  sessionForm: document.querySelector("#session-form"),
  sessionDialogTitle: document.querySelector("#session-dialog-title"),
  campaignForm: document.querySelector("#campaign-form"),
  systemForm: document.querySelector("#system-form"),
  gmOptions: document.querySelector("#gm-options"),
};

document.addEventListener("click", handleDocumentClick);
document.addEventListener("change", handleDocumentChange);
els.search.addEventListener("input", (event) => {
  state.search = event.target.value.trim().toLocaleLowerCase();
  renderSessions();
});
els.campaignFilter.addEventListener("change", (event) => {
  state.filters.campaign = event.target.value;
  renderSessions();
});
els.gmFilter.addEventListener("change", (event) => {
  state.filters.gm = event.target.value;
  renderSessions();
});
els.systemFilter.addEventListener("change", (event) => {
  state.filters.system = event.target.value;
  renderSessions();
});
els.sessionForm.addEventListener("submit", saveSession);
els.campaignForm.addEventListener("submit", saveCampaign);
els.systemForm.addEventListener("submit", saveSystem);

loadAll();

async function loadAll() {
  try {
    const [sessions, campaigns, systems] = await Promise.all([
      api("/api/sessions"),
      api("/api/campaigns"),
      api("/api/systems"),
    ]);
    state.sessions = sessions;
    state.campaigns = campaigns;
    state.systems = systems;
    renderAll();
    els.status.textContent = "Ready";
  } catch (error) {
    showToast(error.message, true);
    els.status.textContent = "Could not load data";
  }
}

function renderAll() {
  renderFilters();
  renderQuickAdd();
  renderSessions();
  renderCampaigns();
  renderSystems();
  renderGmOptions();
  populateSystemSelects();
  populateCampaignSelect();
}

function renderFilters() {
  fillSelect(els.campaignFilter, [
    ["", "All campaigns"],
    ["__one_shot", "One-shots"],
    ...state.campaigns.map((campaign) => [String(campaign.id), campaign.name]),
  ], state.filters.campaign);
  fillSelect(els.gmFilter, [
    ["", "All GMs"],
    ...unique(state.sessions.map((session) => session.gm)).map((gm) => [gm, gm]),
  ], state.filters.gm);
  fillSelect(els.systemFilter, [
    ["", "All systems"],
    ...state.systems.map((system) => [String(system.id), system.name]),
  ], state.filters.system);
}

function renderQuickAdd() {
  const activeCampaigns = state.campaigns.filter((campaign) => !campaign.archived);
  if (activeCampaigns.length === 0) {
    els.quickAddList.innerHTML = `<p class="empty">No active campaigns.</p>`;
    return;
  }

  els.quickAddList.innerHTML = activeCampaigns
    .map((campaign) => {
      return `
        <button class="quick-card" type="button" data-quick-add="${campaign.id}">
          <span class="plus">+</span>
          <span>${escapeHtml(campaign.name)}</span>
          <small>${escapeHtml(campaign.system_name)} / ${escapeHtml(campaign.default_gm)}</small>
        </button>
      `;
    })
    .join("");
}

function renderSessions() {
  const rows = filteredSessions().sort(compareSessions);
  els.sessionCount.textContent = state.sessions.length.toString();
  els.status.textContent = rows.length === state.sessions.length ? "Ready" : `${rows.length} shown`;

  if (rows.length === 0) {
    els.sessionsBody.innerHTML = `<tr><td class="empty" colspan="7">No sessions found.</td></tr>`;
    return;
  }

  els.sessionsBody.innerHTML = rows.map(sessionRow).join("");
}

function renderCampaigns() {
  if (state.campaigns.length === 0) {
    els.campaignsBody.innerHTML = `<tr><td class="empty" colspan="5">No campaigns yet.</td></tr>`;
    return;
  }

  els.campaignsBody.innerHTML = state.campaigns
    .map((campaign) => {
      const status = campaign.archived ? "Archived" : "Active";
      const archiveLabel = campaign.archived ? "Unarchive" : "Archive";
      return `
        <tr>
          <td data-label="Name">${escapeHtml(campaign.name)}</td>
          <td data-label="GM">${escapeHtml(campaign.default_gm)}</td>
          <td data-label="System">
            <span class="swatch" style="background:${escapeAttribute(campaign.system_color)}"></span>
            ${escapeHtml(campaign.system_name)}
          </td>
          <td data-label="Status">${status}</td>
          <td data-label="Actions" class="actions">
            <button type="button" data-edit-campaign="${campaign.id}">Edit</button>
            <button type="button" data-archive-campaign="${campaign.id}">${archiveLabel}</button>
            <button type="button" data-delete-campaign="${campaign.id}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderSystems() {
  if (state.systems.length === 0) {
    els.systemsBody.innerHTML = `<tr><td class="empty" colspan="3">No systems yet.</td></tr>`;
    return;
  }

  els.systemsBody.innerHTML = state.systems
    .map((system) => {
      return `
        <tr>
          <td data-label="Name">${escapeHtml(system.name)}</td>
          <td data-label="Color">
            <span class="swatch" style="background:${escapeAttribute(system.color)}"></span>
            ${escapeHtml(system.color)}
          </td>
          <td data-label="Actions" class="actions">
            <button type="button" data-edit-system="${system.id}">Edit</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderGmOptions() {
  els.gmOptions.innerHTML = unique([
    ...state.sessions.map((session) => session.gm),
    ...state.campaigns.map((campaign) => campaign.default_gm),
  ])
    .map((gm) => `<option value="${escapeAttribute(gm)}"></option>`)
    .join("");
}

function populateSystemSelects() {
  const regularOptions = state.systems.map((system) => [String(system.id), system.name]);
  fillSelect(document.querySelector("#campaign-system"), regularOptions);
  fillSelect(document.querySelector("#session-system"), [
    ...regularOptions,
    ["__new", "+ New system"],
  ]);
}

function populateCampaignSelect() {
  fillSelect(
    document.querySelector("#session-campaign"),
    state.campaigns
      .filter((campaign) => !campaign.archived)
      .map((campaign) => [String(campaign.id), campaign.name]),
  );
}

function sessionRow(session) {
  const kind = session.campaign_id ? "Campaign" : "One-shot";
  const link = session.link
    ? `<a href="${escapeAttribute(session.link)}" target="_blank" rel="noreferrer">Open</a>`
    : `<span class="muted">None</span>`;

  return `
    <tr>
      <td data-label="Date">${formatDate(session.date)}</td>
      <td data-label="${kind}">
        <span class="chip" style="background:${escapeAttribute(session.system_color)}">
          ${escapeHtml(session.display_name)}
        </span>
      </td>
      <td data-label="GM">${escapeHtml(session.gm)}</td>
      <td data-label="System">${escapeHtml(session.system_name)}</td>
      <td data-label="Kind">${kind}</td>
      <td data-label="Link">${link}</td>
      <td data-label="Actions" class="actions">
        <button type="button" data-edit-session="${session.id}">Edit</button>
        <button type="button" data-delete-session-row="${session.id}">Delete</button>
      </td>
    </tr>
  `;
}

function filteredSessions() {
  return state.sessions.filter((session) => {
    const matchesSearch = !state.search || [
      session.display_name,
      session.gm,
      session.system_name,
      session.date,
    ].join(" ").toLocaleLowerCase().includes(state.search);

    const matchesCampaign = !state.filters.campaign
      || (state.filters.campaign === "__one_shot" && !session.campaign_id)
      || String(session.campaign_id) === state.filters.campaign;
    const matchesGm = !state.filters.gm || session.gm === state.filters.gm;
    const matchesSystem = !state.filters.system || String(session.system_id) === state.filters.system;

    return matchesSearch && matchesCampaign && matchesGm && matchesSystem;
  });
}

function compareSessions(a, b) {
  const left = String(a[state.sortKey] ?? "").toLocaleLowerCase();
  const right = String(b[state.sortKey] ?? "").toLocaleLowerCase();
  const result = left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base",
  });
  return state.sortDirection === "asc" ? result : -result;
}

function handleDocumentClick(event) {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }

  if (target.matches("[data-tab]")) {
    setActiveTab(target.dataset.tab);
  } else if (target.matches("[data-sort]")) {
    setSort(target.dataset.sort);
  } else if (target.id === "add-session") {
    openSessionDialog();
  } else if (target.matches("[data-quick-add]")) {
    openSessionDialog({ campaignId: Number(target.dataset.quickAdd) });
  } else if (target.matches("[data-edit-session]")) {
    openSessionDialog({ sessionId: Number(target.dataset.editSession) });
  } else if (target.matches("[data-delete-session-row]")) {
    deleteSession(Number(target.dataset.deleteSessionRow));
  } else if (target.id === "close-session") {
    els.sessionDialog.close();
  } else if (target.id === "delete-session") {
    const id = Number(document.querySelector("#session-id").value);
    if (id) deleteSession(id);
  } else if (target.matches("[data-edit-campaign]")) {
    editCampaign(Number(target.dataset.editCampaign));
  } else if (target.matches("[data-archive-campaign]")) {
    toggleCampaignArchive(Number(target.dataset.archiveCampaign));
  } else if (target.matches("[data-delete-campaign]")) {
    deleteCampaign(Number(target.dataset.deleteCampaign));
  } else if (target.id === "clear-campaign") {
    clearCampaignForm();
  } else if (target.matches("[data-edit-system]")) {
    editSystem(Number(target.dataset.editSystem));
  } else if (target.id === "clear-system") {
    clearSystemForm();
  } else if (target.id === "export-json") {
    downloadExport("/api/export", "ttrpg-export.json");
  } else if (target.id === "export-csv") {
    downloadExport("/api/export.csv", "ttrpg-export.csv");
  }
}

function handleDocumentChange(event) {
  if (event.target.id === "session-kind") {
    syncSessionKind();
  } else if (event.target.id === "session-campaign") {
    applyCampaignDefaults(Number(event.target.value));
  } else if (event.target.id === "session-system") {
    syncNewSystemFields();
  }
}

function setActiveTab(tab) {
  els.tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.tab === tab));
  els.panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === tab));
}

function setSort(key) {
  if (state.sortKey === key) {
    state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
  } else {
    state.sortKey = key;
    state.sortDirection = key === "date" ? "desc" : "asc";
  }
  renderSessions();
}

function openSessionDialog(options = {}) {
  els.sessionForm.reset();
  document.querySelector("#session-id").value = "";
  document.querySelector("#session-date").value = today();
  document.querySelector("#delete-session").hidden = true;
  els.sessionDialogTitle.textContent = "Add Session";

  if (options.sessionId) {
    const session = findById(state.sessions, options.sessionId);
    document.querySelector("#session-id").value = session.id;
    document.querySelector("#session-date").value = session.date;
    document.querySelector("#session-gm").value = session.gm;
    document.querySelector("#session-system").value = String(session.system_id);
    document.querySelector("#session-link").value = session.link ?? "";
    document.querySelector("#session-notes").value = session.notes ?? "";
    document.querySelector("#delete-session").hidden = false;
    els.sessionDialogTitle.textContent = "Edit Session";

    if (session.campaign_id) {
      document.querySelector("#session-kind").value = "campaign";
      document.querySelector("#session-campaign").value = String(session.campaign_id);
    } else {
      document.querySelector("#session-kind").value = "one-shot";
      document.querySelector("#session-name").value = session.name ?? session.display_name;
    }
  } else if (options.campaignId) {
    document.querySelector("#session-kind").value = "campaign";
    document.querySelector("#session-campaign").value = String(options.campaignId);
    applyCampaignDefaults(options.campaignId);
  } else {
    document.querySelector("#session-kind").value = state.campaigns.length ? "campaign" : "one-shot";
    const campaign = state.campaigns.find((item) => !item.archived);
    if (campaign) {
      document.querySelector("#session-campaign").value = String(campaign.id);
      applyCampaignDefaults(campaign.id);
    }
  }

  syncSessionKind();
  syncNewSystemFields();
  els.sessionDialog.showModal();
}

function syncSessionKind() {
  const kind = document.querySelector("#session-kind").value;
  document.querySelectorAll("[data-session-group]").forEach((group) => {
    group.hidden = group.dataset.sessionGroup !== kind;
  });
}

function syncNewSystemFields() {
  document.querySelector("#session-new-system-fields").hidden =
    document.querySelector("#session-system").value !== "__new";
}

function applyCampaignDefaults(campaignId) {
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) {
    return;
  }
  document.querySelector("#session-gm").value = campaign.default_gm;
  document.querySelector("#session-system").value = String(campaign.system_id);
  document.querySelector("#session-link").value = campaign.default_link ?? "";
  syncNewSystemFields();
}

async function saveSession(event) {
  event.preventDefault();
  try {
    const id = Number(document.querySelector("#session-id").value);
    const kind = document.querySelector("#session-kind").value;
    const systemId = await resolveSessionSystemId();
    let campaignId = null;
    let name = null;
    let gm = document.querySelector("#session-gm").value.trim();

    if (kind === "campaign") {
      campaignId = Number(document.querySelector("#session-campaign").value);
    } else if (kind === "new-campaign") {
      const campaign = await api("/api/campaigns", {
        method: "POST",
        body: {
          name: document.querySelector("#session-new-campaign-name").value.trim(),
          default_gm: document.querySelector("#session-new-campaign-gm").value.trim() || gm,
          system_id: systemId,
          default_link: document.querySelector("#session-link").value.trim() || null,
        },
      });
      campaignId = campaign.id;
      state.campaigns.push(campaign);
    } else {
      name = document.querySelector("#session-name").value.trim();
    }

    const payload = {
      campaign_id: campaignId,
      name,
      date: document.querySelector("#session-date").value,
      gm,
      system_id: systemId,
      link: valueOrNull("#session-link"),
      notes: valueOrNull("#session-notes"),
    };
    const saved = await api(id ? `/api/sessions/${id}` : "/api/sessions", {
      method: id ? "PUT" : "POST",
      body: payload,
    });

    upsert(state.sessions, saved);
    els.sessionDialog.close();
    await refreshLists();
    showToast("Session saved");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function resolveSessionSystemId() {
  const select = document.querySelector("#session-system");
  if (select.value !== "__new") {
    return Number(select.value);
  }
  const system = await api("/api/systems", {
    method: "POST",
    body: {
      name: document.querySelector("#session-new-system-name").value.trim(),
      color: document.querySelector("#session-new-system-color").value,
    },
  });
  state.systems.push(system);
  populateSystemSelects();
  return system.id;
}

async function deleteSession(id) {
  if (!window.confirm("Delete this session?")) {
    return;
  }
  try {
    await api(`/api/sessions/${id}`, { method: "DELETE" });
    state.sessions = state.sessions.filter((session) => session.id !== id);
    els.sessionDialog.close();
    renderAll();
    showToast("Session deleted");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function saveCampaign(event) {
  event.preventDefault();
  try {
    const id = Number(document.querySelector("#campaign-id").value);
    const payload = {
      name: document.querySelector("#campaign-name").value.trim(),
      default_gm: document.querySelector("#campaign-gm").value.trim(),
      system_id: Number(document.querySelector("#campaign-system").value),
      default_link: valueOrNull("#campaign-link"),
      archived: document.querySelector("#campaign-archived").checked ? 1 : 0,
    };
    const saved = await api(id ? `/api/campaigns/${id}` : "/api/campaigns", {
      method: id ? "PUT" : "POST",
      body: payload,
    });
    upsert(state.campaigns, saved);
    clearCampaignForm();
    renderAll();
    showToast("Campaign saved");
  } catch (error) {
    showToast(error.message, true);
  }
}

function editCampaign(id) {
  const campaign = findById(state.campaigns, id);
  setActiveTab("campaigns");
  document.querySelector("#campaign-id").value = campaign.id;
  document.querySelector("#campaign-name").value = campaign.name;
  document.querySelector("#campaign-gm").value = campaign.default_gm;
  document.querySelector("#campaign-system").value = String(campaign.system_id);
  document.querySelector("#campaign-link").value = campaign.default_link ?? "";
  document.querySelector("#campaign-archived").checked = Boolean(campaign.archived);
}

async function toggleCampaignArchive(id) {
  const campaign = findById(state.campaigns, id);
  try {
    const saved = await api(`/api/campaigns/${id}`, {
      method: "PUT",
      body: { archived: campaign.archived ? 0 : 1 },
    });
    upsert(state.campaigns, saved);
    renderAll();
    showToast(saved.archived ? "Campaign archived" : "Campaign active");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function deleteCampaign(id) {
  if (!window.confirm("Delete this campaign? Campaigns with sessions must be archived instead.")) {
    return;
  }
  try {
    await api(`/api/campaigns/${id}`, { method: "DELETE" });
    state.campaigns = state.campaigns.filter((campaign) => campaign.id !== id);
    renderAll();
    showToast("Campaign deleted");
  } catch (error) {
    showToast(error.message, true);
  }
}

function clearCampaignForm() {
  els.campaignForm.reset();
  document.querySelector("#campaign-id").value = "";
}

async function saveSystem(event) {
  event.preventDefault();
  try {
    const id = Number(document.querySelector("#system-id").value);
    const payload = {
      name: document.querySelector("#system-name").value.trim(),
      color: document.querySelector("#system-color").value,
    };
    const saved = await api(id ? `/api/systems/${id}` : "/api/systems", {
      method: id ? "PUT" : "POST",
      body: payload,
    });
    upsert(state.systems, saved);
    clearSystemForm();
    await refreshLists();
    showToast("System saved");
  } catch (error) {
    showToast(error.message, true);
  }
}

function editSystem(id) {
  const system = findById(state.systems, id);
  setActiveTab("systems");
  document.querySelector("#system-id").value = system.id;
  document.querySelector("#system-name").value = system.name;
  document.querySelector("#system-color").value = system.color;
}

function clearSystemForm() {
  els.systemForm.reset();
  document.querySelector("#system-id").value = "";
  document.querySelector("#system-color").value = "#58b6a9";
}

async function refreshLists() {
  const [sessions, campaigns, systems] = await Promise.all([
    api("/api/sessions"),
    api("/api/campaigns"),
    api("/api/systems"),
  ]);
  state.sessions = sessions;
  state.campaigns = campaigns;
  state.systems = systems;
  renderAll();
}

async function downloadExport(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(await errorText(response));
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    showToast("Export downloaded");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    throw new Error(await errorText(response));
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

async function errorText(response) {
  try {
    const data = await response.json();
    return data.detail ?? `Request failed with ${response.status}`;
  } catch {
    return `Request failed with ${response.status}`;
  }
}

function fillSelect(select, options, selected = select.value) {
  select.innerHTML = options
    .map(([value, label]) => {
      return `<option value="${escapeAttribute(value)}">${escapeHtml(label)}</option>`;
    })
    .join("");
  if ([...select.options].some((option) => option.value === selected)) {
    select.value = selected;
  }
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function findById(items, id) {
  return items.find((item) => item.id === id);
}

function upsert(items, item) {
  const index = items.findIndex((candidate) => candidate.id === item.id);
  if (index === -1) {
    items.push(item);
  } else {
    items[index] = item;
  }
}

function valueOrNull(selector) {
  const value = document.querySelector(selector).value.trim();
  return value || null;
}

function showToast(message, isError = false) {
  els.toast.textContent = message;
  els.toast.classList.toggle("is-error", isError);
  els.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, 2600);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
