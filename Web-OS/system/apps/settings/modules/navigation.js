// modules/navigation.js
export function navigate(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + pageId);
    if (page) page.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.querySelector('.nav-item[data-page="' + pageId + '"]');
    if (navItem) navItem.classList.add('active');
    const content = document.getElementById('content');
    if (content) content.scrollTop = 0;
}

export function switchTab(btn, tabId) {
    const parent = btn.closest('.page');
    if (!parent) return;
    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const tab = parent.querySelector('#' + tabId);
    if (tab) tab.classList.add('active');
}

export function selectSwatch(el) {
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
}