// modules/constants.js
export const pageIcons = {
    display: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8,21 12,17 16,21"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
    network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
    power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>',
    security: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    updates: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.08-8.36"/></svg>',
    system: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    personalization: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
    themes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 2a10 10 0 0 1 0 20c-1.66 0-3-.67-3-1.5S10.5 19 10.5 18a2 2 0 0 0-2-2H4c-1.1 0-2-.9-2-2a10 10 0 0 1 10-12z"/></svg>',
    bluetooth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/></svg>',
    accounts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    devices: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    diskmanager: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
    about: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    storage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/></svg>',
    taskmanager: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
};

export const pageNames = {
    display: 'Display', sound: 'Sound', network: 'Network', power: 'Power',
    security: 'Security', updates: 'Updates', system: 'System', personalization: 'Personalization',
    themes: 'Themes', bluetooth: 'Bluetooth', accounts: 'Accounts', devices: 'Devices',
    diskmanager: 'Disk Management', about: 'About', storage: 'Storage', taskmanager: 'Task Manager'
};

export const cardColors = {
    display: { bg: 'rgba(96,205,255,.12)', stroke: '#60cdff' },
    sound: { bg: 'rgba(167,139,250,.12)', stroke: '#a78bfa' },
    network: { bg: 'rgba(52,211,153,.12)', stroke: '#34d399' },
    power: { bg: 'rgba(251,191,36,.12)', stroke: '#fbbf24' },
    security: { bg: 'rgba(52,211,153,.12)', stroke: '#34d399' },
    updates: { bg: 'rgba(96,205,255,.12)', stroke: '#60cdff' },
    default: { bg: 'rgba(96,205,255,.12)', stroke: '#60cdff' }
};

export function getCardColor(pageId) {
    return cardColors[pageId] || cardColors.default;
}

export function getCardValue(pageId) {
    switch(pageId) {
        case 'display': return '2560×1440 · 144Hz';
        case 'sound': return '65% · Speakers';
        case 'network': return 'HomeNetwork_5G';
        case 'power': return 'Balanced mode';
        case 'security': return 'Protected';
        case 'updates': return 'Up to date';
        default: return '';
    }
}