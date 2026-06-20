// system/core/drivers/disk.js
// Disk driver – all file operations go through the CPU command queue.

const crypto = require('crypto');
const kernel = require('../../lib/kernel');

async function executeCpuCommand(action, params = {}) {
    const commandId = crypto.randomBytes(8).toString('hex');
    const cmd = { commandId, action, ...params };
    const result = await kernel.enqueueCpuCommand(cmd);
    if (!result.success) throw new Error(result.error);
    return result;
}

module.exports = {
    registerRoutes: (app) => {
        app.get('/api/disk/read', async (req, res) => {
            const { path, encoding = 'utf8' } = req.query;
            if (!path) return res.status(400).json({ error: 'Missing path' });
            try {
                const result = await executeCpuCommand('readFile', { path, encoding });
                res.json(result.data);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/api/disk/write', async (req, res) => {
            const { path, content, encoding = 'utf8' } = req.body;
            if (!path) return res.status(400).json({ error: 'Missing path' });
            try {
                await executeCpuCommand('writeFile', { path, content, encoding });
                res.json({ success: true });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.post('/api/disk/delete', async (req, res) => {
            const { path } = req.body;
            if (!path) return res.status(400).json({ error: 'Missing path' });
            try {
                await executeCpuCommand('deleteFile', { path });
                res.json({ success: true });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/api/disk/list', async (req, res) => {
            const { path = '' } = req.query;
            try {
                const result = await executeCpuCommand('listDirectory', { path });
                res.json(result.files);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
    }
};