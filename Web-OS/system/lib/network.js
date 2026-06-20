// system/lib/network.js
// WebOS Network Library - Windows
// Wi-Fi: با node-wifi (و netsh برای برخی عملیات)
// Bluetooth: ارسال/دریافت فایل با btobex.exe (بدون پنجره)، وضعیت و روشن/خاموش با PowerShell

const wifi = require('node-wifi');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');

// ========== تنظیمات btobex ==========
// مسیر btobex.exe (ابزار خط فرمان بلوتوث) - در صورت نیاز تغییر دهید
// اگر btobex.exe در PATH سیستم است، فقط 'btobex.exe' کافی است
const BTOBEX_PATH = 'btobex.exe';

// ========== وای‌فای (همان کد قبلی شما) ==========
wifi.init({ iface: null });
const wifiScanAsync = util.promisify(wifi.scan);
const wifiConnectAsync = util.promisify(wifi.connect);
const wifiDisconnectAsync = util.promisify(wifi.disconnect);
const wifiGetCurrentConnections = util.promisify(wifi.getCurrentConnections);

let cachedWlanInterface = null;
async function getWlanInterface() {
    if (cachedWlanInterface) return cachedWlanInterface;
    try {
        const { stdout } = await execPromise(`netsh wlan show interfaces`);
        const match = stdout.match(/Name\s+:\s(.+)/);
        if (match) {
            cachedWlanInterface = match[1].trim();
            return cachedWlanInterface;
        }
    } catch (err) {}
    return 'Wi-Fi';
}

async function wifiScan() {
    try {
        const nets = await wifiScanAsync();
        return nets.map(n => ({ ssid: n.ssid, signal: n.signal_level, secured: n.security !== 'open' }));
    } catch (err) { return []; }
}

async function wifiStatus() {
    try {
        const conns = await wifiGetCurrentConnections();
        if (conns && conns.length) {
            return { connected: true, ssid: conns[0].ssid, signal: conns[0].signal_level, enabled: true };
        }
        const iface = await getWlanInterface();
        const { stdout } = await execPromise(`netsh interface show interface "${iface}"`);
        return { connected: false, ssid: '', signal: 0, enabled: stdout.toLowerCase().includes('enabled') };
    } catch (err) {
        return { connected: false, ssid: '', signal: 0, enabled: false };
    }
}

async function wifiSetEnabled(enable) {
    const iface = await getWlanInterface();
    await execPromise(`netsh interface set interface "${iface}" ${enable ? 'enable' : 'disable'}`);
}

async function wifiConnect(ssid, password) {
    await wifiConnectAsync({ ssid, password });
    return { success: true };
}

async function wifiDisconnect() {
    await wifiDisconnectAsync();
}

async function wifiGetSavedNetworks() {
    const { stdout } = await execPromise(`netsh wlan show profiles`);
    const profiles = [];
    for (const line of stdout.split(/\r?\n/)) {
        const match = line.match(/All User Profile\s+:\s(.+)/);
        if (match) profiles.push(match[1].trim());
    }
    return profiles;
}

async function wifiForgetNetwork(ssid) {
    await execPromise(`netsh wlan delete profile name="${ssid}"`);
}

async function wifiGetIPConfig() {
    try {
        const iface = await getWlanInterface();
        const { stdout } = await execPromise(`ipconfig /all`);
        const section = stdout.split(/\r?\n\r?\n/).find(block => block.includes(iface));
        if (!section) return { ip: '', mask: '', gateway: '', dns: [] };
        const ipMatch = section.match(/IPv4 Address[.\s]+:\s([0-9.]+)/);
        const maskMatch = section.match(/Subnet Mask[.\s]+:\s([0-9.]+)/);
        const gatewayMatch = section.match(/Default Gateway[.\s]+:\s([0-9.]+)/);
        const dnsMatches = [...section.matchAll(/DNS Servers[.\s]+:\s([0-9.]+)/g)];
        return {
            ip: ipMatch ? ipMatch[1] : '',
            mask: maskMatch ? maskMatch[1] : '',
            gateway: gatewayMatch ? gatewayMatch[1] : '',
            dns: dnsMatches.map(m => m[1])
        };
    } catch (err) { return { ip: '', mask: '', gateway: '', dns: [] }; }
}

async function wifiSetStaticIP(ip, mask, gateway, dns = '8.8.8.8') {
    const iface = await getWlanInterface();
    await execPromise(`netsh interface ip set address "${iface}" static ${ip} ${mask} ${gateway}`);
    await execPromise(`netsh interface ip set dns "${iface}" static ${dns}`);
}

async function wifiSetDHCP() {
    const iface = await getWlanInterface();
    await execPromise(`netsh interface ip set address "${iface}" dhcp`);
    await execPromise(`netsh interface ip set dns "${iface}" dhcp`);
}

// ========== بلوتوث (فقط با btobex + PowerShell برای وضعیت و روشن/خاموش) ==========
async function bluetoothStatus() {
    try {
        const { stdout } = await execPromise(`powershell -Command "Get-PnpDevice -Class Bluetooth | Where-Object {$_.FriendlyName -like '*Radio*'} | Select-Object -ExpandProperty Status"`);
        return { enabled: stdout.trim() === 'OK' };
    } catch { return { enabled: false }; }
}

async function bluetoothSetEnabled(enable) {
    const action = enable ? 'Enable' : 'Disable';
    await execPromise(`powershell -Command "Get-PnpDevice -Class Bluetooth | Where-Object {$_.FriendlyName -like '*Radio*'} | ${action}-PnpDevice -Confirm:$false"`);
}

/**
 * ارسال فایل از طریق بلوتوث با btobex.exe (بدون پنجره)
 * @param {string} deviceNameOrAddress - نام دستگاه یا آدرس MAC (مثلاً "My Phone" یا "AA:BB:CC:DD:EE:FF")
 * @param {string} filePath - مسیر کامل فایل
 */
async function bluetoothSendFile(deviceNameOrAddress, filePath) {
    const fileAbsPath = path.resolve(filePath);
    // اگر شامل : باشد، آدرس MAC در نظر گرفته می‌شود
    const option = deviceNameOrAddress.includes(':') ? '-a' : '-n';
    const command = `"${BTOBEX_PATH}" ${option}"${deviceNameOrAddress}" "${fileAbsPath}"`;
    try {
        const { stdout, stderr } = await execPromise(command);
        return { success: true, output: stdout || stderr };
    } catch (err) {
        throw new Error(`Bluetooth send failed: ${err.message}`);
    }
}

/**
 * دریافت فایل از طریق بلوتوث با btobex.exe (بدون پنجره)
 * @param {string} saveFolderPath - پوشه ذخیره فایل دریافتی
 */
async function bluetoothReceiveFile(saveFolderPath) {
    const folder = path.resolve(saveFolderPath);
    const command = `"${BTOBEX_PATH}" -receive "${folder}"`;
    try {
        const { stdout, stderr } = await execPromise(command);
        return { success: true, output: stdout || stderr };
    } catch (err) {
        throw new Error(`Bluetooth receive failed: ${err.message}`);
    }
}

async function bluetoothScan() {
    try {
        const { stdout } = await execPromise(
            `powershell -Command "Get-PnpDevice -Class Bluetooth | Select-Object FriendlyName, Status | ConvertTo-Json"`
        );
        const devices = JSON.parse(stdout);
        const list = Array.isArray(devices) ? devices : [devices];
        return list.map(d => ({
            name: d.FriendlyName || 'Unknown',
            available: d.Status === 'OK'
        }));
    } catch {
        return [];
    }
}

module.exports = {
    // Wi-Fi
    wifiScan,
    wifiStatus,
    wifiSetEnabled,
    wifiConnect,
    wifiDisconnect,
    wifiGetSavedNetworks,
    wifiForgetNetwork,
    wifiGetIPConfig,
    wifiSetStaticIP,
    wifiSetDHCP,
    // Bluetooth
    bluetoothStatus,
    bluetoothSetEnabled,
    bluetoothSendFile,
    bluetoothReceiveFile,
    bluetoothScan
};