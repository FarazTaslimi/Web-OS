// system/core/services/window-service.js
// Client-side service that loads the window manager (WM) and delegates all window operations.

'use strict';

class WindowService {
  async init() {
    console.log('[WindowService] Loading window.js...');
    await this.loadScript('system/ui/window.js');
    // Wait a tick for WM to be fully initialised (its own DOMContentLoaded)
    await new Promise(r => setTimeout(r, 0));
    if (typeof WM === 'undefined') {
      throw new Error('WM not found after loading window.js');
    }
    console.log('[WindowService] Ready');
    if (window.EventBus) {
      window.EventBus.dispatchEvent(new CustomEvent('window:ready'));
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  // Delegate all WM methods
  create(opts) { return WM.create(opts); }
  close(id) { WM.close(id); }
  minimize(id) { WM.minimize(id); }
  maximize(id) { WM.maximize(id); }
  restore(id) { WM.restore(id); }
  toggleMaximize(id) { WM.toggleMaximize(id); }
  focus(id) { WM.focus(id); }
  setTitle(id, title) { WM.setTitle(id, title); }
  setContent(id, content) { WM.setContent(id, content); }
  getEl(id) { return WM.getEl(id); }
  getContentEl(id) { return WM.getContentEl(id); }

  destroy() {
    // Close all open windows
    if (WM && WM.windows) {
      for (let [id] of WM.windows) {
        WM.close(id);
      }
    }
  }
}

window.WindowService = WindowService;