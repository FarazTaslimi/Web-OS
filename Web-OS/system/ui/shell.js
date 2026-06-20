/* ═══════════════════════════════════════════════
   WINDOWS 12 CONCEPT — Shell JS
   ═══════════════════════════════════════════════ */
'use strict';

// ── SVG ICONS ────────────────────────────────────
// Icons are provided globally by system/lib/resources.js (WebOSResources & IC)
// The global `IC` object contains all system icons. No local definition needed.

// ── BUILD DOM ─────────────────────────────────────
function buildShell() {
  // Ambient orbs
  document.body.insertAdjacentHTML('afterbegin', `
    <div id="wallpaper">
      <div class="ambient-orb orb-1"></div>
      <div class="ambient-orb orb-2"></div>
    </div>
  `);

  // Desktop icons
  const desktopIcons = [
    { icon: IC.recycle, label: 'Recycle Bin' },
    { icon: IC.folder,  label: 'Documents' },
    { icon: IC.notepad, label: 'Notepad' },
    { icon: IC.edge,    label: 'Edge' },
    { icon: IC.settings,label: 'Settings' },
  ];

  const desktop = document.createElement('div');
  desktop.id = 'desktop';

  desktopIcons.forEach(({ icon, label }) => {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.innerHTML = `<div class="icon-img">${icon}</div><span class="icon-label">${label}</span>`;
    
    // Single click – select
    el.addEventListener('click', () => {
      document.querySelectorAll('.desktop-icon').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
    });
    
    // Double click – open Settings app
    if (label === 'Settings') {
      el.addEventListener('dblclick', async (e) => {
        e.stopPropagation();
        if (typeof WM !== 'undefined' && WM.create) {
          const iframe = document.createElement('iframe');
          iframe.src = 'system/apps/settings/index.html';
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.border = 'none';
          WM.create({
            title: 'Settings',
            width: 900,
            height: 650,
            content: iframe,
            resizable: true,
            minWidth: 600,
            minHeight: 400
          });
        } else {
          console.error('WM (window manager) not available');
        }
      });
    } else {
      // Normal double click – deselect
      el.addEventListener('dblclick', () => el.classList.remove('selected'));
    }
    
    desktop.appendChild(el);
  });

  document.body.appendChild(desktop);

  // Taskbar
  const taskbarApps = [
    { icon: IC.search,   id: 'tb-search-btn', label: 'Search' },
    { icon: IC.taskview, id: 'tb-taskview',    label: 'Task View' },
    { icon: IC.widgets,  id: 'tb-widgets',     label: 'Widgets' },
    { icon: IC.edge,     id: null,             label: 'Edge',     app: true },
    { icon: IC.store,    id: null,             label: 'Store',    app: true },
    { icon: IC.folder,   id: null,             label: 'Files',    app: true },
  ];

  const tbLeft = `<button id="tb-start" title="Start">${IC.win}</button>`;
  const tbCenter = taskbarApps.map(a => {
    if (a.app) return `<div class="tb-app" title="${a.label}">${a.icon}</div>`;
    return `<button class="tb-btn" id="${a.id}" title="${a.label}">${a.icon}</button>`;
  }).join('');

  const tbRight = `
  <div id="tb-right">
    <div class="tray-icons-group" id="tray-group">
      <div class="tray-icon" id="tb-wifi"    title="Wi-Fi">${IC.wifi}</div>
      <div class="tray-icon" id="tb-vol"     title="Volume">${IC.vol}</div>
      <div class="tray-icon" id="tb-battery" title="Battery">${IC.battery}</div>
    </div>
    <div class="tb-divider"></div>
    <div id="tb-clock" title="Clock">
      <span class="time" id="clock-time">--:--</span>
      <span class="date" id="clock-date">...</span>
    </div>
    <div class="tb-divider"></div>
    <div class="tray-icon" id="tb-notif" title="Notifications">${IC.bell}</div>
  </div>`;

  const taskbar = document.createElement('div');
  taskbar.id = 'taskbar';
  taskbar.innerHTML = tbLeft + tbCenter + tbRight;
  document.body.appendChild(taskbar);

  buildPanels();
  buildContextMenu();
  buildSearchOverlay();
  bindEvents();
  startClock();
  
  // World clocks update
  function updateWorldClocks() {
    document.querySelectorAll('.wg-tz-time').forEach(el => {
      const offset = parseInt(el.dataset.offset);
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const tz = new Date(utc + offset * 3600000);
      el.textContent = tz.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    });
  }
  updateWorldClocks();
  setInterval(updateWorldClocks, 10000);
}

// ── PANELS ────────────────────────────────────────
function buildPanels() {
// ── START PANEL ──────────────────────────────
const allApps = [
  { icon: IC.bluetooth, name: 'Bluetooth' },
  { icon: IC.edge,      name: 'Edge' },
  { icon: IC.folder,    name: 'Files' },
  { icon: IC.notepad,   name: 'Notepad' },
  { icon: IC.recycle,   name: 'Recycle Bin' },
  { icon: IC.settings,  name: 'Settings' },
  { icon: IC.store,     name: 'Store' },
];
const startPinned = [
  { icon: IC.edge,     name: 'Edge' },
  { icon: IC.store,    name: 'Store' },
  { icon: IC.settings, name: 'Settings' },
  { icon: IC.notepad,  name: 'Notepad' },
  { icon: IC.folder,   name: 'Files' },
  { icon: IC.recycle,  name: 'Recycle' },
];

const pinGrid = startPinned.map(a => `
  <div class="start-app-item" data-name="${a.name}">
    <div class="app-icon">${a.icon}</div>
    <span class="app-name">${a.name}</span>
  </div>
`).join('');

// Group all apps by first letter
const grouped = {};
allApps.forEach(a => {
  const letter = a.name[0].toUpperCase();
  if (!grouped[letter]) grouped[letter] = [];
  grouped[letter].push(a);
});
const allAppsHTML = Object.keys(grouped).sort().map(letter => `
  <div class="allapps-letter">${letter}</div>
  ${grouped[letter].map(a => `
    <div class="allapps-item" data-name="${a.name}">
      <div class="allapps-icon">${a.icon}</div>
      <span class="allapps-name">${a.name}</span>
    </div>
  `).join('')}
`).join('');

const backSVG = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 2L4 6l4 4"/></svg>`;

document.body.insertAdjacentHTML('beforeend', `
  <div class="panel" id="start-panel">
    <div class="start-views" id="start-views">

      <!-- View 0: Main -->
      <div class="start-view" id="start-main-view">
        <div class="start-search">
          <div class="start-search-bar">
            ${IC.search}
            <input type="text" placeholder="Search apps, settings, files..." id="start-search-input" autocomplete="off"/>
          </div>
        </div>
        <div class="start-body">
          <div class="start-section-header">
            <span class="start-section-label">Pinned</span>
            <button class="start-all-btn" id="start-allapps-btn">All apps →</button>
          </div>
          <div class="start-pinned-grid">${pinGrid}</div>
          <div class="start-section-header">
            <span class="start-section-label">Recommended</span>
          </div>
          <div class="start-rec-list">
            <div class="start-rec-item">
              <div class="start-rec-icon">${IC.folder}</div>
              <div class="start-rec-info">
                <div class="start-rec-name">Documents</div>
                <div class="start-rec-meta">Folder · Recently opened</div>
              </div>
            </div>
            <div class="start-rec-item">
              <div class="start-rec-icon">${IC.notepad}</div>
              <div class="start-rec-info">
                <div class="start-rec-name">notes.txt</div>
                <div class="start-rec-meta">Notepad · 2 hours ago</div>
              </div>
            </div>
            <div class="start-rec-item">
              <div class="start-rec-icon">${IC.settings}</div>
              <div class="start-rec-info">
                <div class="start-rec-name">Settings</div>
                <div class="start-rec-meta">System · Yesterday</div>
              </div>
            </div>
          </div>
        </div>
        <div class="start-footer">
          <div class="start-user">
            <div class="start-user-avatar">U</div>
            <span class="start-user-name">User</span>
          </div>
          <div class="start-power-group">
            <button class="power-btn power-shutdown" id="start-power-btn2" title="Power">${IC.power}</button>
          </div>
        </div>
      </div>

      <!-- View 1: All Apps -->
      <div class="start-view" id="start-allapps-view">
        <div class="allapps-header">
          <button class="allapps-back" id="allapps-back-btn">${backSVG}</button>
          <span class="allapps-title">All apps</span>
        </div>
        <div class="allapps-list">${allAppsHTML}</div>
        <div class="start-footer">
          <div class="start-user">
            <div class="start-user-avatar">U</div>
            <span class="start-user-name">User</span>
          </div>
          <div class="start-power-group">
            <button class="power-btn power-shutdown" id="start-power-btn2" title="Power">${IC.power}</button>
          </div>
        </div>
      </div>

    </div>
  </div>
`);

// ── POWER SUBMENU ──────────────────────────────
document.body.insertAdjacentHTML('beforeend', `
  <div id="power-submenu">
    <div class="power-menu-item" id="pm-sleep">
      ${IC.sleep}<span>Sleep</span>
    </div>
    <div class="power-menu-item" id="pm-hibernate">
      ${IC.moon}<span>Hibernate</span>
    </div>
    <div class="power-menu-sep"></div>
    <div class="power-menu-item danger" id="pm-shutdown">
      ${IC.power}<span>Shut down</span>
    </div>
    <div class="power-menu-item" id="pm-restart">
      ${IC.restart}<span>Restart</span>
    </div>
  </div>
`);

document.body.insertAdjacentHTML('beforeend', `
  <div id="user-menu">
    <div class="user-menu-header">
      <div class="user-menu-avatar">U</div>
      <div class="user-menu-info">
        <div class="user-menu-name">User</div>
        <div class="user-menu-email">user@windows12.local</div>
      </div>
      <div class="user-menu-status-dot"></div>
    </div>
    <div class="user-menu-sep"></div>
    <div class="user-menu-item" id="um-account">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
      Account settings
    </div>
    <div class="user-menu-item" id="um-lock">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>
      Lock
    </div>
    <div class="user-menu-sep"></div>
    <div class="user-menu-item" id="um-switch">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="5" cy="8" r="2.5"/><circle cx="11" cy="8" r="2.5"/><path d="M7.5 8h1"/></svg>
      Switch user
    </div>
    <div class="user-menu-item danger" id="um-signout">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M10 3h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3M7 11l4-3-4-3M2 8h9"/></svg>
      Sign out
    </div>
  </div>
`);

// ── START APP CONTEXT MENU ─────────────────────
document.body.insertAdjacentHTML('beforeend', `
  <div id="start-app-ctx">
    <div class="sctx-header">
      <div class="sctx-app-icon" id="sctx-icon"></div>
      <span class="sctx-app-name" id="sctx-name">App</span>
    </div>
    <div class="sctx-item" id="sctx-open">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg>
      Open
    </div>
    <div class="sctx-item" id="sctx-pin">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 2l5 5-2 1-5-5 2-1zM7 8L3 14M6 7l-3 3"/></svg>
      Pin to taskbar
    </div>
    <div class="sctx-item" id="sctx-file">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5h4M6 8h4M6 11h2"/></svg>
      Open file location
    </div>
    <div class="sctx-sep"></div>
    <div class="sctx-item danger" id="sctx-uninstall">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
      Uninstall
    </div>
  </div>
`);

  // CLOCK PANEL with alarm & reminder expandable section
document.body.insertAdjacentHTML('beforeend', `
  <div class="panel" id="clock-panel">
    <div class="clock-big" id="clock-big">--:--:--</div>
    <div class="clock-date-full" id="clock-date-full">...</div>
    <div class="clock-separator"></div>
    <div class="calendar-mini">
      <div class="cal-header">
        <span class="cal-month" id="cal-month-label"></span>
        <div class="cal-nav">
          <button class="cal-nav-btn" id="cal-prev">${IC.chevLeft}</button>
          <button class="cal-nav-btn" id="cal-next">${IC.chevRight}</button>
        </div>
      </div>
      <div class="cal-grid" id="cal-grid"></div>
    </div>
    
    <!-- Alarm & Reminder Section -->
    <div class="alarm-reminder-section">
      <div class="section-header" id="alarm-reminder-header">
        <span>⏰ Alarms & Reminders</span>
        <div class="expand-icon" id="expand-icon">▼</div>
      </div>
      <div class="section-content" id="alarm-reminder-content">
        <div id="alarm-list">
          <div class="alarm-item">
            <span class="alarm-time">07:30 AM</span>
            <span class="alarm-label">Wake up</span>
          </div>
          <div class="alarm-item">
            <span class="alarm-time">09:00 AM</span>
            <span class="alarm-label">Meeting</span>
          </div>
        </div>
        <div id="reminder-list">
          <div class="reminder-item">
            <span class="reminder-label">Buy groceries</span>
          </div>
        </div>
        <button class="add-btn" id="add-alarm-reminder">+ Add new</button>
      </div>
    </div>
  </div>
`);
renderCalendar(new Date());

  // QUICK SETTINGS
 // ── QUICK SETTINGS + SUB-PANELS ──────────────
 const qsTiles = [
    { id: 'qs-wifi',     icon: IC.wifi,       label: 'Wi-Fi',       on: true,  sub: 'sub-wifi'  },
    { id: 'qs-bt',       icon: IC.bluetooth,  label: 'Bluetooth',   on: true,  sub: 'sub-bt'    },
    { id: 'qs-airplane', icon: IC.airplane,   label: 'Airplane',    on: false, sub: null         },
    { id: 'qs-night',    icon: IC.nightlight, label: 'Night Light', on: false, sub: 'sub-night' },
    { id: 'qs-moon',     icon: IC.moon,       label: 'Focus',       on: false, sub: 'sub-focus' },
    { id: 'qs-share',    icon: IC.share,      label: 'Quick Share', on: false, sub: null         },
  ];

  const chevRightSVG = `<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 2l4 3-4 3"/></svg>`;

  const tilesHTML = qsTiles.map(t => {
    if (t.sub) {
      return `
        <div class="qs-tile${t.on ? ' on' : ''} has-sub" id="${t.id}" data-sub="${t.sub}">
          <div class="qs-tile-left">
            <div class="qs-tile-icon">${t.icon}</div>
            <div class="qs-tile-label">${t.label}</div>
          </div>
          <div class="qs-tile-right">${chevRightSVG}</div>
        </div>`;
    }
    return `
      <div class="qs-tile${t.on ? ' on' : ''}" id="${t.id}">
        <div class="qs-tile-icon">${t.icon}</div>
        <div class="qs-tile-label">${t.label}</div>
      </div>`;
  }).join('');

  const backArrowSVG = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2L4 7l5 5"/></svg>`;

  // ── Sub-panel: Wi-Fi ─────────────────────────
  const subWifi = `
    <div class="qs-sub active" id="sub-wifi">
      <div class="qs-sub-header">
        <button class="qs-back-btn" data-back="true">${backArrowSVG}</button>
        <span class="qs-sub-title">Wi-Fi</span>
        <span class="qs-sub-icon">${IC.wifi}</span>
      </div>
      <div class="qs-sub-body">
        <div class="qs-sub-section-label">Available Networks</div>
        <div class="qs-list-item connected">
          <div class="qs-list-icon">${IC.wifi}</div>
          <div class="qs-list-info">
            <div class="qs-list-name">HomeNetwork_5G</div>
            <div class="qs-list-meta">Connected · Secured</div>
          </div>
          <div class="qs-list-badge">5G</div>
        </div>
        <div class="qs-list-item">
          <div class="qs-list-icon">${IC.wifi}</div>
          <div class="qs-list-info">
            <div class="qs-list-name">Office_WiFi</div>
            <div class="qs-list-meta">Secured · Strong</div>
          </div>
        </div>
        <div class="qs-list-item">
          <div class="qs-list-icon">${IC.wifi}</div>
          <div class="qs-list-info">
            <div class="qs-list-name">CafeGuest</div>
            <div class="qs-list-meta">Open · Medium</div>
          </div>
        </div>
        <div class="qs-list-item">
          <div class="qs-list-icon">${IC.wifi}</div>
          <div class="qs-list-info">
            <div class="qs-list-name">NETGEAR_2.4</div>
            <div class="qs-list-meta">Secured · Weak</div>
          </div>
        </div>
        <div class="qs-sub-toggle-row" style="margin-top:6px">
          <div class="qs-sub-toggle-label">
            <span>Wi-Fi</span>
            <span>Enabled and connected</span>
          </div>
          <button class="toggle on" id="wifi-toggle"></button>
        </div>
      </div>
    </div>`;

  // ── Sub-panel: Bluetooth ──────────────────────
  const subBt = `
    <div class="qs-sub" id="sub-bt">
      <div class="qs-sub-header">
        <button class="qs-back-btn" data-back="true">${backArrowSVG}</button>
        <span class="qs-sub-title">Bluetooth</span>
        <span class="qs-sub-icon">${IC.bluetooth}</span>
      </div>
      <div class="qs-sub-body">
        <div class="qs-sub-section-label">My Devices</div>
        <div class="qs-list-item connected">
          <div class="qs-list-icon">${IC.bluetooth}</div>
          <div class="qs-list-info">
            <div class="qs-list-name">AirPods Pro</div>
            <div class="qs-list-meta">Connected · Audio</div>
          </div>
          <div class="qs-list-badge">●</div>
        </div>
        <div class="qs-list-item">
          <div class="qs-list-icon">${IC.bluetooth}</div>
          <div class="qs-list-info">
            <div class="qs-list-name">Magic Keyboard</div>
            <div class="qs-list-meta">Not connected</div>
          </div>
        </div>
        <div class="qs-sub-section-label" style="margin-top:6px">Nearby</div>
        <div class="qs-list-item">
          <div class="qs-list-icon">${IC.bluetooth}</div>
          <div class="qs-list-info">
            <div class="qs-list-name">Sony WH-1000XM5</div>
            <div class="qs-list-meta">Available</div>
          </div>
        </div>
        <div class="qs-sub-toggle-row" style="margin-top:6px">
          <div class="qs-sub-toggle-label">
            <span>Bluetooth</span>
            <span>On · 1 device connected</span>
          </div>
          <button class="toggle on" id="bt-toggle"></button>
        </div>
      </div>
    </div>`;

  // ── Sub-panel: Night Light ────────────────────
  const subNight = `
    <div class="qs-sub" id="sub-night">
      <div class="qs-sub-header">
        <button class="qs-back-btn" data-back="true">${backArrowSVG}</button>
        <span class="qs-sub-title">Night Light</span>
        <span class="qs-sub-icon">${IC.nightlight}</span>
      </div>
      <div class="qs-sub-body">
        <div class="qs-color-temp-preview"></div>
        <div class="qs-sub-slider-row">
          <div class="qs-sub-slider-label">
            <span>Color Temperature</span>
            <span class="qs-sub-slider-val" id="night-temp-val">48%</span>
          </div>
          <input type="range" class="qs-sub-slider" id="night-temp-slider" min="0" max="100" value="48"/>
        </div>
        <div class="qs-sub-slider-row">
          <div class="qs-sub-slider-label">
            <span>Intensity</span>
            <span class="qs-sub-slider-val" id="night-int-val">60%</span>
          </div>
          <input type="range" class="qs-sub-slider" id="night-int-slider" min="0" max="100" value="60"/>
        </div>
        <div class="qs-sub-toggle-row">
          <div class="qs-sub-toggle-label">
            <span>Night Light</span>
            <span>Reduces blue light</span>
          </div>
          <button class="toggle" id="night-toggle"></button>
        </div>
        <div class="qs-sub-toggle-row">
          <div class="qs-sub-toggle-label">
            <span>Schedule</span>
            <span>Sunset to Sunrise</span>
          </div>
          <button class="toggle on" id="night-schedule-toggle"></button>
        </div>
      </div>
    </div>`;

  // ── Sub-panel: Focus ──────────────────────────
  const subFocus = `
    <div class="qs-sub" id="sub-focus">
      <div class="qs-sub-header">
        <button class="qs-back-btn" data-back="true">${backArrowSVG}</button>
        <span class="qs-sub-title">Focus</span>
        <span class="qs-sub-icon">${IC.moon}</span>
      </div>
      <div class="qs-sub-body">
        <div class="qs-sub-section-label">Mode</div>
        <div class="qs-focus-options">
          <div class="qs-focus-option selected" data-mode="work">
            <div class="qs-focus-option-icon">💼</div>
            <div class="qs-focus-option-name">Work</div>
          </div>
          <div class="qs-focus-option" data-mode="dnd">
            <div class="qs-focus-option-icon">🔕</div>
            <div class="qs-focus-option-name">Do Not Disturb</div>
          </div>
          <div class="qs-focus-option" data-mode="gaming">
            <div class="qs-focus-option-icon">🎮</div>
            <div class="qs-focus-option-name">Gaming</div>
          </div>
          <div class="qs-focus-option" data-mode="sleep">
            <div class="qs-focus-option-icon">😴</div>
            <div class="qs-focus-option-name">Sleep</div>
          </div>
        </div>
        <div class="qs-sub-section-label" style="margin-top:6px">Focus Timer</div>
        <div class="qs-focus-timer">
          <div class="qs-focus-timer-display" id="focus-timer-display">25:00</div>
          <button class="qs-timer-btn" id="focus-minus">−</button>
          <button class="qs-timer-btn start" id="focus-start">▶</button>
          <button class="qs-timer-btn" id="focus-plus">+</button>
        </div>
        <div class="qs-sub-toggle-row">
          <div class="qs-sub-toggle-label">
            <span>Hide Notifications</span>
            <span>While focus is active</span>
          </div>
          <button class="toggle on"></button>
        </div>
      </div>
    </div>`;

  // ── Assemble QS panel ─────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <div class="panel" id="qs-panel">
      <div class="qs-screens" id="qs-screens">

        <!-- Screen 0: main quick settings -->
        <div class="qs-screen" id="qs-main-screen">
          <div class="qs-top">
            <span class="qs-title">Quick Settings</span>
            <button class="qs-edit-btn">Edit</button>
          </div>
          <div class="qs-tiles">${tilesHTML}</div>
          <div class="qs-sliders">
            <div class="qs-slider-row">
              <div class="qs-slider-icon">${IC.sun}</div>
              <input type="range" class="qs-slider" id="qs-brightness" min="0" max="100" value="80"/>
            </div>
            <div class="qs-slider-row">
              <div class="qs-slider-icon">${IC.vol}</div>
              <input type="range" class="qs-slider" id="qs-volume" min="0" max="100" value="60"/>
            </div>
          </div>
          <div class="qs-bottom">
            <div class="qs-user-row">
              <div class="qs-avatar">U</div>
              <div>
                <div class="qs-user-name">User</div>
                <div class="qs-user-status">Connected</div>
              </div>
            </div>
            <div class="battery-display">${IC.battery}<span>85%</span></div>
          </div>
        </div>

        <!-- Screen 1: sub-panels container -->
        <div class="qs-screen" id="qs-sub-screen">
          ${subWifi}
          ${subBt}
          ${subNight}
          ${subFocus}
        </div>

      </div>
    </div>
  `);

  // Fill sliders with accent color as they change
const sliders = document.querySelectorAll('.qs-slider');
sliders.forEach(slider => {
  const updateFill = () => {
    const percent = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percent}%, rgba(255,255,255,0.12) ${percent}%, rgba(255,255,255,0.12) 100%)`;
  };
  updateFill();
  slider.addEventListener('input', updateFill);
});

  // NOTIFICATIONS
  const notifItems = `<div style="font-size:13px;color:var(--text-3);padding:24px 0;text-align:center;">No new notifications</div>`;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="panel" id="notif-panel">
      <div class="notif-header">
        <span class="notif-title">Notifications</span>
        <button class="notif-clear">Clear all</button>
      </div>
      <div class="notif-dnd">
        <span class="notif-dnd-label">Do Not Disturb</span>
        <button class="toggle" id="dnd-toggle"></button>
      </div>
      <div class="notif-list">${notifItems}</div>
    </div>
  `);

  document.body.insertAdjacentHTML('beforeend', `
  <div id="taskview-overlay">
    <div class="tv-header">Task View</div>
    <div class="tv-empty">
      <svg viewBox="0 0 60 60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5">
        <rect x="4" y="8" width="24" height="18" rx="3"/>
        <rect x="32" y="8" width="24" height="10" rx="3"/>
        <rect x="32" y="22" width="24" height="14" rx="3"/>
        <rect x="4" y="30" width="24" height="22" rx="3"/>
        <rect x="32" y="40" width="24" height="12" rx="3"/>
      </svg>
      <span>No open windows</span>
    </div>
    <div class="tv-desktops">
      <div class="tv-desktop-thumb active">Desktop 1</div>
      <div class="tv-desktop-thumb">+ New desktop</div>
    </div>
  </div>
`);

  document.body.insertAdjacentHTML('beforeend', `
  <div id="widgets-panel">
    <div class="wg-header">
      <span class="wg-title">Widgets</span>
      <button class="wg-add-btn">+ Add widget</button>
    </div>
    <div class="wg-grid">
      <div class="wg-card wg-weather">
        <div class="wg-card-label">Weather</div>
        <div class="wg-weather-temp">18°</div>
        <div class="wg-weather-desc">Partly cloudy · Hamburg</div>
        <svg viewBox="0 0 60 30" fill="none" class="wg-sparkline">
          <polyline points="0,20 10,15 20,18 30,10 40,13 50,8 60,12"
            stroke="rgba(59,158,255,0.5)" stroke-width="1.5" fill="none"/>
        </svg>
      </div>
      <div class="wg-card wg-clock">
        <div class="wg-card-label">World Clock</div>
        <div class="wg-clock-row"><span>New York</span><span class="wg-tz-time" data-offset="-4"></span></div>
        <div class="wg-clock-row"><span>London</span><span class="wg-tz-time" data-offset="1"></span></div>
        <div class="wg-clock-row"><span>Tokyo</span><span class="wg-tz-time" data-offset="9"></span></div>
      </div>
      <div class="wg-card wg-news">
        <div class="wg-card-label">News</div>
        <div class="wg-news-item">AI assistants reach new milestone in 2026</div>
        <div class="wg-news-item">Global tech summit opens in Berlin</div>
        <div class="wg-news-item">New space mission launches this week</div>
      </div>
      <div class="wg-card wg-calendar">
        <div class="wg-card-label">Upcoming</div>
        <div class="wg-event"><span class="wg-event-time">09:00</span><span>Team standup</span></div>
        <div class="wg-event"><span class="wg-event-time">14:30</span><span>Design review</span></div>
        <div class="wg-event"><span class="wg-event-time">17:00</span><span>Weekly sync</span></div>
      </div>
    </div>
  </div>
`);
}

// ── CONTEXT MENU ──────────────────────────────────
function buildContextMenu() {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="context-menu">
      <div class="ctx-item">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>
        View
      </div>
      <div class="ctx-item">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 4h12M2 8h12M2 12h8"/></svg>
        Sort by
      </div>
      <div class="ctx-separator"></div>
      <div class="ctx-item">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="10" height="10" rx="1.5"/><path d="M3 6h10"/></svg>
        New folder
      </div>
      <div class="ctx-item">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>
        New file
      </div>
      <div class="ctx-separator"></div>
      <div class="ctx-item">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="5"/><path d="M8 6v4M8 5v.5"/></svg>
        Display settings
      </div>
      <div class="ctx-item">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="7" r="3"/><path d="M3 14c0-3 2-5 5-5s5 2 5 5"/></svg>
        Personalize
      </div>
    </div>
  `);
}

// ── SEARCH OVERLAY ────────────────────────────────
function buildSearchOverlay() {
  const suggestions = [
    { icon: IC.settings, name: 'Settings', meta: 'App' },
    { icon: IC.edge,     name: 'Microsoft Edge', meta: 'App' },
    { icon: IC.folder,   name: 'Documents', meta: 'Folder' },
    { icon: IC.notepad,  name: 'Notepad', meta: 'App' },
  ];
  const sugHTML = suggestions.map(s => `
    <div class="search-result-item">
      <div class="search-result-icon">${s.icon}</div>
      <span class="search-result-name">${s.name}</span>
      <span class="search-result-meta">${s.meta}</span>
    </div>
  `).join('');

  document.body.insertAdjacentHTML('beforeend', `
    <div id="search-overlay">
      <div id="search-box">
        <div id="search-input-row">
          ${IC.search}
          <input type="text" placeholder="Search Windows" id="search-input" autocomplete="off"/>
          <button id="search-esc">ESC</button>
        </div>
        <div class="search-section">
          <div class="search-section-label">Suggested</div>
          <div class="search-results">${sugHTML}</div>
        </div>
      </div>
    </div>
  `);
}

// ── PANEL MANAGER ─────────────────────────────────
const panels = {};
let activePanel = null;

function getPanel(id) {
  if (!panels[id]) panels[id] = document.getElementById(id);
  return panels[id];
}

function openPanel(id) {
  if (activePanel && activePanel !== id) closePanel(activePanel);
  const p = getPanel(id);
  if (!p) return;
  p.classList.add('open');
  activePanel = id;
}

function closePanel(id) {
  const p = id ? getPanel(id) : null;
  if (p) p.classList.remove('open');
  if (activePanel === id) activePanel = null;
}

function togglePanel(id) {
  const p = getPanel(id);
  if (!p) return;
  if (p.classList.contains('open')) closePanel(id);
  else openPanel(id);
}

function closeAllPanels() {
  ['start-panel','qs-panel','notif-panel','clock-panel'].forEach(closePanel);
  document.getElementById('taskview-overlay')?.classList.remove('open');
  document.getElementById('widgets-panel')?.classList.remove('open');
  activePanel = null;
}

// ── EVENTS ────────────────────────────────────────
function bindEvents() {
  // Start
  // ── START ──────────────────────────────────────
document.getElementById('tb-start').addEventListener('click', e => {
  e.stopPropagation();
  togglePanel('start-panel');
});

// All apps toggle
const allAppsBtn = document.getElementById('start-allapps-btn');
if (allAppsBtn) allAppsBtn.addEventListener('click', () => {
  document.getElementById('start-views')?.classList.add('show-allapps');
});
const allAppsBack = document.getElementById('allapps-back-btn');
if (allAppsBack) allAppsBack.addEventListener('click', () => {
  document.getElementById('start-views')?.classList.remove('show-allapps');
});

// ── POWER SUBMENU ──────────────────────────────
function openPowerMenu(anchorEl) {
  const menu = document.getElementById('power-submenu');
  if (!menu) return;
  const rect = anchorEl.getBoundingClientRect();
  menu.style.right = (window.innerWidth - rect.right) + 'px';
  menu.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
  menu.style.left = 'auto';
  menu.classList.add('open');
}
function closePowerMenu() {
  document.getElementById('power-submenu')?.classList.remove('open');
}

['start-power-btn','start-power-btn2'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', e => {
    e.stopPropagation();
    const menu = document.getElementById('power-submenu');
    if (menu?.classList.contains('open')) closePowerMenu();
    else openPowerMenu(el);
  });
});
['start-sleep-btn','start-sleep-btn2'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => {
    closeAllPanels();
    // sleep animation placeholder
    document.body.style.transition = 'opacity 0.6s';
    document.body.style.opacity = '0';
    setTimeout(() => { document.body.style.opacity = '1'; }, 800);
  });
});
['start-restart-btn','start-restart-btn2'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => {
    closeAllPanels();
    location.reload();
  });
});

document.getElementById('pm-sleep')?.addEventListener('click', () => {
  closePowerMenu(); closeAllPanels();
  document.body.style.transition = 'opacity 0.6s';
  document.body.style.opacity = '0';
  setTimeout(() => { document.body.style.opacity = '1'; }, 800);
});
document.getElementById('pm-restart')?.addEventListener('click', () => {
  closePowerMenu(); closeAllPanels();
  location.reload();
});
document.getElementById('pm-shutdown')?.addEventListener('click', () => {
  closePowerMenu(); closeAllPanels();
  document.body.style.transition = 'opacity 1s';
  document.body.style.opacity = '0';
});

// ── USER MENU ──────────────────────────────────
function openUserMenu(anchorEl) {
  const menu = document.getElementById('user-menu');
  if (!menu) return;
  const rect = anchorEl.getBoundingClientRect();
  menu.style.left = rect.left + 'px';
  menu.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
  menu.style.top = 'auto';
  menu.classList.add('open');
}
function closeUserMenu() {
  document.getElementById('user-menu')?.classList.remove('open');
}

document.querySelectorAll('.start-user').forEach(el => {
  el.addEventListener('click', e => {
    e.stopPropagation();
    const menu = document.getElementById('user-menu');
    if (menu?.classList.contains('open')) closeUserMenu();
    else openUserMenu(el);
  });
});

document.getElementById('um-lock')?.addEventListener('click', () => {
  closeUserMenu(); closeAllPanels();
  document.body.style.transition = 'opacity 0.4s';
  document.body.style.opacity = '0';
  setTimeout(() => { document.body.style.opacity = '1'; }, 600);
});
document.getElementById('um-signout')?.addEventListener('click', () => {
  closeUserMenu(); closeAllPanels();
  document.body.style.transition = 'opacity 0.8s';
  document.body.style.opacity = '0';
});
document.getElementById('um-account')?.addEventListener('click', () => closeUserMenu());
document.getElementById('um-switch')?.addEventListener('click', () => closeUserMenu());

// hibernate placeholder
document.getElementById('pm-hibernate')?.addEventListener('click', () => {
  closePowerMenu(); closeAllPanels();
  document.body.style.transition = 'opacity 1s';
  document.body.style.opacity = '0';
  setTimeout(() => { document.body.style.opacity = '1'; }, 1200);
});

// close user menu on outside click — این رو به addEventListener('click') موجود اضافه کن
// یا یه listener جدید بذار:
document.addEventListener('click', e => {
  if (!e.target.closest('#user-menu') && !e.target.closest('.start-user')) closeUserMenu();
});
// ── START APP CONTEXT MENU ─────────────────────
let ctxTargetEl = null;
function openStartAppCtx(e, el, name, iconHTML) {
  e.preventDefault(); e.stopPropagation();
  const ctx = document.getElementById('start-app-ctx');
  if (!ctx) return;
  document.querySelectorAll('.start-app-item, .allapps-item').forEach(x => x.classList.remove('ctx-selected'));
  el.classList.add('ctx-selected');
  ctxTargetEl = el;
  document.getElementById('sctx-icon').innerHTML = iconHTML;
  document.getElementById('sctx-name').textContent = name;
  let x = e.clientX, y = e.clientY;
  const w = 200, h = 180;
  if (x + w > window.innerWidth)  x = window.innerWidth  - w - 8;
  if (y + h > window.innerHeight) y = window.innerHeight - h - 8;
  ctx.style.left = x + 'px';
  ctx.style.top  = y + 'px';
  ctx.classList.add('open');
}
function closeStartAppCtx() {
  document.getElementById('start-app-ctx')?.classList.remove('open');
  document.querySelectorAll('.start-app-item, .allapps-item').forEach(x => x.classList.remove('ctx-selected'));
  ctxTargetEl = null;
}

// Context on pinned items
document.querySelectorAll('.start-app-item').forEach(item => {
  item.addEventListener('contextmenu', e => {
    const name = item.dataset.name;
    const iconEl = item.querySelector('.app-icon');
    openStartAppCtx(e, item, name, iconEl ? iconEl.innerHTML : '');
  });
});
// Context on all-apps items
document.querySelectorAll('.allapps-item').forEach(item => {
  item.addEventListener('contextmenu', e => {
    const name = item.dataset.name;
    const iconEl = item.querySelector('.allapps-icon');
    openStartAppCtx(e, item, name, iconEl ? iconEl.innerHTML : '');
  });
});

document.getElementById('sctx-open')?.addEventListener('click', () => closeStartAppCtx());
document.getElementById('sctx-pin')?.addEventListener('click', () => {
  // placeholder: add running dot to taskbar
  closeStartAppCtx();
});
document.getElementById('sctx-file')?.addEventListener('click', () => closeStartAppCtx());
document.getElementById('sctx-uninstall')?.addEventListener('click', () => {
  if (ctxTargetEl) ctxTargetEl.style.opacity = '0.3';
  closeStartAppCtx();
});

// Close power menu + start ctx on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('#power-submenu')) closePowerMenu();
  if (!e.target.closest('#start-app-ctx') && !e.target.closest('.start-app-item') && !e.target.closest('.allapps-item')) {
    closeStartAppCtx();
  }
});

  // بعد از event listener مربوط به start
const tbTaskview = document.getElementById('tb-taskview');
if (tbTaskview) tbTaskview.addEventListener('click', e => {
  e.stopPropagation();
  const tv = document.getElementById('taskview-overlay');
  if (tv) tv.classList.toggle('open');
});

const tbWidgets = document.getElementById('tb-widgets');
if (tbWidgets) tbWidgets.addEventListener('click', e => {
  e.stopPropagation();
  const wp = document.getElementById('widgets-panel');
  if (wp) wp.classList.toggle('open');
});

// در closeAllPanels هم اضافه کن:
// document.getElementById('taskview-overlay')?.classList.remove('open');
// document.getElementById('widgets-panel')?.classList.remove('open');

  // Quick settings (wifi/vol/battery cluster)
  // Quick Settings panel – right edge aligned with taskbar's right edge
const trayGroup = document.getElementById('tray-group');
if (trayGroup) {
  trayGroup.addEventListener('click', (e) => {
    e.stopPropagation();
    const panel = getPanel('qs-panel');
    const taskbar = document.getElementById('taskbar');
    const taskbarRect = taskbar.getBoundingClientRect();
    
    // Align panel's right edge to taskbar's right edge
    panel.style.right = (window.innerWidth - taskbarRect.right) + 'px';
    panel.style.left = 'auto';
    
    togglePanel('qs-panel');
  });
}

  // Notifications
  document.getElementById('tb-notif').addEventListener('click', e => {
  e.stopPropagation();
  const panel = getPanel('notif-panel');
  const taskbar = document.getElementById('taskbar');
  const taskbarRect = taskbar.getBoundingClientRect();
  const panelWidth = panel.offsetWidth;
  
  // Position panel's right edge to match taskbar's right edge
  panel.style.right = (window.innerWidth - taskbarRect.right) + 'px';
  panel.style.left = 'auto';
  
  togglePanel('notif-panel');
});

  // Clock
   document.getElementById('tb-clock').addEventListener('click', e => {
    e.stopPropagation();
    const panel = getPanel('clock-panel');
    const taskbar = document.getElementById('taskbar');
    const taskbarRect = taskbar.getBoundingClientRect();
    panel.style.right = (window.innerWidth - taskbarRect.right) + 'px';
    panel.style.left = 'auto';
    togglePanel('clock-panel');
  });

  // Search button
  const searchBtn = document.getElementById('tb-search-btn');
  if (searchBtn) searchBtn.addEventListener('click', e => {
    e.stopPropagation();
    closeAllPanels();
    openSearch();
  });

  // Start panel search → open search overlay
  const startInput = document.getElementById('start-search-input');
  if (startInput) startInput.addEventListener('focus', () => {
    closeAllPanels();
    openSearch();
  });

  // Search overlay
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput   = document.getElementById('search-input');
  const searchEsc     = document.getElementById('search-esc');

  if (searchOverlay) {
    searchOverlay.addEventListener('click', e => {
      if (e.target === searchOverlay) closeSearch();
    });
  }
  if (searchEsc) searchEsc.addEventListener('click', closeSearch);

  // ── QS Tile click: toggle + optional sub-panel navigation ──
  // QS Tiles: چپ = toggle، راست (arrow zone) = sub-panel
  // QS Tiles — چپ toggle، راست sub-panel
  document.querySelectorAll('.qs-tile').forEach(tile => {
    // چپ: toggle
    const left = tile.querySelector('.qs-tile-left');
    if (left) {
      left.addEventListener('click', e => {
        e.stopPropagation();
        tile.classList.toggle('on');
      });
    } else {
      // tile بدون sub
      tile.addEventListener('click', () => tile.classList.toggle('on'));
    }

    // راست: sub-panel
    const right = tile.querySelector('.qs-tile-right');
    if (right) {
      right.addEventListener('click', e => {
        e.stopPropagation();
        openQsSub(tile.dataset.sub);
      });
    }
  });

  // Back buttons inside sub-panels
  document.addEventListener('click', e => {
    if (e.target.closest('[data-back="true"]')) {
      closeQsSub();
    }
  });

  // Focus mode picker
  document.querySelectorAll('.qs-focus-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.qs-focus-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // Focus timer
  let focusMinutes = 25;
  let focusRunning = false;
  let focusInterval = null;
  let focusSeconds = 0;

  const updateTimerDisplay = () => {
    const el = document.getElementById('focus-timer-display');
    if (!el) return;
    const m = String(focusMinutes).padStart(2, '0');
    const s = String(focusSeconds).padStart(2, '0');
    el.textContent = `${m}:${s}`;
  };

  const focusMinus = document.getElementById('focus-minus');
  const focusPlus  = document.getElementById('focus-plus');
  const focusStart = document.getElementById('focus-start');

  if (focusMinus) focusMinus.addEventListener('click', () => {
    if (focusRunning) return;
    focusMinutes = Math.max(1, focusMinutes - 5);
    focusSeconds = 0;
    updateTimerDisplay();
  });
  if (focusPlus) focusPlus.addEventListener('click', () => {
    if (focusRunning) return;
    focusMinutes = Math.min(120, focusMinutes + 5);
    focusSeconds = 0;
    updateTimerDisplay();
  });
  if (focusStart) focusStart.addEventListener('click', () => {
    if (!focusRunning) {
      focusRunning = true;
      focusStart.textContent = '⏸';
      focusInterval = setInterval(() => {
        if (focusSeconds === 0) {
          if (focusMinutes === 0) {
            clearInterval(focusInterval);
            focusRunning = false;
            focusStart.textContent = '▶';
            focusMinutes = 25; focusSeconds = 0;
            updateTimerDisplay();
            return;
          }
          focusMinutes--;
          focusSeconds = 59;
        } else {
          focusSeconds--;
        }
        updateTimerDisplay();
      }, 1000);
    } else {
      clearInterval(focusInterval);
      focusRunning = false;
      focusStart.textContent = '▶';
    }
  });

  // Night light sliders
  const nightTempSlider = document.getElementById('night-temp-slider');
  const nightTempVal    = document.getElementById('night-temp-val');
  const nightIntSlider  = document.getElementById('night-int-slider');
  const nightIntVal     = document.getElementById('night-int-val');

  if (nightTempSlider) nightTempSlider.addEventListener('input', () => {
    nightTempVal.textContent = nightTempSlider.value + '%';
    updateSubSliderFill(nightTempSlider);
  });
  if (nightIntSlider) nightIntSlider.addEventListener('input', () => {
    nightIntVal.textContent = nightIntSlider.value + '%';
    updateSubSliderFill(nightIntSlider);
  });

  // Sub-panel toggles
  ['wifi-toggle','bt-toggle','night-toggle','night-schedule-toggle'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => el.classList.toggle('on'));
  });

  // ── QS SUB-PANEL NAVIGATION ───────────────────
let currentSub = null;

function openQsSub(subId) {
  // Hide all subs, show the requested one
  document.querySelectorAll('.qs-sub').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(subId);
  if (target) target.classList.add('active');

  // Slide to sub screen
  const screens = document.getElementById('qs-screens');
  if (screens) screens.classList.add('show-sub');

  currentSub = subId;

  // ✅ Do NOT modify the tile's on/off state here
}
function closeQsSub() {
  const screens = document.getElementById('qs-screens');
  if (screens) screens.classList.remove('show-sub');
  currentSub = null;
}

// Fill sub-panel slider tracks
function updateSubSliderFill(slider) {
  const pct = (slider.value - slider.min) / (slider.max - slider.min) * 100;
  slider.style.background = `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, rgba(255,255,255,0.10) ${pct}%, rgba(255,255,255,0.10) 100%)`;
}

// Init fills on load
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.qs-sub-slider').forEach(updateSubSliderFill);
});

  // DND toggle
  const dnd = document.getElementById('dnd-toggle');
  if (dnd) dnd.addEventListener('click', () => dnd.classList.toggle('on'));

  // Notif clear
  const clearBtn = document.querySelector('.notif-clear');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    const list = document.querySelector('.notif-list');
    if (list) {
      list.style.transition = 'opacity 0.3s';
      list.style.opacity = '0';
      setTimeout(() => { list.innerHTML = '<div style="font-size:13px;color:var(--text-3);padding:12px 0;text-align:center;">No notifications</div>'; list.style.opacity='1'; }, 300);
    }
  });

  // Calendar nav
  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');
  if (calPrev) calPrev.addEventListener('click', () => { calOffset--; renderCalendar(new Date()); });
  if (calNext) calNext.addEventListener('click', () => { calOffset++; renderCalendar(new Date()); });

  // Context menu
  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    closeAllPanels();
    const cm = document.getElementById('context-menu');
    if (!cm) return;
    let x = e.clientX, y = e.clientY;
    const w = 180, h = 240;
    if (x + w > window.innerWidth)  x = window.innerWidth  - w - 8;
    if (y + h > window.innerHeight) y = window.innerHeight - h - 8;
    cm.style.left = x + 'px';
    cm.style.top  = y + 'px';
    cm.classList.add('open');
  });

  document.addEventListener('click', e => {
    const cm = document.getElementById('context-menu');
    if (cm && !cm.contains(e.target)) cm.classList.remove('open');
    if (!e.target.closest('#taskbar') && !e.target.closest('.panel') && !e.target.closest('#search-overlay')) {
      closeAllPanels();
    }
    if (!e.target.closest('.desktop-icon')) {
      document.querySelectorAll('.desktop-icon').forEach(x => x.classList.remove('selected'));
    }
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeSearch();
      closeAllPanels();
      const cm = document.getElementById('context-menu');
      if (cm) cm.classList.remove('open');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault(); openSearch();
    }
  });

 // ─── NOW PASTE THE NEW BLOCK AT THE VERY BOTTOM OF bindEvents() ───
  // Expand/collapse alarm & reminder section
  const sectionHeader = document.getElementById('alarm-reminder-header');
  const sectionContent = document.getElementById('alarm-reminder-content');
  const expandIcon = document.getElementById('expand-icon');

  if (sectionHeader && sectionContent && expandIcon) {
    sectionHeader.addEventListener('click', () => {
      const isOpen = sectionContent.classList.contains('open');
      if (isOpen) {
        sectionContent.classList.remove('open');
        expandIcon.classList.remove('open');
      } else {
        sectionContent.classList.add('open');
        expandIcon.classList.add('open');
      }
    });
  }

  // Add new alarm/reminder placeholder logic
  const addBtn = document.getElementById('add-alarm-reminder');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      alert('In a real app, you could add a new alarm or reminder here.\nFor demo, edit the HTML directly.');
    });
  }
} // <-- end of bindEvents()

// ── SEARCH ────────────────────────────────────────
function openSearch() {
  const o = document.getElementById('search-overlay');
  const i = document.getElementById('search-input');
  if (o) o.classList.add('open');
  if (i) setTimeout(() => i.focus(), 50);
}
function closeSearch() {
  const o = document.getElementById('search-overlay');
  if (o) o.classList.remove('open');
}

// ── CLOCK ─────────────────────────────────────────
function startClock() {
  const tick = () => {
    const now  = new Date();
    const hh   = String(now.getHours()).padStart(2, '0');
    const mm   = String(now.getMinutes()).padStart(2, '0');
    const ss   = String(now.getSeconds()).padStart(2, '0');
    const timeWithSeconds = `${hh}:${mm}:${ss}`;
    const shortTime = `${hh}:${mm}`;

    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const tTime = document.getElementById('clock-time');
    const tDate = document.getElementById('clock-date');
    const bTime = document.getElementById('clock-big');
    const bDate = document.getElementById('clock-date-full');

    if (tTime) tTime.textContent = shortTime;
    if (tDate) tDate.textContent = dateStr.replace(',', '');
    if (bTime) bTime.textContent = timeWithSeconds;  // show seconds in large clock
    if (bDate) bDate.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  tick();
  setInterval(tick, 1000);
}

// ── CALENDAR ─────────────────────────────────────
let calOffset = 0;
function renderCalendar(base) {
  const ref = new Date(base.getFullYear(), base.getMonth() + calOffset, 1);
  const year = ref.getFullYear(), month = ref.getMonth();
  const today = new Date();

  const label = document.getElementById('cal-month-label');
  const grid  = document.getElementById('cal-grid');
  if (!label || !grid) return;

  label.textContent = ref.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  let html = days.map(d => `<div class="cal-day-label">${d}</div>`).join('');

  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const prevTotal = new Date(year, month, 0).getDate();

  for (let i = 0; i < first; i++) {
    html += `<div class="cal-day other-month">${prevTotal - first + i + 1}</div>`;
  }
  for (let d = 1; d <= total; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    html += `<div class="cal-day${isToday ? ' today' : ''}">${d}</div>`;
  }
  grid.innerHTML = html;
}

// ── INIT ──────────────────────────────────────────
// Expose buildShell for the service manager (shell-service.js)
window.buildShell = buildShell;