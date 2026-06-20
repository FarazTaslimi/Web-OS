// system/core/drivers/cpu.js
// CPU driver – registers endpoints for CPU info, compute tasks, and service registration (RAM allocation).

const crypto = require('crypto');
const kernel = require('../../lib/kernel');

module.exports = {
    registerRoutes: (app) => {
        // Get current CPU information (usage, cores, speed)
        app.get('/api/system/cpu', async (req, res) => {
            const commandId = crypto.randomBytes(8).toString('hex');
            const cmd = { commandId, action: 'getInfo' };
            try {
                const result = await kernel.enqueueCpuCommand(cmd);
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        // Execute a compute task (simulates CPU load)
        app.post('/api/system/cpu/compute', async (req, res) => {
            const { intensity = 1, type = 'compute', priority = 2 } = req.body;
            const commandId = crypto.randomBytes(8).toString('hex');
            const cmd = {
                commandId,
                action: 'compute',
                intensity,
                type,      // 'compute', 'io', 'memory'
                priority   // 1 (high), 2 (normal), 3 (low)
            };
            try {
                const result = await kernel.enqueueCpuCommand(cmd);
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        // Register a service – automatically allocates RAM based on total size of its files
        app.post('/api/system/cpu/register', async (req, res) => {
            const { name, files } = req.body;
            if (!name || !Array.isArray(files)) {
                return res.status(400).json({ error: 'Invalid service registration data' });
            }
            const commandId = crypto.randomBytes(8).toString('hex');
            const cmd = {
                commandId,
                action: 'registerService',
                name,
                files
            };
            try {
                const result = await kernel.enqueueCpuCommand(cmd);
                res.json(result);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
    }
};