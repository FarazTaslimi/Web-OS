// modules/api.js
let appData = null;

export async function loadData() {
    try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        appData = await response.json();
    } catch (err) {
        console.error('Error loading settings:', err);
        appData = {
            pinnedItems: ['display', 'sound', 'network', 'power', 'security', 'updates'],
            recentActivities: []
        };
    }
    return appData;
}

export async function saveData() {
    try {
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appData)
        });
    } catch (err) {
        console.error('Error saving settings:', err);
    }
}

export function getAppData() {
    return appData;
}