// modules/sidebar-context.js
import { isPinned, pinItem, unpinItem } from './pages/home.js';

let activeContextMenu = null;

export function showSidebarContextMenu(e, pageId) {
    e.preventDefault();
    if (activeContextMenu) activeContextMenu.remove();
    const menu = document.createElement('div');
    menu.className = 'sidebar-context-menu';
    const pinned = isPinned(pageId);
    const pinText = pinned ? 'Unpin from Home' : 'Pin to Home';
    const pinIcon = pinned ? '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/></svg>' : '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 2l5 5-2 1-5-5 2-1zM7 8L3 14M6 7l-3 3"/></svg>';
    menu.innerHTML = `<div class="ctx-menu-item" data-action="${pinned ? 'unpin' : 'pin'}">${pinIcon}<span>${pinText}</span></div>`;
    document.body.appendChild(menu);
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    menu.classList.add('open');
    activeContextMenu = menu;
    
    const handleClick = (e2) => {
        if (!menu.contains(e2.target)) {
            menu.remove();
            document.removeEventListener('click', handleClick);
            if (activeContextMenu === menu) activeContextMenu = null;
        }
    };
    setTimeout(() => document.addEventListener('click', handleClick), 0);
    
    const actionBtn = menu.querySelector('.ctx-menu-item');
    actionBtn.addEventListener('click', async () => {
        if (actionBtn.dataset.action === 'pin') await pinItem(pageId);
        else await unpinItem(pageId);
        menu.remove();
        if (activeContextMenu === menu) activeContextMenu = null;
    });
}