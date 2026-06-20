// system/core/services/system-service.js
// System service – loads all drivers from the drivers folder and registers their HTTP routes.

const fs = require('fs');
const path = require('path');

class SystemService {
    constructor() {
        this.drivers = [];    // Array of loaded driver modules
    }

    /**
     * Initializes the service: scans the drivers folder and loads each driver.
     * Called automatically by ServiceManager after instantiation.
     */
    async init() {
        console.log('[SystemService] Initializing and loading drivers...');
        await this.loadDrivers();
    }

    /**
     * Scans the drivers folder (system/core/drivers) and requires each .js file.
     * For each driver that exports a registerRoutes function, it stores the driver.
     * (Actual route registration is deferred until registerRoutes is called by the server.)
     */
    async loadDrivers() {
        const driversPath = path.join(__dirname, '../drivers');
        if (!fs.existsSync(driversPath)) {
            console.warn('[SystemService] Drivers folder not found:', driversPath);
            return;
        }
        const files = fs.readdirSync(driversPath).filter(f => f.endsWith('.js'));
        for (const file of files) {
            try {
                const driver = require(path.join(driversPath, file));
                if (typeof driver.registerRoutes === 'function') {
                    this.drivers.push(driver);
                    console.log(`[SystemService] Loaded driver: ${file}`);
                } else {
                    console.warn(`[SystemService] ${file} has no registerRoutes method – skipping`);
                }
            } catch (err) {
                console.error(`[SystemService] Failed to load driver ${file}:`, err);
            }
        }
    }

    /**
     * Registers all loaded drivers' routes with the Express app.
     * This method is called by the server (boot.js) after the service is started.
     * @param {Express} app - Express application instance
     */
    registerRoutes(app) {
        for (const driver of this.drivers) {
            try {
                driver.registerRoutes(app);
            } catch (err) {
                console.error('[SystemService] Error registering routes for a driver:', err);
            }
        }
        console.log('[SystemService] All driver routes registered.');
    }
}

module.exports = SystemService;