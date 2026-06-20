// system/lib/network-client.js
// Extends WebOSLib with complete network (Wi‑Fi & Bluetooth) methods.
// This client matches the server endpoints defined in boot.js + network.js

(function() {
    if (typeof WebOSLib === 'undefined') {
        console.error('[NetworkClient] WebOSLib not found – network methods not attached.');
        return;
    }

    // Helper for API calls
    const request = (endpoint, method = 'GET', body = null) => {
        const options = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) options.body = JSON.stringify(body);
        return fetch(endpoint, options).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        });
    };

    WebOSLib.network = {
        // ---------- Wi‑Fi ----------
        scanWifi: () => request('/api/wifi/scan'),
        getWifiStatus: () => request('/api/wifi/status'),
        setWifiEnabled: (enabled) => request('/api/wifi/set-enabled', 'POST', { enabled }),
        connectWifi: (ssid, password) => request('/api/wifi/connect', 'POST', { ssid, password }),
        disconnectWifi: () => request('/api/wifi/disconnect', 'POST'),
        getSavedNetworks: () => request('/api/wifi/saved-networks'),
        forgetNetwork: (ssid) => request('/api/wifi/forget', 'POST', { ssid }),
        getIpConfig: () => request('/api/wifi/ipconfig'),
        setStaticIp: (ip, mask, gateway, dns) => request('/api/wifi/set-static', 'POST', { ip, mask, gateway, dns }),
        setDhcp: () => request('/api/wifi/set-dhcp', 'POST'),

        // ---------- Bluetooth (using btobex, no extra libs) ----------
        getBluetoothStatus: () => request('/api/bluetooth/status'),
        setBluetoothEnabled: (enabled) => request('/api/bluetooth/set-enabled', 'POST', { enabled }),
        // ارسال فایل: deviceNameOrAddress می‌تواند نام دستگاه یا آدرس MAC باشد
        sendFile: (deviceNameOrAddress, filePath) => request('/api/bluetooth/send-file', 'POST', { deviceNameOrAddress, filePath }),
        // دریافت فایل: saveFolderPath مسیر پوشه مقصد
        receiveFile: (saveFolderPath) => request('/api/bluetooth/receive-file', 'POST', { saveFolderPath }),
        // اسکن دستگاه‌های بلوتوث (با btobex -scan)
        scanBluetooth: () => request('/api/bluetooth/scan')
    };

    console.log('[NetworkClient] Complete network methods attached to WebOSLib.network');
})();