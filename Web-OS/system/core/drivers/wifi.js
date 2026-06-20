// system/core/drivers/wifi.js
// Simple Wi-Fi driver – registers API routes and delegates to network library.

const crypto = require('crypto');
const kernel = require('../../lib/kernel');
const { wifiScan, wifiStatus, wifiSetEnabled, wifiConnect } = require('../../lib/network');

async function enqueueNetworkOp(intensity = 2) {
    const commandId = crypto.randomBytes(8).toString('hex');
    const cmd = { commandId, action: 'networkOp', intensity };
    return await kernel.enqueueCpuCommand(cmd);
}

function registerRoutes(app) {
    app.get('/api/wifi/scan', async (req, res) => {
        try {
            await enqueueNetworkOp(3);
            const networks = await wifiScan();
            res.json({ networks });
        } catch (err) {
            console.error('WiFi scan error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/wifi/status', async (req, res) => {
        try {
            await enqueueNetworkOp(1);
            const status = await wifiStatus();
            res.json(status);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/wifi/toggle', async (req, res) => {
        const { enabled } = req.body;
        try {
            await enqueueNetworkOp(2);
            await wifiSetEnabled(enabled);
            res.json({ success: true, enabled });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/wifi/connect', async (req, res) => {
        const { ssid, password } = req.body;
        if (!ssid) return res.status(400).json({ error: 'SSID required' });
        try {
            await enqueueNetworkOp(4);
            await wifiConnect(ssid, password);
            res.json({ success: true, ssid });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
}

module.exports = { registerRoutes };