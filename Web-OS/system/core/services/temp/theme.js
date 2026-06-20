// system/services/theme.js – Theme Switcher (safe wallpaper)
(function() {
  class ThemeService {
    constructor() {
      this.active = 'light';
      this.checkbox = document.getElementById('qs-dark-cb');
      this._init();
      this._bindCheckbox();
    }

    async _init() {
      try {
        const res = await fetch('/api/theme');
        const data = await res.json();
        this.active = data.active || 'light';
      } catch(e) {}
      this._applyTheme();
    }

    _applyTheme() {
      // تغییر فایل CSS تم
      const themeLink = document.getElementById('theme-stylesheet');
      if (themeLink) {
        themeLink.href = `themes/${this.active}-theme/theme.css`;
      }

      // تلاش برای تغییر والپیپر (اگر فایل موجود باشد)
      const wallpaperUrl = `themes/${this.active}-theme/wallpaper.jpg`;
      const img = new Image();
      img.onload = () => {
        document.body.style.backgroundImage = `url('${wallpaperUrl}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
      };
      img.onerror = () => {
        // اگر والپیپر نبود، پس‌زمینه را به رنگ پیش‌فرض تم برگردان
        document.body.style.backgroundImage = 'none';
      };
      img.src = wallpaperUrl;

      // به‌روزرسانی checkbox
      if (this.checkbox) {
        this.checkbox.checked = this.active === 'dark';
      }
    }

    _bindCheckbox() {
      if (!this.checkbox) return;
      this.checkbox.addEventListener('change', () => {
        this.active = this.checkbox.checked ? 'dark' : 'light';
        this._applyTheme();
        this._save();
      });
    }

    async _save() {
      try {
        await fetch('/api/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: this.active })
        });
      } catch(e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ThemeService());
  } else {
    new ThemeService();
  }
})();