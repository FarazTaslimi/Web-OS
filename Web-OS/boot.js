// boot.js - WebOS Server (only server services)
const express = require('express');
const http = require('http');
const { statfs } = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const kernel = require('./system/lib/kernel');

const app = express();
const server = http.createServer(app);
const PORT = 8080;

app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname));

let servicesReady = false;
let serverServiceManager = null;

async function executeCpuCommand(action, params = {}) {
    const commandId = crypto.randomBytes(8).toString('hex');
    const cmd = { commandId, action, ...params };
    const result = await kernel.enqueueCpuCommand(cmd);
    if (!result.success) throw new Error(result.error);
    return result;
}

// ---------- API endpoints ----------
app.get('/api/status', async (req, res) => {
    try {
        const result = await executeCpuCommand('readJSON', { path: 'system/data/status.json' });
        res.json(result.data || { power: 'off' });
    } catch { res.json({ power: 'off' }); }
});

app.post('/api/status', async (req, res) => {
    const { power } = req.body;
    if (power === 'on') {
        await executeCpuCommand('writeJSON', { path: 'system/data/status.json', data: { power: 'on' } });
        res.json({ success: true });
    } else {
        await executeCpuCommand('writeJSON', { path: 'system/data/status.json', data: { power } });
        res.json({ success: true });
    }
});

// Boot endpoint – loads only SystemService
app.post('/api/boot', async (req, res) => {
    if (servicesReady) return res.json({ ready: true });
    try {
        const ServiceManager = require('./system/core/service-manager');
        serverServiceManager = ServiceManager;
        await serverServiceManager.startAll(); // starts SystemService
        const systemService = serverServiceManager.getService('system');
        if (systemService && typeof systemService.registerRoutes === 'function') {
            systemService.registerRoutes(app);
        }
        servicesReady = true;
        console.log('[Boot] Server services loaded.');
        res.json({ ready: true });
    } catch (err) {
        console.error('[Boot] Failed:', err);
        res.status(500).json({ error: 'Boot failed' });
    }
});

// Middleware for service-dependent APIs
const requireServices = (req, res, next) => {
    if (!servicesReady) return res.status(503).json({ error: 'Services not ready' });
    next();
};

// ---------- APIs that need services (using CPU commands) ----------
app.get('/api/user', requireServices, async (req, res) => {
    try {
        const result = await executeCpuCommand('readJSON', { path: 'system/data/user.json' });
        res.json(result.data || { username: 'User', avatar: '' });
    } catch { res.json({ username: 'User', avatar: '' }); }
});

app.post('/api/login', requireServices, async (req, res) => {
    const { password } = req.body;
    try {
        const result = await executeCpuCommand('readJSON', { path: 'system/data/user.json' });
        const user = result.data;
        if (user && user.password === password) {
            res.json({ success: true, user: { username: user.username, avatar: user.avatar } });
        } else {
            res.status(401).json({ error: 'Incorrect password' });
        }
    } catch { res.status(500).json({ error: 'Login failed' }); }
});

app.post('/api/user/avatar', requireServices, async (req, res) => {
    const { avatar } = req.body;
    if (!avatar || !avatar.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid avatar' });
    }
    try {
        const result = await executeCpuCommand('readJSON', { path: 'system/data/user.json' });
        const user = result.data;
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.avatar = avatar;
        await executeCpuCommand('writeJSON', { path: 'system/data/user.json', data: user });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/settings', requireServices, async (req, res) => {
    try {
        const result = await executeCpuCommand('readJSON', { path: 'system/apps/settings/settings.json' });
        res.json(result.data || {});
    } catch { res.json({}); }
});
app.post('/api/settings', requireServices, async (req, res) => {
    try {
        await executeCpuCommand('writeJSON', { path: 'system/apps/settings/settings.json', data: req.body });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/verify-token', requireServices, (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const [timestamp] = decoded.split(':');
        if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
            return res.status(401).json({ error: 'Token expired' });
        }
        res.json({ valid: true });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

app.get('/api/system/disk', async (req, res) => {
    try {
        const drive = path.parse(process.cwd()).root; // e.g., "C:\"
        const stats = await statfs(drive);
        const totalBytes = stats.bsize * stats.blocks;
        const freeBytes = stats.bsize * stats.bfree;
        const usedBytes = totalBytes - freeBytes;
        const percent = (usedBytes / totalBytes) * 100;
        res.json({
            total: Math.round(totalBytes / (1024 ** 3)),
            used: Math.round(usedBytes / (1024 ** 3)),
            free: Math.round(freeBytes / (1024 ** 3)),
            percent: Math.round(percent)
        });
    } catch (err) {
        console.error('Disk stats error:', err.message);
        // Fallback data
        res.json({ total: 512, used: 128, free: 384, percent: 25 });
    }
});

// Driver routes are registered by SystemService
server.listen(PORT, () => {
    console.log(`WebOS Server running at http://localhost:${PORT}`);
});