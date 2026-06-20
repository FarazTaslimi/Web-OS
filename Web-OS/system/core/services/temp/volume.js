// system/services/volume.js – WebOS Volume Service (real audio control)
(function() {
  class VolumeService {
    constructor() {
      this.level = 0.72;               // مقدار واقعی صدا (0 تا 1)
      this.slider = document.querySelector('#vol-panel .vol-slider'); // اسلایدر اول
      this._initAudio();
      this._init();
    }

    // ایجاد AudioContext و GainNode سراسری
    _initAudio() {
      if (!window.audioCtx) {
        window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        window.audioGain = window.audioCtx.createGain();
        window.audioGain.gain.value = this.level;
        window.audioGain.connect(window.audioCtx.destination);
      }
    }

    async _init() {
      try {
        const res = await fetch('/api/volume');
        const data = await res.json();
        this.level = (data.main || 72) / 100;
      } catch (e) { /* keep defaults */ }
      this._apply();
      this._bindEvents();
    }

    async _save() {
      try {
        await fetch('/api/volume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ main: Math.round(this.level * 100) })
        });
      } catch (e) { console.error('Failed to save volume', e); }
    }

    _apply() {
      // به‌روزرسانی GainNode
      if (window.audioGain) {
        window.audioGain.gain.value = this.level;
      }
      // به‌روزرسانی اسلایدر
      if (this.slider) {
        this.slider.value = Math.round(this.level * 100);
        const label = this.slider.nextElementSibling;
        if (label) label.textContent = Math.round(this.level * 100) + '%';
      }
      // ذخیره در متغیر سراسری برای برنامه‌های دیگر
      window.systemVolume = this.level;
    }

    _bindEvents() {
      this.slider?.addEventListener('input', () => {
        this.level = parseInt(this.slider.value) / 100;
        this._apply();
        this._save();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new VolumeService());
  } else {
    new VolumeService();
  }
})();