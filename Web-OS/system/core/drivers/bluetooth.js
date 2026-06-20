// system/core/drivers/bluetooth.js
// Simple Bluetooth driver – registers API routes and delegates to network library.

const crypto = require('crypto');
const kernel = require('../../lib/kernel');
const { bluetoothStatus, bluetoothSetEnabled, bluetoothScan } = require('../../lib/network');

async function enqueueNetworkOp(intensity = 2) {
    const commandId = crypto.randomBytes(8).toString('hex');
    const cmd = { commandId, action: 'networkOp', intensity };
    return await kernel.enqueueCpuCommand(cmd);
}

function registerRoutes(app) {
    app.get('/api/bluetooth/status', async (req, res) => {
        try {
            await enqueueNetworkOp(1);
            const status = await bluetoothStatus();
            res.json(status);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/bluetooth/toggle', async (req, res) => {
        const { enabled } = req.body;
        try {
            await enqueueNetworkOp(2);
            await bluetoothSetEnabled(enabled);
            res.json({ success: true, enabled });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/bluetooth/scan', async (req, res) => {
        try {
            await enqueueNetworkOp(3);
            const devices = await bluetoothScan();
            res.json({ devices });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
}

module.exports = { registerRoutes };