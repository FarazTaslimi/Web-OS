// system/lib/kernel.js
// Core simulation kernel – CPU and RAM command queues, file I/O, service registration, and network operations.
// All system commands go through the CPU command queue.
// CPU usage now has a base idle load (5%) and decays gradually; every command adds a small boost.

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.resolve(process.cwd(), 'system/data');
const CPU_CMD_FILE = path.join(DATA_DIR, 'cpu_commands.json');
const CPU_RES_FILE = path.join(DATA_DIR, 'cpu_results.json');
const RAM_CMD_FILE = path.join(DATA_DIR, 'ram_commands.json');
const RAM_RES_FILE = path.join(DATA_DIR, 'ram_results.json');

// ---------- Helper functions for JSON command files ----------
async function ensureFile(file) {
    try { await fs.access(file); } catch { await fs.writeFile(file, '[]', 'utf8'); }
}
async function readCommands(file) {
    await ensureFile(file);
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
}
async function writeCommands(file, cmds) {
    await fs.writeFile(file, JSON.stringify(cmds, null, 2), 'utf8');
}
async function appendResult(file, result) {
    await ensureFile(file);
    let results = JSON.parse(await fs.readFile(file, 'utf8'));
    results.push(result);
    if (results.length > 100) results.shift();
    await fs.writeFile(file, JSON.stringify(results, null, 2));
}

// ---------- CPU simulation with realistic idle & decay ----------
const CPU_CORES = 8;
const BASE_CPU_LOAD = 5;          // idle baseline (percent)
let cpuUsage = BASE_CPU_LOAD;
let idleInterval = null;
let cpuProcessing = false;

// Dynamic frequency (optional)
let currentFrequency = 5.0;
const cpuCache = new Map();
const CACHE_TTL = 5000;

// Execution factors for different instruction types
const executionFactors = {
    compute: 1.0,
    io: 0.5,
    memory: 0.8,
    default: 1.0
};

function getExecutionTime(intensity, type, frequency) {
    const baseMs = 100;
    const typeFactor = executionFactors[type] || executionFactors.default;
    const freqFactor = 5.0 / frequency;
    return baseMs * intensity * typeFactor * freqFactor;
}

// ---------- Real file operations (used by commands) ----------
async function realReadFile(filePath, encoding = 'utf8') {
    const absolute = path.resolve(process.cwd(), filePath);
    const data = await fs.readFile(absolute);
    const ext = path.extname(absolute).toLowerCase();
    const isImage = ['.jpg','.jpeg','.png','.gif','.bmp','.webp'].includes(ext);
    if (isImage) return { data: data.toString('base64'), mime: `image/${ext.slice(1)}`, type: 'image' };
    return data.toString(encoding);
}
async function realWriteFile(filePath, content, encoding = 'utf8') {
    const absolute = path.resolve(process.cwd(), filePath);
    await fs.writeFile(absolute, content, encoding);
    return true;
}
async function realDeleteFile(filePath) {
    const absolute = path.resolve(process.cwd(), filePath);
    await fs.unlink(absolute);
    return true;
}
async function realListDirectory(dirPath = '') {
    const absolute = path.resolve(process.cwd(), dirPath);
    const items = await fs.readdir(absolute, { withFileTypes: true });
    return Promise.all(items.map(async item => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        size: item.isFile() ? (await fs.stat(path.join(absolute, item.name))).size : null
    })));
}

// ---------- RAM simulation functions (used inside CPU commands and separate watcher) ----------
const TOTAL_RAM_MB = 16 * 1024;
let allocatedRAM = 0;
let allocations = new Map();

function allocateMemory(sizeMB, cmdId = null) {
    if (allocatedRAM + sizeMB > TOTAL_RAM_MB) throw new Error('Out of memory');
    const id = cmdId || `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    allocations.set(id, { sizeMB, timestamp: Date.now() });
    allocatedRAM += sizeMB;
    return id;
}
function freeMemory(id) {
    const alloc = allocations.get(id);
    if (!alloc) return false;
    allocatedRAM -= alloc.sizeMB;
    allocations.delete(id);
    return true;
}

// ---------- CPU usage helpers (idle decay + activity boost) ----------
function startIdleDecay() {
    if (idleInterval) clearInterval(idleInterval);
    idleInterval = setInterval(() => {
        if (cpuUsage > BASE_CPU_LOAD) {
            cpuUsage = Math.max(BASE_CPU_LOAD, cpuUsage - 0.8);
        } else if (cpuUsage < BASE_CPU_LOAD) {
            cpuUsage = Math.min(BASE_CPU_LOAD, cpuUsage + 0.3);
        }
        // Add natural random noise (±1%)
        let noise = (Math.random() * 2) - 1;
        cpuUsage = Math.min(100, Math.max(0, cpuUsage + noise));
        // Update dynamic frequency based on current usage
        currentFrequency = 2.0 + (cpuUsage / 100) * 3.0;
    }, 1000);
}
startIdleDecay();

function recordActivity(weight = 1) {
    const boost = Math.min(8, weight * 2);
    cpuUsage = Math.min(100, cpuUsage + boost);
    // Reset decay timer after activity
    if (idleInterval) {
        clearInterval(idleInterval);
        startIdleDecay();
    }
}

// ---------- Process a single CPU command ----------
async function processCpuCommand(cmd) {
    const startTime = Date.now();
    let result = {
        commandId: cmd.commandId,
        action: cmd.action,
        timestamp: startTime,
        success: true
    };
    try {
        // Every command boosts CPU usage (weight defaults to 1)
        recordActivity(cmd.intensity || 1);

        switch (cmd.action) {
            case 'getInfo':
                result.usagePercent = Math.round(cpuUsage);
                result.cores = CPU_CORES;
                result.speed = currentFrequency.toFixed(1) + ' GHz';
                break;

            case 'compute':
                const intensity = cmd.intensity || 1;
                const type = cmd.type || 'compute';
                const execTime = getExecutionTime(intensity, type, currentFrequency);
                await new Promise(r => setTimeout(r, execTime));
                // Extra delta for heavy compute
                const delta = intensity * (type === 'compute' ? 5 : (type === 'io' ? 2 : 3));
                cpuUsage = Math.min(100, cpuUsage + delta);
                setTimeout(() => { cpuUsage = Math.max(BASE_CPU_LOAD, cpuUsage - delta * 0.8); }, execTime * 2);
                result.message = `Compute done (intensity ${intensity}, type ${type})`;
                result.executionTimeMs = execTime;
                break;

            case 'readFile':
                const fileData = await realReadFile(cmd.path, cmd.encoding || 'utf8');
                result.data = fileData;
                let size = (typeof fileData === 'string') ? fileData.length : (fileData.data?.length || 0);
                const ioIntensity = Math.min(10, Math.ceil(size / 1024)) + 1;
                cpuUsage = Math.min(100, cpuUsage + ioIntensity);
                setTimeout(() => { cpuUsage = Math.max(BASE_CPU_LOAD, cpuUsage - ioIntensity); }, 300);
                break;

            case 'writeFile':
                await realWriteFile(cmd.path, cmd.content, cmd.encoding || 'utf8');
                result.success = true;
                const writeSize = (cmd.content?.length || 0);
                const wIntensity = Math.min(10, Math.ceil(writeSize / 1024)) + 1;
                cpuUsage = Math.min(100, cpuUsage + wIntensity);
                setTimeout(() => { cpuUsage = Math.max(BASE_CPU_LOAD, cpuUsage - wIntensity); }, 300);
                break;

            case 'deleteFile':
                await realDeleteFile(cmd.path);
                result.success = true;
                cpuUsage = Math.min(100, cpuUsage + 2);
                setTimeout(() => { cpuUsage = Math.max(BASE_CPU_LOAD, cpuUsage - 2); }, 200);
                break;

            case 'listDirectory':
                const list = await realListDirectory(cmd.path || '');
                result.files = list;
                result.success = true;
                cpuUsage = Math.min(100, cpuUsage + 3);
                setTimeout(() => { cpuUsage = Math.max(BASE_CPU_LOAD, cpuUsage - 3); }, 200);
                break;

            case 'readJSON':
                const jsonContent = await realReadFile(cmd.path, 'utf8');
                result.data = JSON.parse(jsonContent);
                result.success = true;
                break;

            case 'writeJSON':
                await realWriteFile(cmd.path, JSON.stringify(cmd.data, null, 2), 'utf8');
                result.success = true;
                break;

            case 'registerService':
                const serviceName = cmd.name;
                const files = cmd.files || [];
                let totalBytes = 0;
                for (const file of files) {
                    try {
                        const absolute = path.resolve(process.cwd(), file);
                        const stats = await fs.stat(absolute);
                        totalBytes += stats.size;
                    } catch (err) {
                        console.warn(`[Kernel] Cannot stat ${file}: ${err.message}`);
                    }
                }
                const ramMB = Math.max(1, Math.ceil(totalBytes / 1024)); // 1 KB file -> 1 MB RAM
                const allocId = allocateMemory(ramMB, cmd.commandId);
                result.allocationId = allocId;
                result.ramMB = ramMB;
                result.totalBytes = totalBytes;
                result.serviceName = serviceName;
                break;

            case 'networkOp':
                const netIntensity = cmd.intensity || 2;
                const netExecTime = Math.min(500, netIntensity * 50);
                await new Promise(r => setTimeout(r, netExecTime));
                cpuUsage = Math.min(100, cpuUsage + netIntensity);
                setTimeout(() => { cpuUsage = Math.max(BASE_CPU_LOAD, cpuUsage - netIntensity); }, netExecTime * 2);
                result.message = `Network operation (intensity ${netIntensity})`;
                result.executionTimeMs = netExecTime;
                break;

            default:
                throw new Error(`Unknown CPU action: ${cmd.action}`);
        }
    } catch (err) {
        result.success = false;
        result.error = err.message;
    }
    result.durationMs = Date.now() - startTime;
    return result;
}

// ---------- CPU command watcher (priority‑based) ----------
async function cpuWatcher() {
    while (true) {
        try {
            if (!cpuProcessing) {
                let commands = await readCommands(CPU_CMD_FILE);
                if (commands.length > 0) {
                    commands.sort((a, b) => ((a.priority || 2) - (b.priority || 2)) || (a.timestamp - b.timestamp));
                    cpuProcessing = true;
                    const cmd = commands.shift();
                    let output = null;
                    // Cache for getInfo (TTL)
                    if (cmd.action === 'getInfo' && cpuCache.has('getInfo') && Date.now() - cpuCache.get('getInfo').timestamp < CACHE_TTL) {
                        output = cpuCache.get('getInfo').result;
                    }
                    if (!output) {
                        output = await processCpuCommand(cmd);
                        if (cmd.action === 'getInfo') {
                            cpuCache.set('getInfo', { result: output, timestamp: Date.now() });
                        }
                    }
                    await appendResult(CPU_RES_FILE, output);
                    await writeCommands(CPU_CMD_FILE, commands);
                    cpuProcessing = false;
                }
            }
        } catch (err) { console.error('[Kernel CPU]', err); }
        await new Promise(r => setTimeout(r, 200));
    }
}
cpuWatcher().catch(console.error);

// ---------- RAM command watcher (separate queue) ----------
let ramProcessing = false;
async function processRamCommand(cmd) {
    let result = { commandId: cmd.commandId, action: cmd.action, timestamp: Date.now(), success: true };
    try {
        switch (cmd.action) {
            case 'getInfo':
                result.total = Math.round(TOTAL_RAM_MB / 1024);
                result.used = Math.round(allocatedRAM / 1024 * 10) / 10;
                result.free = Math.round((TOTAL_RAM_MB - allocatedRAM) / 1024 * 10) / 10;
                result.percent = Math.round((allocatedRAM / TOTAL_RAM_MB) * 100);
                break;
            case 'allocate':
                const id = allocateMemory(cmd.sizeMB || 10, cmd.commandId);
                result.allocationId = id;
                result.sizeMB = cmd.sizeMB || 10;
                break;
            case 'free':
                const ok = freeMemory(cmd.allocationId);
                if (!ok) throw new Error('Allocation not found');
                result.freed = true;
                break;
            default:
                throw new Error(`Unknown RAM action: ${cmd.action}`);
        }
    } catch (err) {
        result.success = false;
        result.error = err.message;
    }
    return result;
}

async function ramWatcher() {
    while (true) {
        try {
            if (!ramProcessing) {
                let commands = await readCommands(RAM_CMD_FILE);
                if (commands.length > 0) {
                    ramProcessing = true;
                    const cmd = commands.shift();
                    const output = await processRamCommand(cmd);
                    await appendResult(RAM_RES_FILE, output);
                    await writeCommands(RAM_CMD_FILE, commands);
                    ramProcessing = false;
                }
            }
        } catch (err) { console.error('[Kernel RAM]', err); }
        await new Promise(r => setTimeout(r, 200));
    }
}
ramWatcher().catch(console.error);

// ---------- Public API for enqueuing commands ----------
async function enqueueCpuCommand(cmd) {
    const commands = await readCommands(CPU_CMD_FILE);
    commands.push(cmd);
    await writeCommands(CPU_CMD_FILE, commands);
    const start = Date.now();
    while (Date.now() - start < 30000) {
        const results = await readCommands(CPU_RES_FILE);
        const found = results.find(r => r.commandId === cmd.commandId);
        if (found) {
            const remaining = results.filter(r => r.commandId !== cmd.commandId);
            await writeCommands(CPU_RES_FILE, remaining);
            return found;
        }
        await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('CPU command timeout');
}

async function enqueueRamCommand(cmd) {
    const commands = await readCommands(RAM_CMD_FILE);
    commands.push(cmd);
    await writeCommands(RAM_CMD_FILE, commands);
    const start = Date.now();
    while (Date.now() - start < 30000) {
        const results = await readCommands(RAM_RES_FILE);
        const found = results.find(r => r.commandId === cmd.commandId);
        if (found) {
            const remaining = results.filter(r => r.commandId !== cmd.commandId);
            await writeCommands(RAM_RES_FILE, remaining);
            return found;
        }
        await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('RAM command timeout');
}

module.exports = {
    enqueueCpuCommand,
    enqueueRamCommand
};