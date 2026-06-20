// system/services/brightness.js – WebOS Brightness Service (removes overlay at 100%)
(function() {
  class BrightnessService {
    constructor() {
      this.level = 80;
      this.slider = document.querySelectorAll('#vol-panel .vol-slider')[1];
      this._init();
    }

    async _init() {
      try {
        const res = await fetch('/api/brightness');
        const data = await res.json();
        this.level = data.level || 80;
      } catch (e) {}
      this._apply();
      this._bindEvents();
    }

    async _save() {
      try {
        await fetch('/api/brightness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level: this.level })
        });
      } catch (e) { console.error('Failed to save brightness', e); }
    }

    _apply() {
      const opacity = (100 - this.level) / 100;
      let overlay = document.getElementById('brightness-overlay');

      if (opacity <= 0) {
        // حذف کامل overlay وقتی روشنایی ۱۰۰٪ است
        if (overlay) overlay.remove();
        overlay = null;
      } else {
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'brightness-overlay';
          overlay.style.cssText = `
            position: fixed; inset: 0; pointer-events: none;
            background: black; z-index: 9999; opacity: 0;
            transition: opacity 0.3s ease;
          `;
          document.body.appendChild(overlay);
        }
        overlay.style.opacity = opacity;
      }

      if (this.slider) {
        this.slider.value = this.level;
        const label = this.slider.nextElementSibling;
        if (label) label.textContent = this.level + '%';
      }
    }

    _bindEvents() {
      this.slider?.addEventListener('input', () => {
        this.level = parseInt(this.slider.value);
        this._apply();
        this._save();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BrightnessService());
  } else {
    new BrightnessService();
  }
})();