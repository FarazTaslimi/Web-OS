// system/services/nightlight.js – WebOS Night Light Service
(function() {
  class NightLightService {
    constructor() {
      this.enabled = false;
      this.intensity = 50; // 0-100
      this.checkbox = document.getElementById('qs-night-cb');
      this._init();
      this._bindCheckbox();
    }

    async _init() {
      try {
        const res = await fetch('/api/nightlight');
        const data = await res.json();
        this.enabled = data.enabled ?? false;
        this.intensity = data.intensity ?? 50;
      } catch (e) { /* keep defaults */ }
      this._apply();
      if (this.checkbox) this.checkbox.checked = this.enabled;
    }

    async _save() {
      try {
        await fetch('/api/nightlight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enabled: this.enabled,
            intensity: this.intensity
          })
        });
      } catch (e) { console.error('Failed to save night light', e); }
    }

    _bindCheckbox() {
      if (!this.checkbox) return;
      this.checkbox.addEventListener('change', () => {
        this.enabled = this.checkbox.checked;
        this._apply();
        this._save();
      });
    }

    _apply() {
      let overlay = document.getElementById('nightlight-overlay');
      
      if (!this.enabled) {
        if (overlay) overlay.remove();
        return;
      }

      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'nightlight-overlay';
        overlay.style.cssText = `
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9998;
          mix-blend-mode: multiply;
          transition: background 0.5s ease;
        `;
        document.body.appendChild(overlay);
      }

      // intensity 0-100 → opacity 0.0-0.6 (reasonable range for amber overlay)
      const opacity = (this.intensity / 100) * 0.6;
      overlay.style.background = `rgba(255, 180, 80, ${opacity})`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.NightLightService = new NightLightService();
    });
  } else {
    window.NightLightService = new NightLightService();
  }
})();