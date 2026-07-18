const today = () => toISODate(new Date());
const currentMonth = () => today().slice(0, 7);
const currentYear = () => today().slice(0, 4);

const SYSTEM_COLOR_PALETTE = [
  "#d46a6a",
  "#f0b84f",
  "#58b6a9",
  "#7d91e8",
  "#b56bd3",
  "#6aa05f",
  "#e58f55",
  "#6bb7d8",
  "#c36b8f",
  "#9aa35c",
];

const state = {
  sessions: [],
  campaigns: [],
  systems: [],
  calendarDate: startOfMonth(new Date()),
  statsMonth: currentMonth(),
  statsPickerYear: Number(currentYear()),
  sessionDatePickerMonth: startOfMonth(new Date()),
  reviewYear: currentYear(),
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
  subtabButtons: document.querySelectorAll(".subtab-button"),
  subpanels: document.querySelectorAll("[data-subpanel]"),
  sessionCount: document.querySelector("#session-count"),
  status: document.querySelector("#status"),
  search: document.querySelector("#search"),
  campaignFilter: document.querySelector("#campaign-filter"),
  gmFilter: document.querySelector("#gm-filter"),
  systemFilter: document.querySelector("#system-filter"),
  calendarTitle: document.querySelector("#calendar-title"),
  calendarStatus: document.querySelector("#calendar-status"),
  calendarGrid: document.querySelector("#calendar-grid"),
  calendarAgenda: document.querySelector("#calendar-agenda"),
  calendarPrevSession: document.querySelector("#calendar-prev-session"),
  calendarNextSession: document.querySelector("#calendar-next-session"),
  statsStatus: document.querySelector("#stats-status"),
  statsMonth: document.querySelector("#stats-month"),
  statsMonthTrigger: document.querySelector("#stats-month-trigger"),
  statsMonthDisplay: document.querySelector("#stats-month-display"),
  statsMonthPicker: document.querySelector("#stats-month-picker"),
  statsContent: document.querySelector("#stats-content"),
  yearStatus: document.querySelector("#year-status"),
  yearSelect: document.querySelector("#year-select"),
  yearTrigger: document.querySelector("#year-trigger"),
  yearDisplay: document.querySelector("#year-display"),
  yearPicker: document.querySelector("#year-picker"),
  yearContent: document.querySelector("#year-content"),
  sessionsBody: document.querySelector("#sessions-body"),
  campaignsBody: document.querySelector("#campaigns-body"),
  systemsBody: document.querySelector("#systems-body"),
  quickAdd: document.querySelector(".quick-add"),
  quickAddList: document.querySelector("#quick-add-list"),
  toast: document.querySelector("#toast"),
  sessionDialog: document.querySelector("#session-dialog"),
  sessionForm: document.querySelector("#session-form"),
  sessionSubmit: document.querySelector("#session-form button[type='submit']"),
  sessionDialogTitle: document.querySelector("#session-dialog-title"),
  sessionDate: document.querySelector("#session-date"),
  sessionDateTrigger: document.querySelector("#session-date-trigger"),
  sessionDateDisplay: document.querySelector("#session-date-display"),
  sessionDatePicker: document.querySelector("#session-date-picker"),
  confirmDialog: document.querySelector("#confirm-dialog"),
  confirmForm: document.querySelector("#confirm-form"),
  confirmTitle: document.querySelector("#confirm-title"),
  confirmMessage: document.querySelector("#confirm-message"),
  confirmOk: document.querySelector("#confirm-ok"),
  campaignForm: document.querySelector("#campaign-form"),
  systemForm: document.querySelector("#system-form"),
  gmOptions: document.querySelector("#gm-options"),
  systemOptions: document.querySelector("#system-options"),
};

document.addEventListener("click", handleDocumentClick);
document.addEventListener("click", handlePickerOutsideClick, true);
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
setStatsMonth(state.statsMonth, { render: false });
els.sessionForm.addEventListener("submit", saveSession);
els.confirmForm.addEventListener("submit", handleConfirmSubmit);
els.campaignForm.addEventListener("submit", saveCampaign);
els.systemForm.addEventListener("submit", saveSystem);
document.querySelector("#campaign-system-name").addEventListener("input", syncCampaignNewSystemFields);

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
  renderCalendar();
  renderMonthlyStats();
  renderYearOptions();
  renderYearReview();
  renderCampaigns();
  renderSystems();
  renderGmOptions();
  populateSystemSelects();
  populateCampaignSelect();
  syncNewSystemColorDefaults();
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
    els.quickAddList.innerHTML = emptyState(
      "📜",
      "No active campaigns",
      "Create or unarchive a campaign to make quick add useful.",
      "compact",
    );
    return;
  }

  els.quickAddList.innerHTML = activeCampaigns
    .map((campaign) => {
      return `
        <article class="quick-card">
          <div class="quick-card-main">
            <span class="plus" aria-hidden="true">+</span>
            <div>
              <strong>${escapeHtml(campaign.name)}</strong>
              <small>${escapeHtml(campaign.system_name)} / ${escapeHtml(campaign.default_gm)}</small>
            </div>
          </div>
          <div class="quick-card-actions">
            <button class="primary" type="button" data-quick-save="${campaign.id}">Log today</button>
            <button class="quick-edit-button" type="button" data-quick-edit="${campaign.id}" title="Edit before logging" aria-label="Edit ${escapeAttribute(campaign.name)} before logging">Edit</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSessions() {
  const rows = filteredSessions().sort(compareSessions);
  els.sessionCount.textContent = state.sessions.length.toString();
  els.status.textContent = rows.length === state.sessions.length ? "Ready" : `${rows.length} shown`;

  if (rows.length === 0) {
    els.sessionsBody.innerHTML = `
      <tr>
        <td class="empty" colspan="7">
          ${emptyState("🕯️", "No sessions found", "Try clearing filters or add a new session.", "compact")}
        </td>
      </tr>
    `;
    return;
  }

  els.sessionsBody.innerHTML = rows.map(sessionRow).join("");
}

function renderCalendar() {
  const month = state.calendarDate;
  const monthStart = startOfMonth(month);
  const startOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = addDays(monthStart, -startOffset);
  const monthSessions = state.sessions.filter((session) => isSameMonth(parseISODate(session.date), monthStart));
  const sessionsByDate = groupSessionsByDate(state.sessions);
  const previousPlayedMonth = findPlayedMonth(-1);
  const nextPlayedMonth = findPlayedMonth(1);

  els.calendarTitle.textContent = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(monthStart);
  els.calendarStatus.textContent = monthSessions.length === 0
    ? "No sessions this month"
    : monthSessions.length === 1
      ? "1 session this month"
      : `${monthSessions.length} sessions across ${unique(monthSessions.map((session) => session.date)).length} days`;
  els.calendarPrevSession.disabled = !previousPlayedMonth;
  els.calendarNextSession.disabled = !nextPlayedMonth;
  els.calendarPrevSession.title = previousPlayedMonth
    ? `Jump to ${monthLabel(previousPlayedMonth)}`
    : "No earlier played month";
  els.calendarNextSession.title = nextPlayedMonth
    ? `Jump to ${monthLabel(nextPlayedMonth)}`
    : "No later played month";

  els.calendarGrid.innerHTML = Array.from({ length: 42 }, (_, index) => {
    const day = addDays(gridStart, index);
    const iso = toISODate(day);
    const daySessions = sessionsByDate.get(iso) ?? [];
    const isOutside = !isSameMonth(day, monthStart);
    const isCurrent = iso === today();
    const density = calendarDensityClass(daySessions.length);
    return `
      <article class="calendar-day ${density} ${isOutside ? "is-outside" : ""} ${isCurrent ? "is-today" : ""}" data-calendar-cell="${iso}">
        <button class="calendar-date" type="button" data-calendar-day="${iso}">
          <span>${day.getDate()}</span>
          <small>${daySessions.length ? `${daySessions.length}` : ""}</small>
        </button>
        <div class="calendar-chips">
          ${daySessions.map(calendarChip).join("")}
        </div>
      </article>
    `;
  }).join("");

  if (monthSessions.length === 0) {
    els.calendarAgenda.innerHTML = emptyState(
      "🗓️",
      "No sessions this month",
      "Tap a date to schedule the next one.",
      "compact",
    );
    return;
  }

  els.calendarAgenda.innerHTML = monthSessions
    .sort((a, b) => a.date.localeCompare(b.date) || a.display_name.localeCompare(b.display_name))
    .map((session) => `
      <button class="agenda-row" type="button" data-calendar-session="${session.id}">
        <span>${formatDate(session.date)}</span>
        <strong>${escapeHtml(session.display_name)}</strong>
        <small>${escapeHtml(session.system_name)} / ${escapeHtml(session.gm)}</small>
      </button>
    `)
    .join("");
}

function renderMonthlyStats() {
  const sessions = state.sessions
    .filter((session) => session.date.startsWith(state.statsMonth))
    .sort((a, b) => a.date.localeCompare(b.date));
  const label = monthLabel(state.statsMonth);
  els.statsStatus.textContent = sessions.length === 1
    ? `1 session in ${label}`
    : `${sessions.length} sessions in ${label}`;
  syncStatsMonthDisplay();

  if (sessions.length === 0) {
    els.statsContent.innerHTML = `
      ${emptyState("🌙", label, "No sessions logged for this month.")}
    `;
    return;
  }

  const campaignRows = groupedCountRows(
    sessions,
    (session) => session.campaign_id ? session.display_name : "One-shots",
    (session) => sessionColor(session),
  );
  const systemRows = groupedCountRows(
    sessions,
    (session) => session.system_name,
    (session) => sessionColor(session),
  );
  const topCampaign = campaignRows[0];
  const topSystem = systemRows[0];

  els.statsContent.innerHTML = `
    <div class="stats-summary">
      ${statTile("🎲", "Sessions Logged", sessions.length)}
      ${statTile("⭐", "Most Played", topCampaign.label)}
      ${statTile("🧭", "Favorite System", topSystem.label)}
    </div>
    <div class="stats-grid">
      ${statsChart("Campaigns", campaignRows)}
      ${statsChart("Systems", systemRows)}
    </div>
  `;
}

function renderYearOptions() {
  const years = reviewYearOptions();
  if (!years.includes(state.reviewYear)) {
    state.reviewYear = years[0] ?? currentYear();
  }
  syncReviewYearDisplay();
  renderYearPicker();
}

function renderYearReview() {
  const sessions = state.sessions
    .filter((session) => session.date.startsWith(state.reviewYear))
    .sort((a, b) => a.date.localeCompare(b.date));
  syncReviewYearDisplay();
  els.yearStatus.textContent = sessions.length === 1
    ? `1 session in ${state.reviewYear}`
    : `${sessions.length} sessions in ${state.reviewYear}`;

  if (sessions.length === 0) {
    els.yearContent.innerHTML = `
      ${emptyState("🏕️", state.reviewYear, "No sessions logged for this year.")}
    `;
    return;
  }

  const campaignRows = groupedCountRows(
    sessions,
    (session) => session.campaign_id ? session.display_name : "One-shots",
    (session) => sessionColor(session),
  );
  const systemRows = groupedCountRows(
    sessions,
    (session) => session.system_name,
    (session) => session.system_color,
  );
  const gmRows = groupedCountRows(
    sessions,
    (session) => session.gm,
    () => "var(--accent-2)",
  );
  const monthlyRows = monthlyCountRows(sessions, state.reviewYear);
  const topMonth = [...monthlyRows].sort((a, b) => b.count - a.count)[0];
  const ranCount = sessions.filter((session) => session.gm === "Anna").length;
  const playedCount = sessions.length - ranCount;

  els.yearContent.innerHTML = `
    <div class="stats-summary review-summary">
      ${statTile("🎲", "Sessions Logged", sessions.length)}
      ${statTile("🗓️", "Busiest Month", topMonth.shortLabel)}
      ${statTile("⭐", "Most Played", campaignRows[0].label)}
      ${statTile("⏳", "Longest Break", longestGapLabel(sessions))}
    </div>
    <div class="stats-grid review-grid">
      ${yearMonthChart(monthlyRows)}
      ${ranPlayedPanel(ranCount, playedCount)}
      ${statsChart("Campaigns", campaignRows)}
      ${statsChart("Systems", systemRows)}
      ${statsChart("GMs", gmRows)}
    </div>
  `;
}

function renderCampaigns() {
  if (state.campaigns.length === 0) {
    els.campaignsBody.innerHTML = `
      <tr>
        <td class="empty" colspan="5">
          ${emptyState("📜", "No campaigns yet", "Add a campaign template to speed up session logging.", "compact")}
        </td>
      </tr>
    `;
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
            <span class="swatch" style="background:${escapeAttribute(campaignColor(campaign))}"></span>
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
    els.systemsBody.innerHTML = `
      <tr>
        <td class="empty" colspan="4">
          ${emptyState("🎲", "No systems yet", "Add a system and pick its primary color.", "compact")}
        </td>
      </tr>
    `;
    return;
  }

  els.systemsBody.innerHTML = state.systems
    .map((system) => {
      const shades = systemShadePreview(system);
      return `
        <tr>
          <td data-label="Name">${escapeHtml(system.name)}</td>
          <td data-label="Color">
            <span class="swatch" style="background:${escapeAttribute(system.color)}"></span>
            ${escapeHtml(system.color)}
          </td>
          <td data-label="Derived shades">
            <div class="shade-list">
              ${shades.length ? shades.map(shadePreview).join("") : `<span class="muted">None yet</span>`}
            </div>
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
  els.systemOptions.innerHTML = state.systems
    .map((system) => `<option value="${escapeAttribute(system.name)}"></option>`)
    .join("");
  fillSelect(document.querySelector("#session-system"), [
    ["", "Pick a system"],
    ...regularOptions,
    ["__new", "+ New system"],
  ]);
}

function populateCampaignSelect() {
  fillSelect(
    document.querySelector("#session-campaign"),
    [
      ["", "Pick a campaign"],
      ...state.campaigns.map((campaign) => [String(campaign.id), campaignOptionLabel(campaign)]),
    ],
  );
}

function campaignOptionLabel(campaign) {
  return campaign.archived ? `${campaign.name} (archived)` : campaign.name;
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
        <span class="chip" style="background:${escapeAttribute(sessionColor(session))}">
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
    const calendarCell = event.target.closest("[data-calendar-cell]");
    if (calendarCell) {
      openSessionDialog({ date: calendarCell.dataset.calendarCell });
    }
    return;
  }

  if (target.matches("[data-tab]")) {
    setActiveTab(target.dataset.tab);
  } else if (target.matches("[data-subtab]")) {
    setSubtab(target.dataset.subtab, target.closest("[data-panel]"));
  } else if (target.matches("[data-sort]")) {
    setSort(target.dataset.sort);
  } else if (target.id === "calendar-prev") {
    moveCalendar(-1);
  } else if (target.id === "calendar-next") {
    moveCalendar(1);
  } else if (target.id === "calendar-prev-session") {
    jumpToPlayedMonth(-1);
  } else if (target.id === "calendar-next-session") {
    jumpToPlayedMonth(1);
  } else if (target.id === "calendar-today") {
    state.calendarDate = startOfMonth(new Date());
    renderCalendar();
  } else if (target.id === "session-date-trigger") {
    toggleSessionDatePicker();
  } else if (target.matches("[data-date-picker-prev]")) {
    moveSessionDatePicker(-1);
  } else if (target.matches("[data-date-picker-next]")) {
    moveSessionDatePicker(1);
  } else if (target.matches("[data-date-picker-day]")) {
    setSessionDate(target.dataset.datePickerDay);
    closePickers();
  } else if (target.id === "stats-month-trigger") {
    toggleStatsMonthPicker();
  } else if (target.matches("[data-month-picker-prev]")) {
    moveStatsMonthPicker(-1);
  } else if (target.matches("[data-month-picker-next]")) {
    moveStatsMonthPicker(1);
  } else if (target.matches("[data-month-picker-month]")) {
    setStatsMonth(target.dataset.monthPickerMonth);
    closePickers();
  } else if (target.id === "year-trigger") {
    toggleYearPicker();
  } else if (target.matches("[data-year-picker-year]")) {
    setReviewYear(target.dataset.yearPickerYear);
    closePickers();
  } else if (target.matches("[data-calendar-day]")) {
    openSessionDialog({ date: target.dataset.calendarDay });
  } else if (target.matches("[data-calendar-session]")) {
    openSessionDialog({ sessionId: Number(target.dataset.calendarSession) });
  } else if (target.id === "add-session") {
    openSessionDialog();
  } else if (target.matches("[data-quick-save]")) {
    quickSaveCampaign(Number(target.dataset.quickSave), target);
  } else if (target.matches("[data-quick-edit]")) {
    openSessionDialog({ campaignId: Number(target.dataset.quickEdit) });
  } else if (target.matches("[data-edit-session]")) {
    openSessionDialog({ sessionId: Number(target.dataset.editSession) });
  } else if (target.matches("[data-delete-session-row]")) {
    requestDeleteSession(Number(target.dataset.deleteSessionRow));
  } else if (target.id === "close-session") {
    els.sessionDialog.close();
  } else if (target.id === "delete-session") {
    const id = Number(document.querySelector("#session-id").value);
    if (id) requestDeleteSession(id);
  } else if (target.id === "confirm-cancel") {
    closeConfirmDialog();
  } else if (target.matches("[data-edit-campaign]")) {
    editCampaign(Number(target.dataset.editCampaign));
  } else if (target.matches("[data-archive-campaign]")) {
    toggleCampaignArchive(Number(target.dataset.archiveCampaign));
  } else if (target.matches("[data-delete-campaign]")) {
    requestDeleteCampaign(Number(target.dataset.deleteCampaign));
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

function handlePickerOutsideClick(event) {
  const clickedInsidePicker = event.composedPath().some((node) => {
    return node instanceof Element && node.classList.contains("picker-field");
  });
  if (!clickedInsidePicker) {
    closePickers();
  }
}

function handleDocumentChange(event) {
  if (event.target.id === "session-kind") {
    syncSessionKind();
    syncSessionKindDefaults();
  } else if (event.target.id === "session-campaign") {
    applyCampaignDefaults(Number(event.target.value));
  } else if (event.target.id === "session-system") {
    syncNewSystemFields();
  }
}

function setActiveTab(tab) {
  els.tabs.forEach((button) => button.classList.toggle("is-active", button.dataset.tab === tab));
  els.panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === tab));
  els.quickAdd.hidden = tab !== "sessions";
  const activePanel = document.querySelector(`[data-panel="${tab}"]`);
  if (activePanel && activePanel.querySelector(".subtab-button") && !activePanel.querySelector(".subpanel.is-active")) {
    setSubtab(activePanel.querySelector(".subtab-button").dataset.subtab, activePanel);
  }
}

function setSubtab(subtab, container = document) {
  container.querySelectorAll(".subtab-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.subtab === subtab);
  });
  container.querySelectorAll("[data-subpanel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.subpanel === subtab);
  });
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

function moveCalendar(delta) {
  state.calendarDate = new Date(
    state.calendarDate.getFullYear(),
    state.calendarDate.getMonth() + delta,
    1,
  );
  renderCalendar();
}

function toggleSessionDatePicker() {
  const willOpen = els.sessionDatePicker.hidden;
  closePickers();
  if (willOpen) {
    state.sessionDatePickerMonth = startOfMonth(parseISODate(els.sessionDate.value || today()));
    renderSessionDatePicker();
    els.sessionDatePicker.hidden = false;
  }
}

function moveSessionDatePicker(delta) {
  state.sessionDatePickerMonth = new Date(
    state.sessionDatePickerMonth.getFullYear(),
    state.sessionDatePickerMonth.getMonth() + delta,
    1,
  );
  renderSessionDatePicker();
}

function renderSessionDatePicker() {
  const monthStart = startOfMonth(state.sessionDatePickerMonth);
  const startOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = addDays(monthStart, -startOffset);
  const selected = els.sessionDate.value;

  els.sessionDatePicker.innerHTML = `
    <div class="picker-header">
      <button type="button" data-date-picker-prev aria-label="Previous month">&lsaquo;</button>
      <strong>${escapeHtml(monthLabel(monthKey(monthStart)))}</strong>
      <button type="button" data-date-picker-next aria-label="Next month">&rsaquo;</button>
    </div>
    <div class="picker-weekdays" aria-hidden="true">
      <span>Mon</span>
      <span>Tue</span>
      <span>Wed</span>
      <span>Thu</span>
      <span>Fri</span>
      <span>Sat</span>
      <span>Sun</span>
    </div>
    <div class="picker-days">
      ${Array.from({ length: 42 }, (_, index) => {
        const day = addDays(gridStart, index);
        const iso = toISODate(day);
        return `
          <button
            class="${!isSameMonth(day, monthStart) ? "is-outside" : ""} ${iso === selected ? "is-selected" : ""} ${iso === today() ? "is-today" : ""}"
            type="button"
            data-date-picker-day="${iso}"
            title="${escapeAttribute(formatDate(iso))}"
          >
            ${day.getDate()}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function toggleStatsMonthPicker() {
  const willOpen = els.statsMonthPicker.hidden;
  closePickers();
  if (willOpen) {
    state.statsPickerYear = Number(state.statsMonth.slice(0, 4));
    renderStatsMonthPicker();
    els.statsMonthPicker.hidden = false;
  }
}

function moveStatsMonthPicker(delta) {
  state.statsPickerYear += delta;
  renderStatsMonthPicker();
}

function renderStatsMonthPicker() {
  const selected = state.statsMonth;
  els.statsMonthPicker.innerHTML = `
    <div class="picker-header">
      <button type="button" data-month-picker-prev aria-label="Previous year">&lsaquo;</button>
      <strong>${state.statsPickerYear}</strong>
      <button type="button" data-month-picker-next aria-label="Next year">&rsaquo;</button>
    </div>
    <div class="picker-months">
      ${Array.from({ length: 12 }, (_, index) => {
        const value = `${state.statsPickerYear}-${String(index + 1).padStart(2, "0")}`;
        return `
          <button
            class="${value === selected ? "is-selected" : ""}"
            type="button"
            data-month-picker-month="${value}"
          >
            ${escapeHtml(formatMonthShort(value))}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function toggleYearPicker() {
  const willOpen = els.yearPicker.hidden;
  closePickers();
  if (willOpen) {
    renderYearPicker();
    els.yearPicker.hidden = false;
  }
}

function renderYearPicker() {
  const years = reviewYearOptions();
  els.yearPicker.innerHTML = `
    <div class="picker-years">
      ${years.map((year) => `
        <button
          class="${year === state.reviewYear ? "is-selected" : ""}"
          type="button"
          data-year-picker-year="${year}"
        >
          ${year}
        </button>
      `).join("")}
    </div>
  `;
}

function reviewYearOptions() {
  return unique([
    currentYear(),
    ...state.sessions.map((session) => session.date.slice(0, 4)),
  ]).sort((a, b) => b.localeCompare(a));
}

function closePickers() {
  els.sessionDatePicker.hidden = true;
  els.statsMonthPicker.hidden = true;
  els.yearPicker.hidden = true;
}

function jumpToPlayedMonth(direction) {
  const month = findPlayedMonth(direction);
  if (!month) {
    return;
  }
  state.calendarDate = parseMonthKey(month);
  renderCalendar();
}

function findPlayedMonth(direction) {
  const months = unique(state.sessions.map((session) => session.date.slice(0, 7)));
  const current = monthKey(state.calendarDate);
  if (direction < 0) {
    return months.reverse().find((month) => month < current);
  }
  return months.find((month) => month > current);
}

function monthKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function parseMonthKey(value) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function calendarDensityClass(count) {
  if (count >= 3) {
    return "has-sessions density-high";
  }
  if (count === 2) {
    return "has-sessions density-medium";
  }
  if (count === 1) {
    return "has-sessions density-low";
  }
  return "";
}

function openSessionDialog(options = {}) {
  els.sessionForm.reset();
  document.querySelector("#session-id").value = "";
  setSessionDate(today());
  document.querySelector("#delete-session").hidden = true;
  els.sessionDialogTitle.textContent = "Add Session";
  els.sessionSubmit.textContent = "Save Session";

  if (options.sessionId) {
    const session = findById(state.sessions, options.sessionId);
    document.querySelector("#session-id").value = session.id;
    setSessionDate(session.date);
    document.querySelector("#session-gm").value = session.gm;
    document.querySelector("#session-system").value = String(session.system_id);
    document.querySelector("#session-link").value = session.link ?? "";
    document.querySelector("#session-notes").value = session.notes ?? "";
    document.querySelector("#delete-session").hidden = false;
    els.sessionDialogTitle.textContent = "Edit Session";
    els.sessionSubmit.textContent = "Save Changes";

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
    document.querySelector("#session-kind").value = "one-shot";
    document.querySelector("#session-campaign").value = "";
    document.querySelector("#session-gm").value = "";
    document.querySelector("#session-system").value = "";
  }

  if (options.date) {
    setSessionDate(options.date);
  }

  syncSessionKind();
  syncNewSystemFields();
  els.sessionDialog.showModal();
  focusSessionDialog();
}

function focusSessionDialog() {
  window.requestAnimationFrame(() => {
    const kind = document.querySelector("#session-kind").value;
    const selector = kind === "campaign"
      ? "#session-campaign"
      : kind === "new-campaign"
        ? "#session-new-campaign-name"
        : "#session-name";
    document.querySelector(selector)?.focus();
  });
}

function syncSessionKind() {
  const kind = document.querySelector("#session-kind").value;
  document.querySelectorAll("[data-session-group]").forEach((group) => {
    group.hidden = group.dataset.sessionGroup !== kind;
  });
}

function syncSessionKindDefaults() {
  const kind = document.querySelector("#session-kind").value;
  if (kind === "campaign") {
    const campaignId = Number(document.querySelector("#session-campaign").value);
    if (campaignId) {
      applyCampaignDefaults(campaignId, { onlyEmpty: true });
    }
  } else if (kind === "new-campaign") {
    const gmInput = document.querySelector("#session-new-campaign-gm");
    if (!gmInput.value.trim()) {
      gmInput.value = document.querySelector("#session-gm").value.trim();
    }
  }
}

function syncNewSystemFields() {
  const fields = document.querySelector("#session-new-system-fields");
  const shouldShow = document.querySelector("#session-system").value === "__new";
  if (shouldShow && fields.hidden) {
    document.querySelector("#session-new-system-color").value = suggestSystemColor([
      document.querySelector("#system-color").value,
      document.querySelector("#campaign-new-system-color").value,
    ]);
  }
  fields.hidden = !shouldShow;
}

function applyCampaignDefaults(campaignId, options = {}) {
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) {
    return;
  }
  setValue("#session-gm", campaign.default_gm, options);
  setValue("#session-system", String(campaign.system_id), options);
  setValue("#session-link", campaign.default_link ?? "", options);
  syncNewSystemFields();
}

async function quickSaveCampaign(campaignId, button) {
  const campaign = findById(state.campaigns, campaignId);
  if (!campaign) {
    return;
  }

  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = "Logging...";

  try {
    const saved = await api("/api/sessions", {
      method: "POST",
      body: {
        campaign_id: campaign.id,
        name: null,
        date: today(),
        gm: campaign.default_gm,
        system_id: campaign.system_id,
        link: campaign.default_link ?? null,
        notes: null,
      },
    });
    upsert(state.sessions, saved);
    await refreshLists();
    showToast(`Logged ${campaign.name} for today`);
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
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
      if (!campaignId) {
        throw new Error("Pick a campaign");
      }
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

function requestDeleteSession(id) {
  const session = findById(state.sessions, id);
  openConfirmDialog({
    title: "Delete session?",
    message: session
      ? `${session.display_name} on ${formatDate(session.date)} will be removed permanently.`
      : "This session will be removed permanently.",
    confirmLabel: "Delete",
    onConfirm: () => deleteSession(id),
  });
}

async function deleteSession(id) {
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

function openConfirmDialog({ title, message, confirmLabel, onConfirm }) {
  els.confirmTitle.textContent = title;
  els.confirmMessage.textContent = message;
  els.confirmOk.textContent = confirmLabel;
  els.confirmDialog.onConfirm = onConfirm;
  els.confirmDialog.showModal();
}

function closeConfirmDialog() {
  els.confirmDialog.onConfirm = null;
  els.confirmDialog.close();
}

async function handleConfirmSubmit(event) {
  event.preventDefault();
  const onConfirm = els.confirmDialog.onConfirm;
  closeConfirmDialog();
  if (onConfirm) {
    await onConfirm();
  }
}

function syncCampaignNewSystemFields() {
  const name = document.querySelector("#campaign-system-name").value.trim();
  const existingSystem = systemByName(name);
  const fields = document.querySelector("#campaign-new-system-fields");
  const shouldShow = Boolean(name) && !existingSystem;
  if (shouldShow && fields.hidden) {
    document.querySelector("#campaign-new-system-color").value = suggestSystemColor([
      document.querySelector("#system-color").value,
    ]);
  }
  fields.hidden = !shouldShow;
}

function systemByName(name) {
  return state.systems.find((system) => {
    return system.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase();
  });
}

async function resolveCampaignSystemId() {
  const name = document.querySelector("#campaign-system-name").value.trim();
  if (!name) {
    throw new Error("Pick or type a system");
  }

  const existingSystem = systemByName(name);
  if (existingSystem) {
    return existingSystem.id;
  }

  const system = await api("/api/systems", {
    method: "POST",
    body: {
      name,
      color: document.querySelector("#campaign-new-system-color").value,
    },
  });
  state.systems.push(system);
  populateSystemSelects();
  return system.id;
}

async function saveCampaign(event) {
  event.preventDefault();
  try {
    const id = Number(document.querySelector("#campaign-id").value);
    const systemId = await resolveCampaignSystemId();
    const payload = {
      name: document.querySelector("#campaign-name").value.trim(),
      default_gm: document.querySelector("#campaign-gm").value.trim(),
      system_id: systemId,
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
  setActiveTab("manage");
  setSubtab("campaigns", document.querySelector("#manage-panel"));
  document.querySelector("#campaign-id").value = campaign.id;
  document.querySelector("#campaign-name").value = campaign.name;
  document.querySelector("#campaign-gm").value = campaign.default_gm;
  document.querySelector("#campaign-system-name").value = campaign.system_name;
  syncCampaignNewSystemFields();
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

function requestDeleteCampaign(id) {
  const campaign = findById(state.campaigns, id);
  openConfirmDialog({
    title: "Delete campaign?",
    message: campaign
      ? `${campaign.name} will be deleted if it has no sessions. Campaigns with sessions should be archived instead.`
      : "This campaign will be deleted if it has no sessions.",
    confirmLabel: "Delete",
    onConfirm: () => deleteCampaign(id),
  });
}

async function deleteCampaign(id) {
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
  document.querySelector("#campaign-new-system-color").value = suggestSystemColor();
  syncCampaignNewSystemFields();
}

function syncNewSystemColorDefaults() {
  const systemColor = suggestSystemColor();
  if (!document.querySelector("#system-id").value) {
    document.querySelector("#system-color").value = systemColor;
  }
  const campaignColor = suggestSystemColor([document.querySelector("#system-color").value]);
  if (document.querySelector("#campaign-new-system-fields").hidden) {
    document.querySelector("#campaign-new-system-color").value = campaignColor;
  }
  if (document.querySelector("#session-new-system-fields").hidden) {
    document.querySelector("#session-new-system-color").value = suggestSystemColor([
      document.querySelector("#system-color").value,
      document.querySelector("#campaign-new-system-color").value,
    ]);
  }
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
  setActiveTab("manage");
  setSubtab("systems", document.querySelector("#manage-panel"));
  document.querySelector("#system-id").value = system.id;
  document.querySelector("#system-name").value = system.name;
  document.querySelector("#system-color").value = system.color;
}

function clearSystemForm() {
  els.systemForm.reset();
  document.querySelector("#system-id").value = "";
  document.querySelector("#system-color").value = suggestSystemColor();
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

function setSessionDate(value) {
  const date = value || today();
  els.sessionDate.value = date;
  els.sessionDateDisplay.textContent = formatDate(date);
  state.sessionDatePickerMonth = startOfMonth(parseISODate(date));
}

function setStatsMonth(value, options = {}) {
  state.statsMonth = value || currentMonth();
  syncStatsMonthDisplay();
  if (options.render !== false) {
    renderMonthlyStats();
  }
}

function setReviewYear(value, options = {}) {
  state.reviewYear = value || currentYear();
  syncReviewYearDisplay();
  if (options.render !== false) {
    renderYearReview();
  }
}

function syncStatsMonthDisplay() {
  els.statsMonth.value = state.statsMonth;
  els.statsMonthDisplay.textContent = formatMonthYear(state.statsMonth);
}

function syncReviewYearDisplay() {
  els.yearSelect.value = state.reviewYear;
  els.yearDisplay.textContent = state.reviewYear;
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

function formatMonthYear(value) {
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}

function formatMonthShort(value) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { month: "short" }).format(new Date(year, month - 1, 1));
}

function calendarChip(session) {
  return `
    <button
      class="calendar-chip"
      style="background:${escapeAttribute(sessionColor(session))}"
      type="button"
      data-calendar-session="${session.id}"
      title="${escapeAttribute(session.display_name)}"
    >
      ${escapeHtml(session.display_name)}
    </button>
  `;
}

function groupedCountRows(sessions, labelFor, colorFor) {
  const groups = new Map();
  for (const session of sessions) {
    const label = labelFor(session);
    if (!groups.has(label)) {
      groups.set(label, {
        label,
        count: 0,
        color: colorFor(session),
      });
    }
    groups.get(label).count += 1;
  }
  return [...groups.values()].sort((a, b) => {
    return b.count - a.count || a.label.localeCompare(b.label);
  });
}

function sessionColor(session) {
  if (session.campaign_id) {
    return deriveCampaignColor(
      session.system_color,
      campaignShadeIndex(session.campaign_id, session.system_id),
    );
  }
  return deriveCampaignColor(session.system_color, oneShotShadeIndex(session));
}

function campaignColor(campaign) {
  return deriveCampaignColor(
    campaign.system_color,
    campaignShadeIndex(campaign.id, campaign.system_id),
  );
}

function suggestSystemColor(excludedColors = []) {
  const usedColors = new Set([
    ...state.systems.map((system) => normalizeHex(system.color)),
    ...excludedColors.map(normalizeHex),
  ].filter(Boolean));
  return SYSTEM_COLOR_PALETTE.find((color) => !usedColors.has(normalizeHex(color)))
    ?? leastRecentlyUsedPaletteColor();
}

function leastRecentlyUsedPaletteColor() {
  const counts = new Map(SYSTEM_COLOR_PALETTE.map((color) => [normalizeHex(color), 0]));
  for (const system of state.systems) {
    const color = normalizeHex(system.color);
    if (counts.has(color)) {
      counts.set(color, counts.get(color) + 1);
    }
  }
  return SYSTEM_COLOR_PALETTE
    .map((color) => ({ color, count: counts.get(normalizeHex(color)) ?? 0 }))
    .sort((a, b) => a.count - b.count || SYSTEM_COLOR_PALETTE.indexOf(a.color) - SYSTEM_COLOR_PALETTE.indexOf(b.color))[0]
    .color;
}

function normalizeHex(value) {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function systemShadePreview(system) {
  const campaignShades = state.campaigns
    .filter((campaign) => campaign.system_id === system.id)
    .sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id)
    .map((campaign) => ({
      label: campaign.name,
      color: campaignColor(campaign),
    }));
  const oneShotShades = unique(state.sessions
    .filter((session) => !session.campaign_id && session.system_id === system.id)
    .map((session) => session.display_name))
    .map((name) => {
      const session = state.sessions.find((item) => {
        return !item.campaign_id && item.system_id === system.id && item.display_name === name;
      });
      return {
        label: name,
        color: session ? sessionColor(session) : system.color,
      };
    });
  return [...campaignShades, ...oneShotShades];
}

function shadePreview(shade) {
  return `
    <span class="shade-chip" title="${escapeAttribute(shade.label)}">
      <span style="background:${escapeAttribute(shade.color)}"></span>
      ${escapeHtml(shade.label)}
    </span>
  `;
}

function campaignShadeIndex(campaignId, systemId) {
  const campaignIds = state.campaigns
    .filter((campaign) => campaign.system_id === systemId)
    .sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id)
    .map((campaign) => campaign.id);
  const index = campaignIds.indexOf(campaignId);
  return index >= 0 ? index : stableNumber(campaignId);
}

function oneShotShadeIndex(session) {
  const campaignCount = state.campaigns.filter((campaign) => {
    return campaign.system_id === session.system_id;
  }).length;
  const oneShotNames = unique(state.sessions
    .filter((item) => !item.campaign_id && item.system_id === session.system_id)
    .map((item) => item.display_name));
  const index = oneShotNames.indexOf(session.display_name);
  return campaignCount + 1 + (index >= 0 ? index : stableNumber(session.display_name));
}

function deriveCampaignColor(hex, index) {
  const hsl = hexToHsl(hex);
  if (!hsl) {
    return hex;
  }
  const steps = [
    { saturation: 0, lightness: 0 },
    { saturation: -16, lightness: 18 },
    { saturation: 18, lightness: -16 },
    { saturation: -24, lightness: -24 },
    { saturation: 24, lightness: 22 },
    { saturation: -34, lightness: 6 },
    { saturation: 34, lightness: -28 },
    { saturation: -8, lightness: 30 },
  ];
  const step = steps[index % steps.length];
  return hslToHex(
    hsl.h,
    clamp(hsl.s + step.saturation, 28, 94),
    clamp(hsl.l + step.lightness, 24, 82),
  );
}

function hexToHsl(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) {
    return null;
  }
  const red = Number.parseInt(match[1], 16) / 255;
  const green = Number.parseInt(match[2], 16) / 255;
  const blue = Number.parseInt(match[3], 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5
      ? delta / (2 - max - min)
      : delta / (max + min);
    if (max === red) {
      hue = (green - blue) / delta + (green < blue ? 6 : 0);
    } else if (max === green) {
      hue = (blue - red) / delta + 2;
    } else {
      hue = (red - green) / delta + 4;
    }
    hue /= 6;
  }

  return {
    h: Math.round(hue * 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

function hslToHex(hue, saturation, lightness) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - chroma / 2;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = chroma;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = chroma;
  } else if (hue < 300) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  return `#${[red, green, blue]
    .map((value) => Math.round((value + m) * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function stableNumber(value) {
  return String(value).split("").reduce((sum, character) => {
    return sum + character.charCodeAt(0);
  }, 0);
}

function emptyState(icon, title, message, variant = "") {
  const classes = ["empty-state"];
  if (variant) {
    classes.push(`empty-state-${variant}`);
  }
  return `
    <div class="${classes.join(" ")}">
      <span class="empty-icon" aria-hidden="true">${icon}</span>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function statTile(icon, label, value) {
  return `
    <div class="stat-tile">
      <span class="stat-icon" aria-hidden="true">${icon}</span>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function statsChart(title, rows) {
  const max = Math.max(...rows.map((row) => row.count));
  return `
    <section class="chart-panel">
      <h3><span aria-hidden="true">${chartIcon(title)}</span>${escapeHtml(title)}</h3>
      <div class="bar-list">
        ${rows.map((row) => statsBar(row, max)).join("")}
      </div>
    </section>
  `;
}

function statsBar(row, max) {
  const width = Math.max(10, Math.round((row.count / max) * 100));
  const label = row.count === 1 ? "1 session" : `${row.count} sessions`;
  return `
    <div class="bar-row">
      <div class="bar-meta">
        <span>${escapeHtml(row.label)}</span>
        <strong>${label}</strong>
      </div>
      <div class="bar-track" aria-hidden="true">
        <span style="width:${width}%; background:${escapeAttribute(row.color)}"></span>
      </div>
    </div>
  `;
}

function yearMonthChart(rows) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return `
    <section class="chart-panel wide-panel">
      <h3><span aria-hidden="true">🗓️</span>Sessions Per Month</h3>
      <div class="month-bars">
        ${rows.map((row) => `
          <div class="month-bar">
            <span class="month-bar-track" aria-hidden="true">
              <span style="height:${Math.max(6, Math.round((row.count / max) * 100))}%"></span>
            </span>
            <strong>${row.shortLabel}</strong>
            <small>${row.count}</small>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function ranPlayedPanel(ranCount, playedCount) {
  const rows = [
    { label: "Ran", count: ranCount, color: "var(--accent)" },
    { label: "Played", count: playedCount, color: "var(--accent-2)" },
  ];
  return statsChart("Games I Ran vs. Played", rows);
}

function chartIcon(title) {
  const icons = {
    Campaigns: "📜",
    Systems: "🎲",
    GMs: "🗣️",
    "Games I Ran vs. Played": "⚔️",
  };
  return icons[title] ?? "📊";
}

function monthlyCountRows(sessions, year) {
  const formatter = new Intl.DateTimeFormat(undefined, { month: "short" });
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const date = new Date(Number(year), index, 1);
    return {
      label: new Intl.DateTimeFormat(undefined, { month: "long" }).format(date),
      shortLabel: formatter.format(date),
      count: sessions.filter((session) => session.date.startsWith(`${year}-${month}`)).length,
      color: "var(--accent)",
    };
  });
}

function longestGapLabel(sessions) {
  if (sessions.length < 2) {
    return "0 days";
  }
  let longest = 0;
  for (let index = 1; index < sessions.length; index += 1) {
    const previous = parseISODate(sessions[index - 1].date);
    const current = parseISODate(sessions[index].date);
    const days = Math.round((current - previous) / 86_400_000);
    longest = Math.max(longest, days);
  }
  return longest === 1 ? "1 day" : `${longest} days`;
}

function monthLabel(value) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function groupSessionsByDate(sessions) {
  const groups = new Map();
  for (const session of sessions) {
    if (!groups.has(session.date)) {
      groups.set(session.date, []);
    }
    groups.get(session.date).push(session);
  }
  for (const items of groups.values()) {
    items.sort((a, b) => a.display_name.localeCompare(b.display_name));
  }
  return groups;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function isSameMonth(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function parseISODate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function setValue(selector, value, options = {}) {
  const input = document.querySelector(selector);
  if (!options.onlyEmpty || !input.value.trim()) {
    input.value = value;
  }
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
