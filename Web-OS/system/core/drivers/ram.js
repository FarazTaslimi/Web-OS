// system/core/drivers/ram.js
const crypto = require('crypto');
const kernel = require('../../lib/kernel');

module.exports = {
    registerRoutes: (app) => {
        app.get('/api/system/ram', async (req, res) => {
            const commandId = crypto.randomBytes(8).toString('hex');
            const cmd = { commandId, action: 'getInfo' };
            try {
                const result = await kernel.enqueueRamCommand(cmd);
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/api/system/ram/allocate', async (req, res) => {
            const { sizeMB = 10 } = req.body;
            const commandId = crypto.randomBytes(8).toString('hex');
            const cmd = { commandId, action: 'allocate', sizeMB };
            try {
                const result = await kernel.enqueueRamCommand(cmd);
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/api/system/ram/free', async (req, res) => {
            const { allocationId } = req.body;
            if (!allocationId) return res.status(400).json({ error: 'Missing allocationId' });
            const commandId = crypto.randomBytes(8).toString('hex');
            const cmd = { commandId, action: 'free', allocationId };
            try {
                const result = await kernel.enqueueRamCommand(cmd);
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
    }
};