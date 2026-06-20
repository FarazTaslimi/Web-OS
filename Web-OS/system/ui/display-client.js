// system/core/drivers/display.js
// Display Driver for WebOS (client-side)
// Saves settings to server JSON file via API

class DisplayDriver {
    constructor() {
        this.screenElement = null;
        this.currentPage = null;
        this.settings = null;  // will be loaded from server
        this.apiUrl = '/api/display-settings';
        this.ready = false;
    }

    async loadSettings() {
        try {
            const res = await fetch(this.apiUrl);
            if (!res.ok) throw new Error('Failed to fetch settings');
            this.settings = await res.json();
        } catch (err) {
            console.warn('[DisplayDriver] Using default settings', err);
            this.settings = {
                brightness: 100,
                nightLight: false,
                nightLightIntensity: 0.3,
                scale: 100,
                resolution: { width: 1920, height: 1080 },
                refreshRate: 60,
                multipleDisplays: 'extend',
                hdr: false,
                vrr: false,
                autoColor: false,
                adaptiveBrightness: false
            };
        }
        return this.settings;
    }

    async saveSettings() {
        try {
            await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.settings)
            });
        } catch (err) {
            console.error('[DisplayDriver] Failed to save settings', err);
        }
    }

    // Apply visual effects based on current settings
    applyBrightness() {
        const brightnessValue = Math.max(0, Math.min(100, this.settings.brightness)) / 100;
        if (this.screenElement) {
            this.screenElement.style.filter = `brightness(${brightnessValue})`;
        }
    }

    applyNightLight() {
        let nightLightLayer = document.getElementById('nightlight-overlay');
        if (this.settings.nightLight) {
            if (!nightLightLayer) {
                nightLightLayer = document.createElement('div');
                nightLightLayer.id = 'nightlight-overlay';
                nightLightLayer.style.position = 'fixed';
                nightLightLayer.style.top = 0;
                nightLightLayer.style.left = 0;
                nightLightLayer.style.width = '100%';
                nightLightLayer.style.height = '100%';
                nightLightLayer.style.pointerEvents = 'none';
                nightLightLayer.style.zIndex = 99999;
                nightLightLayer.style.backgroundColor = `rgba(255, 180, 80, ${this.settings.nightLightIntensity})`;
                nightLightLayer.style.mixBlendMode = 'overlay';
                document.body.appendChild(nightLightLayer);
            } else {
                nightLightLayer.style.backgroundColor = `rgba(255, 180, 80, ${this.settings.nightLightIntensity})`;
            }
        } else {
            if (nightLightLayer) nightLightLayer.remove();
        }
    }

    applyScale() {
        const scalePercent = this.settings.scale / 100;
        if (this.screenElement) {
            this.screenElement.style.transform = `scale(${scalePercent})`;
            this.screenElement.style.transformOrigin = 'top left';
            this.screenElement.style.width = `${100 / scalePercent}%`;
        }
    }

    // Public methods to change settings
    async setBrightness(value) {
        this.settings.brightness = Math.min(100, Math.max(0, value));
        this.applyBrightness();
        await this.saveSettings();
    }

    async setNightLight(enabled, intensity = null) {
        this.settings.nightLight = enabled;
        if (intensity !== null) this.settings.nightLightIntensity = Math.min(1, Math.max(0, intensity));
        this.applyNightLight();
        await this.saveSettings();
    }

    async setScale(percent) {
        this.settings.scale = Math.min(200, Math.max(50, percent));
        this.applyScale();
        await this.saveSettings();
    }

    async setResolution(width, height) {
        this.settings.resolution = { width, height };
        await this.saveSettings();
    }

    async setRefreshRate(rate) {
        this.settings.refreshRate = rate;
        await this.saveSettings();
    }

    async setMultipleDisplays(mode) {
        this.settings.multipleDisplays = mode;
        await this.saveSettings();
    }

    // Getters
    getSettings() {
        return { ...this.settings };
    }

    // Initialize: create screen container, load settings, apply them
    async init() {
        if (!this.screenElement) {
            let screen = document.getElementById('webos-screen');
            if (!screen) {
                screen = document.createElement('div');
                screen.id = 'webos-screen';
                screen.style.position = 'relative';
                screen.style.width = '100%';
                screen.style.height = '100%';
                screen.style.overflow = 'auto';
                screen.style.transition = 'filter 0.2s ease';
                document.body.appendChild(screen);
            }
            this.screenElement = screen;
        }
        await this.loadSettings();
        this.applyBrightness();
        this.applyNightLight();
        this.applyScale();
        this.ready = true;
        console.log('[DisplayDriver] Initialized with server-stored settings');
        return this;
    }

    // Render a page (HTML string or URL) into the screen area
    render(content, isUrl = false) {
        if (!this.screenElement) this.init();
        if (isUrl) {
            fetch(content)
                .then(res => res.text())
                .then(html => {
                    this.screenElement.innerHTML = html;
                    this.executeScripts(this.screenElement);
                })
                .catch(err => console.error('[DisplayDriver] Failed to load page:', err));
        } else {
            this.screenElement.innerHTML = content;
            this.executeScripts(this.screenElement);
        }
    }

    executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
                newScript.async = false;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }
}

// Create singleton instance
const displayDriver = new DisplayDriver();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => displayDriver.init());
} else {
    displayDriver.init();
}

// Expose globally
window.displayDriver = displayDriver;