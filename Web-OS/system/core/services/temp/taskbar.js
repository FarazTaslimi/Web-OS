// system/services/taskbar.js – Open Apps Manager
// Manages running app icons in the taskbar (removes old pinned icons)
(function() {
  class TaskbarService {
    constructor() {
      this.runningApps = {}; // appId -> { name, icon, window }
      this.container = null;
      this._init();
    }

    _init() {
      // Remove old static pinned icons (File Explorer, Edge, Store, Settings)
      const oldPinned = document.querySelectorAll('#taskbar .tb-btn[title="File Explorer"], #taskbar .tb-btn[title="Edge"], #taskbar .tb-btn[title="Store"], #taskbar .tb-btn[title="Settings"]');
      oldPinned.forEach(el => el.remove());

      // Create a container for running apps (centered in taskbar)
      this.container = document.createElement('div');
      this.container.id = 'running-apps';
      this.container.style.display = 'flex';
      this.container.style.alignItems = 'center';
      this.container.style.gap = '3px';

      // Insert after the second tb-sep (before the system tray)
      const tray = document.getElementById('tray');
      if (tray && tray.previousElementSibling?.classList.contains('tb-sep')) {
        tray.previousElementSibling.before(this.container);
      } else {
        // Fallback: append to taskbar
        document.getElementById('taskbar').appendChild(this.container);
      }
    }

    // Add a running app
    addApp(appId, name, icon) {
      if (this.runningApps[appId]) return; // already running

      const btn = document.createElement('div');
      btn.className = 'tb-btn running active-win';
      btn.title = name;
      btn.dataset.appId = appId;
      btn.innerHTML = icon || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="3" width="20" height="18" rx="3"/></svg>`;
      btn.addEventListener('click', () => {
        // Focus the app window (if implemented later)
        if (this.runningApps[appId]?.window) {
          this.runningApps[appId].window.focus?.();
        }
      });
      this.container.appendChild(btn);
      this.runningApps[appId] = { name, icon, window: null, element: btn };
    }

    // Remove a running app
    removeApp(appId) {
      if (!this.runningApps[appId]) return;
      this.runningApps[appId].element.remove();
      delete this.runningApps[appId];
    }

    // Bind a window object to an app (so clicking icon can focus the window)
    bindWindow(appId, win) {
      if (this.runningApps[appId]) {
        this.runningApps[appId].window = win;
      }
    }
  }

  // Create global instance
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.TaskbarService = new TaskbarService();
    });
  } else {
    window.TaskbarService = new TaskbarService();
  }
})();