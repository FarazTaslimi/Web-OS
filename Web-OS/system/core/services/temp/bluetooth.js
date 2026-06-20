// system/services/bluetooth.js – WebOS Bluetooth Service (final)
(function() {
  class BluetoothService {
    constructor() {
      this.hardwareAvailable = true;
      this.enabled = false;
      this.connected = false;
      this.deviceName = '';
      this.devices = [];
      this.panel = null;
      this._init();
      this._ensurePanel();
      this._bindQuickSettings();
    }

    async _init() {
      try {
        const hwRes = await fetch('/api/bluetooth/hardware-status');
        const hwData = await hwRes.json();
        this.hardwareAvailable = hwData.available;
      } catch (e) {
        this.hardwareAvailable = true;
      }

      try {
        const res = await fetch('/api/bluetooth');
        const data = await res.json();
        this.enabled = data.enabled && this.hardwareAvailable;
        this.connected = data.connected;
        this.deviceName = data.deviceName;
        this.devices = data.devices || [];
      } catch (e) { /* keep defaults */ }

      this._loadRealDevices();
      this._updateUI();
    }

    async _loadRealDevices() {
      try {
        const res = await fetch('/api/bluetooth/devices');
        const data = await res.json();
        this.devices = data.devices;
      } catch (e) { /* ignore */ }
    }

    async _save() {
      try {
        await fetch('/api/bluetooth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enabled: this.enabled,
            connected: this.connected,
            deviceName: this.deviceName,
            devices: this.devices
          })
        });
      } catch (e) { console.error('Failed to save bluetooth', e); }
    }

    _ensurePanel() {
      if (document.getElementById('bt-panel')) {
        this.panel = document.getElementById('bt-panel');
        return;
      }
      const panel = document.createElement('div');
      panel.id = 'bt-panel';
      panel.className = 'panel';
      document.body.appendChild(panel);
      this.panel = panel;
    }

    _bindQuickSettings() {
      const btLabel = document.querySelector('label[for="qs-bt-cb"]');
      if (!btLabel) return;
      const checkbox = document.getElementById('qs-bt-cb');

      btLabel.style.opacity = '1';
      btLabel.style.pointerEvents = 'auto';
      btLabel.title = 'Open Bluetooth panel';
      if (checkbox) {
        checkbox.disabled = false;
        checkbox.checked = this.enabled;
      }

      btLabel.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('vol-panel')?.classList.remove('show');
        this._loadRealDevices();
        this._togglePanel();
      });
    }

    _togglePanel() {
      if (!this.panel) return;
      const isOpen = this.panel.classList.contains('show');
      if (isOpen) {
        this.panel.classList.remove('show');
      } else {
        document.querySelectorAll('.panel.show').forEach(p => p.classList.remove('show'));
        this._buildPanelContent();
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

    _buildPanelContent() {
      if (!this.panel) return;
      this.panel.innerHTML = '';

      const headerHTML = `
        <div class="bt-header">
          <span class="bt-title">Bluetooth</span>
          <div class="bt-toggle-pill${this.enabled ? '' : ' off'}" id="bt-toggle"></div>
        </div>
      `;

      if (!this.enabled) {
        this.panel.innerHTML = headerHTML + `<div style="text-align:center;color:var(--text-dim);padding:20px;">Bluetooth is turned off</div>`;
      } else {
        let devicesHTML = '';
        this.devices.forEach(dev => {
          const bars = Math.max(0, Math.round(dev.signal / 25));
          devicesHTML += `
            <div class="bt-device-item${dev.name === this.deviceName ? ' connected' : ''}" data-device="${dev.name}">
              <div class="bt-device-icon">${this._getIcon(dev.type)}</div>
              <div class="bt-device-name">${dev.name}</div>
              <div class="bt-device-signal">${'▮'.repeat(bars)}</div>
              ${dev.name === this.deviceName ? '<span class="bt-connected-badge">Connected</span>' : ''}
            </div>
          `;
        });

        this.panel.innerHTML = headerHTML + devicesHTML + `
          <hr class="bt-sep"/>
          <div class="bt-send-section">
            <button class="bt-send-btn" id="bt-send-btn">📁 Send File from Workspace</button>
          </div>
        `;
      }

      this._bindPanelEvents();
    }

    _bindPanelEvents() {
      if (!this.panel) return;

      const toggleBtn = this.panel.querySelector('#bt-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.enabled = !this.enabled;
          if (!this.enabled) {
            this.connected = false;
            this.deviceName = '';
          }
          this._buildPanelContent();
          this._adjustPosition();
          this._save();
          const checkbox = document.getElementById('qs-bt-cb');
          if (checkbox) checkbox.checked = this.enabled;
        });
      }

      this.panel.querySelectorAll('.bt-device-item:not(.connected)').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deviceName = item.dataset.device;
          this.connected = true;
          this._buildPanelContent();
          this._adjustPosition();
          this._save();
        });
      });

      const sendBtn = this.panel.querySelector('#bt-send-btn');
      if (sendBtn) {
        sendBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            const res = await fetch('/api/bluetooth/send-file', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({})
            });
            const data = await res.json();
            alert(data.message);
          } catch (err) {
            alert('Error: ' + err.message);
          }
        });
      }
    }

    _getIcon(type) {
      switch (type) {
        case 'headphones': return '🎧';
        case 'speaker': return '🔊';
        case 'phone': return '📱';
        case 'earbuds': return '🎧';
        default: return '📡';
      }
    }

    _updateUI() {
      if (this.panel?.classList.contains('show')) {
        this._buildPanelContent();
        this._adjustPosition();
      }
      const checkbox = document.getElementById('qs-bt-cb');
      if (checkbox) checkbox.checked = this.enabled;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.BluetoothService = new BluetoothService();
    });
  } else {
    window.BluetoothService = new BluetoothService();
  }
})();