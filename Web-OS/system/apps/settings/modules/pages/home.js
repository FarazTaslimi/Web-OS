// modules/pages/home.js
import { getAppData, saveData } from '../api.js';
import { pageNames, getCardColor, getCardValue, pageIcons } from '../constants.js';
import { navigate } from '../navigation.js';
import { injectPinButtonStyle } from '../inject-styles.js';

// ==================== توابع کمکی داخلی ====================
function getPinnedItems() {
    return getAppData().pinnedItems;
}

function isPinned(pageId) {
    return getPinnedItems().includes(pageId);
}

async function pinItem(pageId) {
    const appData = getAppData();
    if (!appData.pinnedItems.includes(pageId)) {
        appData.pinnedItems.push(pageId);
        await saveData();
        renderQuickCards();
        await addRecentActivity(`Pinned "${pageNames[pageId] || pageId}" to Home`, 'info');
    }
}

async function unpinItem(pageId) {
    const appData = getAppData();
    const index = appData.pinnedItems.indexOf(pageId);
    if (index !== -1) {
        appData.pinnedItems.splice(index, 1);
        await saveData();
        renderQuickCards();
        await addRecentActivity(`Unpinned "${pageNames[pageId] || pageId}" from Home`, 'info');
    }
}

async function addRecentActivity(text, type = 'info') {
    const appData = getAppData();
    const newActivity = {
        id: Date.now(),
        text: text,
        time: new Date().toLocaleString(),
        type: type
    };
    appData.recentActivities.unshift(newActivity);
    if (appData.recentActivities.length > 10) appData.recentActivities.pop();
    await saveData();
    renderRecentActivities();
}

async function clearRecentActivities() {
    const appData = getAppData();
    appData.recentActivities = [];
    await saveData();
    renderRecentActivities();
}

// ==================== رندر کارت‌های سریع ====================
function renderQuickCards() {
    const grid = document.getElementById('home-quick-grid');
    if (!grid) return;
    const pinned = getPinnedItems();
    if (pinned.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text3); padding:20px;">No pinned items. Right-click on any menu item to pin.</div>';
        return;
    }
    grid.innerHTML = pinned.map(pageId => {
        const color = getCardColor(pageId);
        const iconSvg = pageIcons[pageId] || pageIcons.display;
        const match = iconSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
        const inner = match ? match[1] : '';
        return `
            <div class="home-quick-card" data-page="${pageId}">
                <div class="home-quick-pin" data-page="${pageId}" title="Unpin from Home">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 2l5 5-2 1-5-5 2-1zM7 8L3 14M6 7l-3 3"/>
                        <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" stroke-width="1.2"/>
                    </svg>
                </div>
                <div class="home-quick-icon" style="background:${color.bg}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="${color.stroke}" stroke-width="1.7">${inner}</svg>
                </div>
                <div class="home-quick-label">${pageNames[pageId] || pageId}</div>
                <div class="home-quick-val">${getCardValue(pageId)}</div>
            </div>
        `;
    }).join('');
    
    grid.querySelectorAll('.home-quick-card').forEach(card => {
        const pageId = card.dataset.page;
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.home-quick-pin')) navigate(pageId);
        });
    });
    grid.querySelectorAll('.home-quick-pin').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const pageId = btn.dataset.page;
            if (pageId) await unpinItem(pageId);
        });
    });
}

// ==================== رندر Recent Activity ====================
function renderRecentActivities() {
    const container = document.getElementById('recent-activity-list');
    if (!container) return;
    const appData = getAppData();
    const activities = appData.recentActivities || [];
    if (activities.length === 0) {
        container.innerHTML = '<div class="setting-row" style="justify-content:center; color:var(--text3);">No recent activity</div>';
        return;
    }
    container.innerHTML = activities.map(act => `
        <div class="setting-row">
            <div class="setting-icon" style="background:${act.type === 'success' ? 'rgba(50,220,100,.1)' : 'rgba(96,205,255,.1)'}">
                <svg viewBox="0 0 24 24" fill="none" stroke="${act.type === 'success' ? '#32dc64' : '#60cdff'}" stroke-width="1.7">
                    ${act.type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
                </svg>
            </div>
            <div class="setting-info">
                <div class="setting-name">${act.text}</div>
                <div class="setting-desc">${act.time}</div>
            </div>
            <span class="badge ${act.type === 'success' ? 'green' : ''}">${act.type === 'success' ? 'Done' : 'Info'}</span>
        </div>
    `).join('');
}

// ==================== بنر وضعیت ====================
function updateStatusBanner() {
    const cpuPercent = parseInt(document.querySelector('#page-system .stat-card:first-child .stat-value')?.innerText || '12');
    const ramPercentMatch = document.querySelector('#page-system .stat-card:nth-child(2) .progress-fill')?.style.width;
    const ramPercent = ramPercentMatch ? parseInt(ramPercentMatch) : 26;
    const diskPercentMatch = document.querySelector('#page-system .stat-card:nth-child(3) .progress-fill')?.style.width;
    const diskPercent = diskPercentMatch ? parseInt(diskPercentMatch) : 25;
    const batteryPercent = parseInt(document.querySelector('#page-home .stat-card:last-child .stat-value')?.innerText || '85');
    
    let message = 'Your system is running smoothly';
    let bannerClass = '';
    if (cpuPercent > 80) { message = 'High CPU usage'; bannerClass = 'warning'; }
    else if (ramPercent > 80) { message = 'High memory usage'; bannerClass = 'warning'; }
    else if (diskPercent > 90) { message = 'Low disk space'; bannerClass = 'warning'; }
    else if (batteryPercent < 20) { message = 'Battery low'; bannerClass = 'warning'; }
    else if (batteryPercent < 50) { message = 'Battery running low'; bannerClass = 'caution'; }
    
    const bannerSub = document.getElementById('home-banner-sub');
    const banner = document.getElementById('home-banner');
    if (bannerSub) bannerSub.textContent = message;
    if (banner) {
        banner.classList.remove('warning', 'caution');
        if (bannerClass) banner.classList.add(bannerClass);
    }
}

// ==================== مقداردهی اولیه صفحه Home ====================
export function initHome() {
    injectPinButtonStyle();
    
    const hr = new Date().getHours();
    const greeting = document.getElementById('home-greeting');
    if (greeting) greeting.textContent = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    
    renderQuickCards();
    renderRecentActivities();
    updateStatusBanner();
    setInterval(updateStatusBanner, 5000);
    
    const clearBtn = document.getElementById('clear-recent-btn');
    if (clearBtn) clearBtn.addEventListener('click', async () => {
        await clearRecentActivities();
        renderRecentActivities();
    });
}

// ==================== صادرات برای استفاده در ماژول‌های دیگر ====================
export { isPinned, pinItem, unpinItem, getPinnedItems };