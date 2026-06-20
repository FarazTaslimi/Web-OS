// system/lib/index.js
// Loads all client libraries in the correct order.

(function() {
    const scripts = [
        'system/lib/client.js',          // core (CPU, RAM, file, etc.)
        'system/lib/network-client.js',  // adds WebOSLib.network
        'system/core/event-bus.js',      // EventBus for client events
        'system/lib/resources.js',       // WebOSResources & IC
        'system/ui/display-client.js',
        'system/core/service-manager.js' // client-side ServiceManager
    ];

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    async function loadAll() {
        for (const src of scripts) {
            await loadScript(src);
            console.log(`[Index] Loaded ${src}`);
        }
        console.log('[Index] All client libraries ready.');
        if (window.EventBus) {
            window.EventBus.dispatchEvent(new CustomEvent('libs:ready'));
        }
    }

    loadAll().catch(err => console.error('[Index] Library load error:', err));
})();