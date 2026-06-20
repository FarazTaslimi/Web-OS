// system/lib/client.js
// Client-side library for WebOS – calls server APIs via fetch.
// Exposes a global object `WebOSLib`.

(function(global) {
    const API_BASE = ''; // same origin

    /**
     * Generic request function
     * @param {string} endpoint - API endpoint (e.g., '/api/system/cpu')
     * @param {string} method - HTTP method (GET, POST, ...)
     * @param {object|null} body - request body for POST/PUT
     * @returns {Promise<object>}
     */
    async function request(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API call failed: ${endpoint} - ${errorText}`);
        }
        return response.json();
    }

    const WebOSLib = {
        // ---------- CPU ----------
        /**
         * Get current CPU information (usage, cores, speed)
         * @returns {Promise<object>}
         */
        getCpuInfo: () => request('/api/system/cpu'),

        /**
         * Execute a compute task (simulates CPU load)
         * @param {number} intensity - 1..10 (default 1)
         * @param {string} type - 'compute', 'io', 'memory' (default 'compute')
         * @param {number} priority - 1 (high), 2 (normal), 3 (low) (default 2)
         * @returns {Promise<object>}
         */
        compute: (intensity = 1, type = 'compute', priority = 2) =>
            request('/api/system/cpu/compute', 'POST', { intensity, type, priority }),

        // ---------- RAM ----------
        /**
         * Get current RAM statistics (total, used, free, percent)
         * @returns {Promise<object>}
         */
        getRamInfo: () => request('/api/system/ram'),

        /**
         * Allocate simulated memory
         * @param {number} sizeMB - size in megabytes
         * @returns {Promise<object>} - contains allocationId
         */
        allocateMemory: (sizeMB) => request('/api/system/ram/allocate', 'POST', { sizeMB }),

        /**
         * Free previously allocated memory
         * @param {string} allocationId - id returned by allocateMemory
         * @returns {Promise<object>}
         */
        freeMemory: (allocationId) => request('/api/system/ram/free', 'POST', { allocationId }),

        // ---------- File operations (real disk, but go through CPU command queue) ----------
        /**
         * Read a file (text or image) from the server's file system
         * @param {string} path - relative path from project root
         * @param {string} encoding - 'utf8' or 'base64'
         * @returns {Promise<string|object>} - for images returns { data, mime, type }
         */
        readFile: (path, encoding = 'utf8') =>
            request(`/api/disk/read?path=${encodeURIComponent(path)}&encoding=${encoding}`),

        /**
         * Write content to a file
         * @param {string} path - relative path
         * @param {string|Buffer} content - file content
         * @param {string} encoding - 'utf8' or 'base64'
         * @returns {Promise<boolean>}
         */
        writeFile: (path, content, encoding = 'utf8') =>
            request('/api/disk/write', 'POST', { path, content, encoding })
                .then(() => true),

        /**
         * Delete a file
         * @param {string} path - relative path
         * @returns {Promise<boolean>}
         */
        deleteFile: (path) =>
            request('/api/disk/delete', 'POST', { path })
                .then(() => true),

        /**
         * List directory contents
         * @param {string} path - directory path (relative, default '')
         * @returns {Promise<Array>} - array of { name, isDirectory, size }
         */
        listDirectory: (path = '') =>
            request(`/api/disk/list?path=${encodeURIComponent(path)}`),

        // ---------- JSON helpers ----------
        /**
         * Read and parse a JSON file
         * @param {string} path - relative path
         * @returns {Promise<object>}
         */
        readJSON: async (path) => {
            const content = await WebOSLib.readFile(path, 'utf8');
            return JSON.parse(content);
        },

        /**
         * Write an object as JSON to a file
         * @param {string} path - relative path
         * @param {object} data - data to write
         * @returns {Promise<boolean>}
         */
        writeJSON: async (path, data) => {
            await WebOSLib.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
            return true;
        },

        // ---------- Service registration (automatically allocates RAM based on file sizes) ----------
        /**
         * Register a service with the kernel to allocate simulated RAM
         * @param {string} name - service name (e.g., 'shell', 'window')
         * @param {Array<string>} files - list of file paths belonging to the service
         * @returns {Promise<object>} - contains ramMB and allocationId
         */
        registerService: (name, files) =>
            request('/api/system/cpu/register', 'POST', { name, files })
    };

    global.WebOSLib = WebOSLib;
})(window);