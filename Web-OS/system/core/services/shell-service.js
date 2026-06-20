// system/core/services/shell-service.js
'use strict';

class ShellService {
  async init() {
    console.log('[ShellService] Building desktop...');

    // 1. Completely remove the lock screen DOM
    // Remove the root element created by weblogin.js
    const root = document.getElementById('root');
    if (root) root.remove();
    // Also clear any leftover elements
    document.body.innerHTML = '';

    // 2. Add desktop stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'system/ui/shell.css';
    document.head.appendChild(link);

    // 3. Load desktop script (shell.js)
    await this.loadScript('system/ui/shell.js');

    // 4. Build the desktop UI
    if (typeof window.buildShell === 'function') {
      window.buildShell();
      console.log('[ShellService] Desktop built successfully.');
    } else {
      console.error('[ShellService] buildShell not found in shell.js');
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

  destroy() {
    // Clean up desktop elements if needed
    const selectors = ['#taskbar', '#desktop', '#wallpaper', '.panel', '#search-overlay', '#context-menu', '#taskview-overlay', '#widgets-panel', '#power-submenu', '#user-menu', '#start-app-ctx'];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });
    delete window.buildShell;
  }
}

window.ShellService = ShellService;