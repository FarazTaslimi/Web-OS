// system/apps/settings/main.js
import { loadData } from './modules/api.js';
import { initHome } from './modules/pages/home.js';
import { initSystem } from './modules/pages/system.js';
import { navigate as originalNavigate, switchTab, selectSwatch } from './modules/navigation.js';
import { showSidebarContextMenu } from './modules/sidebar-context.js';

// expose global functions for inline onclick handlers in HTML
window.switchTab = switchTab;
window.selectSwatch = selectSwatch;

// Cache for loaded page DOM elements
const pageCache = new Map();

// Inject icons inside a container using WebOSResources
function injectIcons(container) {
  if (typeof WebOSResources === 'undefined') {
    console.warn('WebOSResources not yet loaded, retrying...');
    setTimeout(() => injectIcons(container), 30);
    return;
  }
  const placeholders = container.querySelectorAll('.icon-placeholder[data-icon]');
  for (const el of placeholders) {
    const iconName = el.getAttribute('data-icon');
    let size = el.style.width || el.getAttribute('width');
    const opts = {};
    if (size) opts.size = size;
    const svgString = WebOSResources.getIcon(iconName, opts);
    if (svgString) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = svgString;
      const svgEl = wrapper.firstElementChild;
      if (svgEl) {
        // copy all classes from placeholder to svg
        svgEl.classList.add(...el.classList);
        el.parentNode.replaceChild(svgEl, el);
      }
    } else {
      console.warn(`Icon "${iconName}" not found in WebOSResources`);
    }
  }
}

// Load a page dynamically
async function loadPage(pageId) {
  if (pageId === 'home') return; // home is static

  if (pageCache.has(pageId)) {
    showPage(pageCache.get(pageId));
    return;
  }

  try {
    const response = await fetch(`./modules/pages/${pageId}.html`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();

    const pageDiv = document.createElement('div');
    pageDiv.className = 'page';
    pageDiv.id = `page-${pageId}`;
    pageDiv.innerHTML = html;

    // Inject icons before appending to avoid layout shifts
    injectIcons(pageDiv);

    document.getElementById('content').appendChild(pageDiv);
    pageCache.set(pageId, pageDiv);
    showPage(pageDiv);

    // Call page-specific initializer if it exists
    if (pageId === 'system') {
      initSystem(); // system.js expects the DOM to be ready
    }
    // You can add more page-specific inits here later
  } catch (err) {
    console.error(`Failed to load page "${pageId}":`, err);
    // Optionally show an error message inside #content
  }
}

function showPage(pageElement) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  pageElement.classList.add('active');
  document.getElementById('content').scrollTop = 0;
}

// Override navigate to support lazy loading
window.navigate = async (pageId) => {
  // Ensure the page is loaded (unless it's home, which is static)
  if (pageId !== 'home' && !pageCache.has(pageId)) {
    await loadPage(pageId);
  }

  // Now switch active page
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    targetPage.classList.add('active');
  }

  // Update sidebar active class
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (activeNav) activeNav.classList.add('active');

  document.getElementById('content').scrollTop = 0;
};

document.addEventListener('DOMContentLoaded', async () => {
  // Load settings data (pinned items, recent activities)
  await loadData();

  // Set up sidebar click and contextmenu events
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.dataset.page;
      if (pageId) window.navigate(pageId);
    });
    item.addEventListener('contextmenu', (e) => {
      const pageId = item.dataset.page;
      if (pageId && pageId !== 'home') showSidebarContextMenu(e, pageId);
    });
  });

  // Inject icons for static home page and sidebar (already in DOM)
  injectIcons(document.getElementById('page-home'));
  // Also inject icons for sidebar elements (the ones that were already replaced by script in index.html? 
  // Actually the placeholder icons in sidebar are also in the static DOM, so we inject them too.
  injectIcons(document.getElementById('sidebar'));

  // Initialize home page logic
  initHome();

  // Start with home page
  window.navigate('home');
});