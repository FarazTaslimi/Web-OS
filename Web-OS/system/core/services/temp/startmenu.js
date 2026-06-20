// system/services/startmenu.js – WebOS Start Menu Service
(function() {
  class StartMenuService {
    constructor() {
      this.panel = document.getElementById('start-menu');
      this.btn = document.getElementById('btn-start-label');
      this.powerBtn = this.panel?.querySelector('.sm-power-btn');
      this.userEl = this.panel?.querySelector('.sm-user');
      this.pinnedGrid = this.panel?.querySelector('.sm-pinned');
      this.recommendedGrid = this.panel?.querySelector('.sm-recommended');
      this.allAppsContainer = null;
      this.powerMenu = null;
      this.contextMenu = null;
      this.pinned = [];
      this.allApps = [
        { id: 'explorer', title: 'File Explorer', icon: '📁' },
        { id: 'settings', title: 'Settings', icon: '⚙️' },
        { id: 'edge', title: 'Edge', icon: '🌐' },
        { id: 'notepad', title: 'Notepad', icon: '📝' },
        { id: 'store', title: 'Store', icon: '🛒' },
        { id: 'terminal', title: 'Terminal', icon: '💻' },
        { id: 'camera', title: 'Camera', icon: '📷' },
        { id: 'calculator', title: 'Calculator', icon: '🔢' },
        { id: 'paint', title: 'Paint', icon: '🎨' },
        { id: 'weather', title: 'Weather', icon: '🌤️' },
        { id: 'calendar', title: 'Calendar', icon: '📅' },
        { id: 'clock', title: 'Clock', icon: '🕐' },
        { id: 'music', title: 'Music', icon: '🎵' },
        { id: 'video', title: 'Video', icon: '🎬' },
        { id: 'photos', title: 'Photos', icon: '🖼️' },
        { id: 'mail', title: 'Mail', icon: '📧' },
        { id: 'maps', title: 'Maps', icon: '🗺️' },
        { id: 'news', title: 'News', icon: '📰' }
      ];
      this._init();
    }

    async _init() {
      if (!this.panel || !this.btn) return;

      // Load pinned apps
      try {
        const res = await fetch('/api/startmenu');
        const data = await res.json();
        this.pinned = data.pinned || [];
      } catch (e) {}

      // Load user info
      try {
        const res = await fetch('/api/user');
        const user = await res.json();
        if (this.userEl) {
          const avatarEl = this.userEl.querySelector('.sm-avatar');
          const nameEl = this.userEl.querySelector('.sm-username');
          if (avatarEl && user.avatar) {
            avatarEl.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
          }
          if (nameEl) nameEl.textContent = user.username || 'User';
        }
      } catch (e) {}

      this._bindStartButton();
      this._bindPowerButton();
      this._createPowerMenu();
      this._createAllAppsSection();
      this._renderPinned();
      this._renderRecommended();
    }

    _bindStartButton() {
      this.btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._togglePanel();
      });
    }

    _togglePanel() {
      const isOpen = this.panel.classList.contains('show');
      if (isOpen) {
        this.panel.classList.remove('show');
        this._hideAllApps();
      } else {
        document.querySelectorAll('.panel.show').forEach(p => p.classList.remove('show'));
        this.panel.classList.add('show');
      }
    }

    // ── Power Button & Menu ──────────────────────────
    _bindPowerButton() {
      if (!this.powerBtn) return;
      this.powerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.powerMenu.classList.contains('show')) {
          this.powerMenu.classList.remove('show');
        } else {
          this.powerMenu.classList.add('show');
          this._positionPowerMenu();
        }
      });
    }

    _createPowerMenu() {
      if (document.getElementById('start-power-menu')) return;
      const menu = document.createElement('div');
      menu.id = 'start-power-menu';
      menu.className = 'start-power-menu';
      menu.innerHTML = `
        <div class="spm-item" data-action="shutdown">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
          Shut down
        </div>
        <div class="spm-item" data-action="restart">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          Restart
        </div>
        <div class="spm-item" data-action="sleep">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          Sleep
        </div>
        <div class="spm-item" data-action="hibernate">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="12" y2="12"/></svg>
          Hibernate
        </div>
      `;
      this.panel.appendChild(menu);
      this.powerMenu = menu;

      // Events
      menu.querySelectorAll('.spm-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = item.dataset.action;
          this._handlePowerAction(action);
        });
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (this.powerMenu?.classList.contains('show') &&
            !this.powerMenu.contains(e.target) &&
            e.target !== this.powerBtn) {
          this.powerMenu.classList.remove('show');
        }
      });
    }

    _positionPowerMenu() {
      if (!this.powerBtn || !this.powerMenu) return;
      const btnRect = this.powerBtn.getBoundingClientRect();
      const menuHeight = this.powerMenu.offsetHeight;
      const menuWidth = this.powerMenu.offsetWidth;
      this.powerMenu.style.left = (btnRect.left + btnRect.width/2 - menuWidth/2) + 'px';
      this.powerMenu.style.top = (btnRect.top - menuHeight - 8) + 'px';
    }

    async _handlePowerAction(action) {
      this.powerMenu?.classList.remove('show');
      if (action === 'shutdown') {
        await fetch('/api/status', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({power:'off'}) });
        sessionStorage.clear();
        window.location.href = 'index.html';
      } else if (action === 'restart') {
        window.location.href = 'loader.html';
      } else if (action === 'sleep' || action === 'hibernate') {
        alert(`${action} mode – coming soon`);
        this.panel.classList.remove('show');
      }
    }

    // ── Pinned Apps ───────────────────────────────────
    _renderPinned() {
      if (!this.pinnedGrid) return;
      this.pinnedGrid.innerHTML = '';
      this.pinned.forEach(app => {
        this.pinnedGrid.appendChild(this._createAppTile(app, true));
      });
    }

    async _savePinned() {
      try {
        await fetch('/api/startmenu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pinned: this.pinned })
        });
      } catch (e) {}
    }

    _pinApp(app) {
      if (this.pinned.find(p => p.id === app.id)) return;
      this.pinned.push(app);
      this._renderPinned();
      this._savePinned();
    }

    _unpinApp(appId) {
      this.pinned = this.pinned.filter(p => p.id !== appId);
      this._renderPinned();
      this._savePinned();
    }

    // ── All Apps Section ──────────────────────────────
    _createAllAppsSection() {
      if (!this.panel) return;
      // Add "All Apps" button at the bottom of pinned section
      const sectionTitle = this.panel.querySelector('.sm-section-title');
      const allAppsBtn = document.createElement('div');
      allAppsBtn.className = 'sm-allapps-btn';
      allAppsBtn.innerHTML = '📋 All Apps ›';
      allAppsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleAllApps();
      });
      if (sectionTitle) {
        sectionTitle.after(allAppsBtn);
      }

      // Create All Apps container (hidden initially)
      const container = document.createElement('div');
      container.className = 'sm-allapps-container';
      container.style.display = 'none';
      container.innerHTML = `
        <div class="sm-allapps-header">
          <button class="sm-allapps-back">‹ Back</button>
          <span>All Apps</span>
        </div>
        <div class="sm-allapps-grid"></div>
      `;
      this.panel.appendChild(container);
      this.allAppsContainer = container;

      container.querySelector('.sm-allapps-back').addEventListener('click', (e) => {
        e.stopPropagation();
        this._hideAllApps();
      });
    }

    _toggleAllApps() {
      if (!this.allAppsContainer) return;
      const isVisible = this.allAppsContainer.style.display === 'block';
      if (isVisible) {
        this._hideAllApps();
      } else {
        this._showAllApps();
      }
    }

    _showAllApps() {
      if (!this.allAppsContainer) return;
      // Hide other sections
      this.panel.querySelector('.sm-pinned')?.parentElement?.querySelectorAll('.sm-section-title, .sm-pinned, .sm-recommended, .sm-allapps-btn, .sm-footer')
        .forEach(el => el.style.display = 'none');
      this.panel.querySelector('.sm-search') && (this.panel.querySelector('.sm-search').style.display = 'none');
      this.allAppsContainer.style.display = 'block';
      this._renderAllApps();
    }

    _hideAllApps() {
      if (!this.allAppsContainer) return;
      this.allAppsContainer.style.display = 'none';
      this.panel.querySelectorAll('.sm-section-title, .sm-pinned, .sm-recommended, .sm-allapps-btn, .sm-footer')
        .forEach(el => el.style.display = '');
      this.panel.querySelector('.sm-search') && (this.panel.querySelector('.sm-search').style.display = '');
    }

    _renderAllApps() {
      const grid = this.allAppsContainer?.querySelector('.sm-allapps-grid');
      if (!grid) return;
      grid.innerHTML = '';
      this.allApps.forEach(app => {
        if (this.pinned.find(p => p.id === app.id)) return; // already pinned
        grid.appendChild(this._createAppTile(app, false));
      });
    }

    // ── App Tile (with right-click) ───────────────────
    _createAppTile(app, isPinned) {
      const tile = document.createElement('div');
      tile.className = 'sm-app';
      tile.innerHTML = `
        <div class="sm-app-icon"><span style="font-size:1.5rem;">${app.icon}</span></div>
        <span class="sm-app-label">${app.title}</span>
      `;
      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        // TODO: Open app
        if (window.openApp) window.openApp(app.id);
      });
      tile.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._showContextMenu(e, app, isPinned);
      });
      return tile;
    }

    _showContextMenu(e, app, isPinned) {
      this._hideContextMenu();
      const menu = document.createElement('div');
      menu.className = 'start-context-menu';
      menu.style.left = e.clientX + 'px';
      menu.style.top = e.clientY + 'px';
      if (isPinned) {
        menu.innerHTML = `
          <div class="scm-item" data-action="unpin">📌 Unpin from Start</div>
          <div class="scm-item" data-action="runas">🔒 Run as administrator</div>
        `;
      } else {
        menu.innerHTML = `
          <div class="scm-item" data-action="pin">📌 Pin to Start</div>
          <div class="scm-item" data-action="runas">🔒 Run as administrator</div>
        `;
      }
      document.body.appendChild(menu);
      this.contextMenu = menu;

      menu.querySelectorAll('.scm-item').forEach(item => {
        item.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const action = item.dataset.action;
          if (action === 'pin') this._pinApp(app);
          else if (action === 'unpin') this._unpinApp(app.id);
          else if (action === 'runas') alert(`Run "${app.title}" as administrator`);
          this._hideContextMenu();
        });
      });

      setTimeout(() => {
        document.addEventListener('click', () => this._hideContextMenu(), { once: true });
        document.addEventListener('contextmenu', () => this._hideContextMenu(), { once: true });
      }, 10);
    }

    _hideContextMenu() {
      if (this.contextMenu) {
        this.contextMenu.remove();
        this.contextMenu = null;
      }
    }

    // ── Recommended Section ───────────────────────────
    _renderRecommended() {
      if (!this.recommendedGrid) return;
      // Static recommended items for now
      this.recommendedGrid.innerHTML = `
        <div class="sm-rec-item">
          <div class="sm-rec-icon">📄</div>
          <div class="sm-rec-info"><div class="sm-rec-name">notes.txt</div><div class="sm-rec-meta">2 minutes ago</div></div>
        </div>
        <div class="sm-rec-item">
          <div class="sm-rec-icon">📁</div>
          <div class="sm-rec-info"><div class="sm-rec-name">Documents</div><div class="sm-rec-meta">Recently opened</div></div>
        </div>
        <div class="sm-rec-item">
          <div class="sm-rec-icon">⚙️</div>
          <div class="sm-rec-info"><div class="sm-rec-name">Settings</div><div class="sm-rec-meta">System · Display</div></div>
        </div>
        <div class="sm-rec-item">
          <div class="sm-rec-icon">💻</div>
          <div class="sm-rec-info"><div class="sm-rec-name">This PC</div><div class="sm-rec-meta">Local disk C:</div></div>
        </div>
      `;
    }
  }

  // Create global instance
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.StartMenu = new StartMenuService();
    });
  } else {
    window.StartMenu = new StartMenuService();
  }
})();