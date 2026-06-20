// system/core/drivers/display.js
// Server-side display driver — registers API routes only.

const crypto = require('crypto');
const kernel = require('../../lib/kernel');
const fs = require('fs').promises;
const path = require('path');

const displaySettingsPath = path.join(process.cwd(), 'system', 'data', 'display.json');

const defaults = {
    brightness: 100, nightLight: false, nightLightIntensity: 0.3,
    scale: 100, resolution: { width: 1920, height: 1080 },
    refreshRate: 60, multipleDisplays: 'extend',
    hdr: false, vrr: false, autoColor: false, adaptiveBrightness: false
};

async function readSettings() {
    try {
        const data = await fs.readFile(displaySettingsPath, 'utf8');
        return JSON.parse(data);
    } catch { return { ...defaults }; }
}

module.exports = {
    registerRoutes(app) {
        app.get('/api/display-settings', async (req, res) => {
            try { res.json(await readSettings()); }
            catch (err) { res.status(500).json({ error: err.message }); }
        });

        app.post('/api/display-settings', async (req, res) => {
            try {
                await fs.writeFile(displaySettingsPath, JSON.stringify(req.body, null, 2));
                res.json({ success: true });
            } catch (err) { res.status(500).json({ error: err.message }); }
        });
    }
};