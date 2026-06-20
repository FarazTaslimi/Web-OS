// system/services/airplane.js – WebOS Airplane Mode Service (final)
(function() {
  class AirplaneService {
    constructor() {
      this.enabled = false;
      this.previousWifi = true;
      this.previousBluetooth = false;
      this.checkbox = document.getElementById('qs-airplane-cb');
      this._init();
      this._bindCheckbox();
    }

    async _init() {
      try {
        const res = await fetch('/api/airplane');
        const data = await res.json();
        this.enabled = data.enabled || false;
        this.previousWifi = data.previousWifi;
        this.previousBluetooth = data.previousBluetooth;
      } catch (e) { /* keep defaults */ }

      if (this.enabled) {
        // Ensure Wi‑Fi and Bluetooth files are also turned off (in case of inconsistency)
        await this._turnOffWifi();
        await this._turnOffBluetooth();
        this._applyAirplaneMode();
      } else {
        this._removeAirplaneMode();
      }
    }

    async _save() {
      try {
        await fetch('/api/airplane', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enabled: this.enabled,
            previousWifi: this.previousWifi,
            previousBluetooth: this.previousBluetooth
          })
        });
      } catch (e) { console.error('Failed to save airplane mode', e); }
    }

    _bindCheckbox() {
      if (!this.checkbox) return;
      this.checkbox.addEventListener('change', () => {
        if (this.checkbox.checked) {
          this.enableAirplaneMode();
        } else {
          this.disableAirplaneMode();
        }
      });
    }

    async enableAirplaneMode() {
      // Save current states
      try {
        const netRes = await fetch('/api/network');
        const netData = await netRes.json();
        this.previousWifi = netData.wifiEnabled;
      } catch (e) { this.previousWifi = true; }

      try {
        const btRes = await fetch('/api/bluetooth');
        const btData = await btRes.json();
        this.previousBluetooth = btData.enabled;
      } catch (e) { this.previousBluetooth = false; }

      await this._turnOffWifi();
      await this._turnOffBluetooth();

      this.enabled = true;
      await this._save();
      this._applyAirplaneMode();
    }

    async disableAirplaneMode() {
      this.enabled = false;
      await this._save();
      this._removeAirplaneMode();
    }

    async _turnOffWifi() {
      try {
        const res = await fetch('/api/network');
        const data = await res.json();
        data.wifiEnabled = false;
        data.connected = false;
        await fetch('/api/network', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (e) { /* ignore */ }
    }

    async _turnOffBluetooth() {
      try {
        const res = await fetch('/api/bluetooth');
        const data = await res.json();
        data.enabled = false;
        data.connected = false;
        await fetch('/api/bluetooth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (e) { /* ignore */ }
    }

    _applyAirplaneMode() {
      const wifiLabel = document.querySelector('label[for="qs-wifi-cb"]');
      const btLabel = document.querySelector('label[for="qs-bt-cb"]');
      const wifiCheckbox = document.getElementById('qs-wifi-cb');
      const btCheckbox = document.getElementById('qs-bt-cb');

      [wifiLabel, btLabel].forEach(label => {
        if (!label) return;
        label.style.opacity = '0.4';
        label.style.pointerEvents = 'none';
        if (!label.querySelector('.airplane-icon')) {
          const icon = document.createElement('span');
          icon.className = 'airplane-icon';
          icon.innerHTML = '✈️';
          icon.style.cssText = 'position:absolute; top:-6px; right:-6px; font-size:14px; color:#e74c3c; z-index:5;';
          label.style.position = 'relative';
          label.appendChild(icon);
        }
      });

      if (wifiCheckbox) wifiCheckbox.checked = false;
      if (btCheckbox) btCheckbox.checked = false;

      if (this.checkbox) this.checkbox.checked = true;

      // Refresh other services UI and dots
      if (window.NetworkService) {
        window.NetworkService.wifiEnabled = false;
        window.NetworkService.connected = false;
        window.NetworkService._updateDot();   // ← نقطه Wi‑Fi بلافاصله مخفی شود
        window.NetworkService._updateUI?.();  // در صورت وجود
      }
      if (window.BluetoothService) {
        window.BluetoothService.enabled = false;
        window.BluetoothService.connected = false;
        window.BluetoothService._updateUI?.();
      }
    }

    _removeAirplaneMode() {
      const wifiLabel = document.querySelector('label[for="qs-wifi-cb"]');
      const btLabel = document.querySelector('label[for="qs-bt-cb"]');

      [wifiLabel, btLabel].forEach(label => {
        if (!label) return;
        label.style.opacity = '';
        label.style.pointerEvents = '';
        const icon = label.querySelector('.airplane-icon');
        if (icon) icon.remove();
      });

      if (this.checkbox) this.checkbox.checked = false;

      // Re-enable dots (Wi-Fi dot will show based on its own state)
      if (window.NetworkService) {
        window.NetworkService._updateDot();   // ← نقطه Wi‑Fi دوباره نمایش داده شود
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AirplaneService = new AirplaneService();
    });
  } else {
    window.AirplaneService = new AirplaneService();
  }
})();