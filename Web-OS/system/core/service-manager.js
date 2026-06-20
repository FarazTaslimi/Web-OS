// system/core/service-manager.js
// Unified service manager for both server (Node.js) and client (browser).
// Server: loads SystemService (drivers). Client: loads ShellService and WindowService,
// and automatically allocates RAM based on file sizes via registerService.

const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

// Only load Node.js modules on the server
let path;
if (isNode) {
    path = require('path');
}

// Server-side services (only when running in Node.js)
const serverDefinitions = [
    {
        name: 'system',
        script: 'system/core/services/system-service.js',
        className: 'SystemService'
    }
];

// Client-side services (only when running in browser)
const clientDefinitions = [
    {
        name: 'shell',
        script: 'system/core/services/shell-service.js',
        className: 'ShellService',
        resources: ['system/ui/shell.js', 'system/ui/shell.css']
    },
    {
        name: 'window',
        script: 'system/core/services/window-service.js',
        className: 'WindowService',
        resources: ['system/ui/window.js']
    }
];

class ServiceManager {
    constructor() {
        this.services = new Map();
        this.isBootstrapped = false;
        this.definitions = isNode ? serverDefinitions : clientDefinitions;
    }

    // Load a script dynamically (browser) or require (Node.js)
    async loadScript(src) {
        if (!isNode) {
            // Browser: create <script> tag
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.head.appendChild(script);
            });
        } else {
            // Server: resolve absolute path from project root
            const absolutePath = path.resolve(process.cwd(), src);
            try {
                const module = require(absolutePath);
                return module;
            } catch (err) {
                throw new Error(`Cannot load ${src} from ${absolutePath}: ${err.message}`);
            }
        }
    }

    // Start a single service
    async startService(def) {
        if (this.services.has(def.name)) return this.services.get(def.name).instance;
        console.log(`[ServiceManager] Starting ${def.name}...`);

        let ServiceClass = null;
        try {
            if (isNode) {
                const module = await this.loadScript(def.script);
                ServiceClass = module[def.className] || module;
            } else {
                if (!window[def.className]) {
                    await this.loadScript(def.script);
                }
                ServiceClass = window[def.className];
            }
            if (!ServiceClass) throw new Error(`Class ${def.className} not found`);
        } catch (err) {
            throw new Error(`Failed to load ${def.script}: ${err.message}`);
        }

        const instance = new ServiceClass();
        this.services.set(def.name, { instance, status: 'starting' });

        // Call init() if present
        if (instance.init && typeof instance.init === 'function') {
            await instance.init();
        }

        // Client-side only: automatically allocate RAM based on file sizes
        if (!isNode && window.WebOSLib && def.resources) {
            try {
                const files = [def.script, ...(def.resources || [])];
                const result = await window.WebOSLib.registerService(def.name, files);
                console.log(`[ServiceManager] Registered ${def.name}, allocated ${result.ramMB} MB RAM`);
            } catch (err) {
                console.warn(`[ServiceManager] Failed to register ${def.name}:`, err);
            }
        }

        this.services.get(def.name).status = 'running';
        console.log(`[ServiceManager] ${def.name} started successfully.`);
        return instance;
    }

    // Start all services according to the environment (server or client)
    async startAll() {
        if (this.isBootstrapped) return;
        for (const def of this.definitions) {
            await this.startService(def);
        }
        this.isBootstrapped = true;
        if (!isNode && window.EventBus) {
            window.EventBus.dispatchEvent(new CustomEvent('services:ready'));
        }
        console.log('[ServiceManager] All services started.');
    }

    // Retrieve a running service instance
    getService(name) {
        const entry = this.services.get(name);
        return entry ? entry.instance : null;
    }
}

// Export for Node.js, or create global instance for browser
if (isNode) {
    module.exports = new ServiceManager();
} else {
    window.ServiceManager = new ServiceManager();
}