// system/services/network.js
(function () {

  class NetworkService {
    constructor() {
      this.wifiEnabled     = false;
      this.connected       = false;
      this.ssid            = '';
      this.signal          = 0;
      this.networks        = [];
      this.scannedNetworks = [];
      this.hasInternet     = false;
      this.panel           = null;

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._setup());
      } else {
        this._setup();
      }
    }

    async _setup() {
      this.panel = document.getElementById('wifi-panel');
      await this._load();
      this._ensureDot();
      this._updateDot();
      this._bindQuickSettings();
      this._bindPanelClose();
    }

    async _load() {
      try {
        const res = await fetch('/api/network');
        if (!res.ok) throw new Error();
        const data = await res.json();
        this.wifiEnabled = data.wifiEnabled ?? false;
        this.connected   = data.connected   ?? false;
        this.ssid        = data.ssid        ?? '';
        this.signal      = data.signal      ?? 0;
        this.networks    = data.networks    ?? [];
      } catch (e) {
        this.wifiEnabled = false;
        this.connected   = false;
        this.ssid        = '';
        this.signal      = 0;
        this.networks    = [];
      }
    }

    async _save() {
      try {
        await fetch('/api/network', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wifiEnabled: this.wifiEnabled,
            connected:   this.connected,
            ssid:        this.ssid,
            signal:      this.signal,
            networks:    this.networks,
          })
        });
      } catch (e) { console.error('Failed to save network', e); }
    }

    async _scan() {
      try {
        const res = await fetch('/api/network/scan');
        if (!res.ok) throw new Error();
        const data = await res.json();
        this.scannedNetworks = data.networks    ?? [];
        this.hasInternet     = data.hasInternet ?? false;
      } catch (e) {
        this.scannedNetworks = [];
        this.hasInternet     = false;
      }
    }

    _ensureDot() {
      const label = document.querySelector('label[for="qs-wifi-cb"]');
      if (!label || label.querySelector('.wifi-dot')) return;
      label.style.position = 'relative';
      const dot = document.createElement('span');
      dot.className    = 'wifi-dot';
      dot.title        = 'Wi-Fi Networks';
      dot.dataset.state = 'off';
      label.appendChild(dot);

      dot.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('.panel.show').forEach(function(p) {
          p.classList.remove('show');
        });
        window.NetworkService._openPanel();
      });

      // اگر Airplane Mode فعال بود، نقطه را مخفی کن
      if (window.AirplaneService && window.AirplaneService.enabled) {
        dot.style.display = 'none';
      }
    }

    _updateDot() {
      const dot = document.querySelector('label[for="qs-wifi-cb"] .wifi-dot');
      const cb  = document.getElementById('qs-wifi-cb');
      if (cb) cb.checked = this.wifiEnabled;
      if (!dot) return;

      // ★ اگر Airplane Mode فعال است، نقطه کاملاً مخفی شود
      if (window.AirplaneService && window.AirplaneService.enabled) {
        dot.style.display = 'none';
        return;
      }

      dot.style.display = 'block';

      if (this.connected && this.ssid === 'Lenovo') {
        dot.dataset.state = 'connected';
      } else if (this.wifiEnabled && this.scannedNetworks.some(function(n) { return n.ssid === 'Lenovo'; })) {
        dot.dataset.state = 'found';
      } else {
        dot.dataset.state = 'off';
      }
    }

    _bindQuickSettings() {
      var self = this;
      var wifiLabel = document.querySelector('label[for="qs-wifi-cb"]');
      if (wifiLabel) {
        wifiLabel.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          if (e.target.closest('.wifi-dot')) return;
          self._toggleWifi();
        });
      }

      var airplaneLabel = document.querySelector('label[for="qs-airplane-cb"]');
      if (airplaneLabel) {
        airplaneLabel.addEventListener('click', function(e) {
          e.stopPropagation();
          var cb = document.getElementById('qs-airplane-cb');
          if (cb && cb.checked) self._setWifi(false);
        });
      }
    }

    _bindPanelClose() {
      var self = this;
      document.addEventListener('click', function(e) {
        if (!self.panel) return;
        if (!self.panel.classList.contains('show')) return;
        if (e.target.closest('#wifi-panel')) return;
        if (e.target.closest('.wifi-dot')) return;
        self.panel.classList.remove('show');
      });
    }

    async _openPanel() {
      if (!this.panel) return;
      this.panel.innerHTML = '<div class="wifi-loading"><div class="wifi-spinner"></div><span>Scanning...</span></div>';
      this.panel.style.display    = 'block';
      this.panel.style.visibility = 'hidden';
      this._adjustPosition();
      this.panel.style.visibility = 'visible';
      this.panel.classList.add('show');

      if (this.wifiEnabled) await this._scan();
      this._updateDot();
      this._buildPanel();
      this._adjustPosition();
    }

    _adjustPosition() {
      var tb = document.getElementById('taskbar');
      if (!tb || !this.panel) return;
      var r = tb.getBoundingClientRect();
      this.panel.style.right  = (window.innerWidth - r.right) + 'px';
      this.panel.style.top    = (r.top - this.panel.offsetHeight - 10) + 'px';
      this.panel.style.left   = 'auto';
      this.panel.style.bottom = 'auto';
    }

    _buildPanel() {
      if (!this.panel) return;
      var self = this;
      var networksHTML = '';

      if (this.wifiEnabled) {
        if (this.scannedNetworks.length === 0) {
          networksHTML = '<div class="wifi-empty">No networks found</div>';
        } else {
          this.scannedNetworks.forEach(function(net) {
            var isConn = net.ssid === self.ssid && self.connected;
            var badge  = '';
            if (isConn) {
              badge = self.hasInternet
                ? '<div class="wifi-connected-badge">Connected</div>'
                : '<div class="wifi-connected-badge no-internet">No Internet</div>';
            }
            var lock = net.secured
              ? '<svg class="wifi-lock" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="8" height="6" rx="1"/><path d="M4 5V4a2 2 0 0 1 4 0v1"/></svg>'
              : '';
            networksHTML += '<div class="wifi-network-item' + (isConn ? ' connected' : '') + '" data-ssid="' + net.ssid + '">'
              + '<div class="wifi-signal-icon">' + self._signalBars(net.signal) + '</div>'
              + '<div class="wifi-net-info"><div class="wifi-network-name">' + net.ssid + '</div>' + badge + '</div>'
              + lock
              + '</div>';
          });
        }
      }

      var offMsg = '<div class="wifi-off-msg">'
        + '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>'
        + '<span>Wi-Fi is turned off</span></div>';

      this.panel.innerHTML = '<div class="wifi-panel-header">'
        + '<button class="wifi-back-btn" id="wifi-back-btn"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3L5 8l5 5"/></svg></button>'
        + '<span class="wifi-panel-title">Wi-Fi</span>'
        + '<div class="wifi-toggle-pill' + (this.wifiEnabled ? '' : ' off') + '" id="wifi-toggle-btn"><div class="wifi-toggle-thumb"></div></div>'
        + '</div>'
        + (this.wifiEnabled ? '<div class="wifi-networks">' + networksHTML + '</div>' : offMsg);

      // دکمه برگشت
      var backBtn = this.panel.querySelector('#wifi-back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          self.panel.classList.remove('show');
          var volPanel = document.getElementById('vol-panel');
          if (volPanel) {
            volPanel.style.display    = 'block';
            volPanel.style.visibility = 'hidden';
            var tb = document.getElementById('taskbar');
            if (tb) {
              var tbRect = tb.getBoundingClientRect();
              volPanel.style.right  = (window.innerWidth - tbRect.right) + 'px';
              volPanel.style.top    = (tbRect.top - volPanel.offsetHeight - 10) + 'px';
              volPanel.style.left   = 'auto';
              volPanel.style.bottom = 'auto';
            }
            volPanel.style.visibility = 'visible';
            volPanel.classList.add('show');
          }
        });
      }

      // toggle
      var toggleBtn = this.panel.querySelector('#wifi-toggle-btn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          self._toggleWifi();
          if (self.wifiEnabled) {
            self._scan().then(function() {
              self._updateDot();
              self._buildPanel();
              self._adjustPosition();
            });
          } else {
            self._updateDot();
            self._buildPanel();
            self._adjustPosition();
          }
        });
      }

      // اتصال به شبکه
      this.panel.querySelectorAll('.wifi-network-item:not(.connected)').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          self._connectTo(item.dataset.ssid);
          self._updateDot();
          self._buildPanel();
          self._adjustPosition();
        });
      });

      // قطع اتصال
      this.panel.querySelectorAll('.wifi-network-item.connected').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          self._disconnect();
          self._updateDot();
          self._buildPanel();
          self._adjustPosition();
        });
      });
    }

    _signalBars(signal) {
      var level = signal >= 75 ? 4 : signal >= 50 ? 3 : signal >= 25 ? 2 : 1;
      var bars  = [{x:0,h:3,y:10},{x:4,h:5,y:8},{x:8,h:8,y:5},{x:12,h:13,y:0}];
      var svg   = '<svg width="16" height="13" viewBox="0 0 16 13" fill="none">';
      bars.forEach(function(b, i) {
        var fill = i < level ? 'var(--accent)' : 'rgba(0,0,0,0.15)';
        svg += '<rect x="' + b.x + '" y="' + b.y + '" width="3" height="' + b.h + '" rx="1" fill="' + fill + '"/>';
      });
      return svg + '</svg>';
    }

    _toggleWifi() { this._setWifi(!this.wifiEnabled); }

   _setWifi(state) {
      var self = this;
      this.wifiEnabled = state;
      if (!state) {
        this.connected       = false;
        this.ssid            = '';
        this.signal          = 0;
        this.scannedNetworks = [];
        this._save();
        this._updateDot();
      } else {
        this._save();
        this._updateDot();
        // بعد از روشن کردن scan کن و رنگ رو آپدیت کن
        this._scan().then(function() {
          self._updateDot();
        });
      }
    }

    _connectTo(ssid) {
      if (!this.wifiEnabled) return;
      var net    = this.scannedNetworks.find(function(n) { return n.ssid === ssid; });
      this.ssid      = ssid;
      this.connected = true;
      this.signal    = net ? net.signal : 50;
      this._save();
    }

    _disconnect() {
      this.connected = false;
      this.ssid      = '';
      this.signal    = 0;
      this._save();
    }
  }

  window.NetworkService = new NetworkService();
})();