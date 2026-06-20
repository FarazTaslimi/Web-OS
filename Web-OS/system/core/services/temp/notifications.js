// system/services/notifications.js – WebOS Notification Service (DND blocks toast)
(function() {
  class NotificationService {
    constructor() {
      this.notifications = [];
      this.dnd = localStorage.getItem('webos-dnd') === 'true';
      this.listeners = [];
      this.newListeners = [];
      this.panel = document.getElementById('notif-panel');
      this.bellBtn = document.getElementById('btn-notif-label');
      this.notifList = document.getElementById('notif-list');
      this.notifDot = document.querySelector('.notif-dot');
      this.btnClearAll = document.getElementById('btn-clear-all');
      this.btnDnd = document.getElementById('btn-dnd');
      this.dndCheckbox = document.getElementById('qs-dnd-cb');
      this.toast = this._createToastElement();
      this.toastTimer = null;

      this._init();
      this._bindBellBtn();
      this._bindClearDnd();
      this._bindDndCheckbox();
      this._syncDndUI();
    }

    async _init() {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        this.notifications = data.map(n => ({
          ...n,
          time: new Date(n.time)
        }));
      } catch (e) {}
      this._render();
    }

    _syncDndUI() {
      if (this.btnDnd) this.btnDnd.classList.toggle('active', this.dnd);
      if (this.dndCheckbox) this.dndCheckbox.checked = this.dnd;
    }

    _bindClearDnd() {
      if (this.btnClearAll) {
        this.btnClearAll.addEventListener('click', () => {
          this.clearAll();
          if (this.panel.classList.contains('show')) {
            setTimeout(() => this._adjustPosition(), 50);
          }
        });
      }
      if (this.btnDnd) {
        this.btnDnd.addEventListener('click', () => {
          this.toggleDnd();
        });
      }
    }

    _bindDndCheckbox() {
      if (this.dndCheckbox) {
        this.dndCheckbox.addEventListener('change', () => {
          this.dnd = this.dndCheckbox.checked;
          localStorage.setItem('webos-dnd', this.dnd);
          this._syncDndUI();
        });
      }
    }

    _bindBellBtn() {
      if (!this.bellBtn) return;
      this.bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._togglePanel();
        setTimeout(() => this.markAllRead(), 500);
      });
    }

    _togglePanel() {
      const isOpen = this.panel.classList.contains('show');
      if (isOpen) {
        this.panel.classList.remove('show');
      } else {
        document.querySelectorAll('.panel.show').forEach(p => p.classList.remove('show'));
        this._render();
        this.panel.style.display = 'block';
        this.panel.style.visibility = 'hidden';
        this._adjustPosition();
        this.panel.style.visibility = 'visible';
        this.panel.classList.add('show');
      }
    }

    _adjustPosition() {
      const tb = document.getElementById('taskbar');
      if (!tb) return;
      const tbRect = tb.getBoundingClientRect();
      this.panel.style.right = (window.innerWidth - tbRect.right) + 'px';
      this.panel.style.top = (tbRect.top - this.panel.offsetHeight - 10) + 'px';
      this.panel.style.left = 'auto';
      this.panel.style.bottom = 'auto';
    }

    _render() {
      if (!this.notifList) return;
      const notifs = this.notifications;
      if (notifs.length === 0) {
        this.notifList.innerHTML = '<div style="text-align:center;color:var(--text-dim);padding:20px;">No notifications</div>';
      } else {
        this.notifList.innerHTML = notifs.map(n => `
          <div class="np-card" data-id="${n.id}">
            <div class="np-card-title">${n.title}</div>
            <div class="np-card-body">${n.body}</div>
            <div class="np-card-time">${n.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
            <div class="np-card-actions">
              <button class="np-card-btn settings" data-action="settings" data-id="${n.id}" title="Settings">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><circle cx="8" cy="8" r="3"/><path d="M8 2v2M8 12v2M2 8h2M12 8h2M4.22 4.22l1.42 1.42M10.36 10.36l1.42 1.42M4.22 11.78l1.42-1.42M10.36 5.64l1.42-1.42"/></svg>
              </button>
              <button class="np-card-btn close" data-action="close" data-id="${n.id}" title="Close">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/></svg>
              </button>
            </div>
          </div>
        `).join('');
      }

      this.notifList.querySelectorAll('.np-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          const id = btn.dataset.id;
          if (action === 'close') {
            this.remove(id);
            if (this.panel.classList.contains('show')) {
              setTimeout(() => this._adjustPosition(), 50);
            }
          } else if (action === 'settings') {
            alert('Notification settings for: ' + id);
          }
        });
      });

      this._updateDot();
    }

    _updateDot() {
      if (!this.notifDot) return;
      const total = this.notifications.length;
      const hasUnread = this.hasUnread();
      if (total === 0) {
        this.notifDot.className = 'notif-dot hidden';
      } else if (hasUnread) {
        this.notifDot.className = 'notif-dot pulse';
      } else {
        this.notifDot.className = 'notif-dot static';
      }
    }

    _createToastElement() {
      const toast = document.createElement('div');
      toast.className = 'notif-toast';
      toast.innerHTML = `
        <div class="notif-toast-content">
          <div class="notif-toast-title"></div>
          <div class="notif-toast-body"></div>
        </div>
      `;
      document.body.appendChild(toast);
      return toast;
    }

    _showToast(notification) {
      // اگر DND فعال است، Toast نمایش داده نشود
      if (this.dnd) return;

      const titleEl = this.toast.querySelector('.notif-toast-title');
      const bodyEl = this.toast.querySelector('.notif-toast-body');
      titleEl.textContent = notification.title;
      bodyEl.textContent = notification.body;

      const tb = document.getElementById('taskbar');
      const tbRect = tb.getBoundingClientRect();
      this.toast.style.left = 'auto';
      this.toast.style.right = (window.innerWidth - tbRect.right) + 'px';
      this.toast.style.bottom = (window.innerHeight - tbRect.top + 10) + 'px';
      this.toast.classList.add('show');

      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toast.classList.remove('show');
        this.toast.classList.add('hide');
        setTimeout(() => {
          this.toast.classList.remove('hide');
        }, 500);
      }, 5000);
    }

    // ── متدهای عمومی ──
    add(title, body) {
      const notif = {
        id: 'notif-' + Date.now(),
        title: title,
        body: body,
        time: new Date(),
        read: false
      };
      this.notifications.unshift(notif);
      this._render();
      this._save();
      this.newListeners.forEach(cb => cb(notif));
      this._showToast(notif);   // فقط در صورت غیرفعال بودن DND نمایش داده می‌شود
      return notif.id;
    }

    remove(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
      this._render();
      this._save();
    }

    clearAll() {
      this.notifications = [];
      this._render();
      this._save();
    }

    markAllRead() {
      this.notifications.forEach(n => n.read = true);
      this._render();
      this._save();
    }

    hasUnread() {
      return this.notifications.some(n => !n.read);
    }

    toggleDnd() {
      this.dnd = !this.dnd;
      localStorage.setItem('webos-dnd', this.dnd);
      this._syncDndUI();
    }

    onChange(callback) { this.listeners.push(callback); }
    onNew(callback) { this.newListeners.push(callback); }

    async _save() {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notifications: this.notifications })
        });
      } catch (e) { console.error('Failed to save notifications', e); }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.Notifications = new NotificationService();
    });
  } else {
    window.Notifications = new NotificationService();
  }
})();