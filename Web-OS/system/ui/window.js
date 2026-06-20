/* ═══════════════════════════════════════════════
   WINDOWS 12 CONCEPT — Window Manager
   ═══════════════════════════════════════════════
   
   استفاده:
   const win = WM.create({
     title: 'My App',
     icon: '<svg>...</svg>',   // اختیاری
     width: 800,
     height: 500,
     content: '<div>...</div>',  // HTML یا DOM element
     resizable: true,            // پیش‌فرض: true
     minWidth: 320,
     minHeight: 200,
   });

   WM.close(win.id);
   WM.minimize(win.id);
   WM.maximize(win.id);
   WM.focus(win.id);
   WM.setTitle(win.id, 'New Title');
   WM.setContent(win.id, '<p>new content</p>');
   WM.getEl(win.id);   // برمیگردونه DOM element پنجره
   ═══════════════════════════════════════════════ */

'use strict';

const WM = (() => {

  /* ── State ─────────────────────────────────── */
  const windows   = new Map();   // id → { el, meta }
  let   zTop      = 100;
  let   idCounter = 0;
  let   activeId  = null;

  /* ── Taskbar integration ────────────────────── */
  // برای اضافه کردن آیتم به تسک‌بار running apps
  const TB_ZONE_ID = 'wm-taskbar-zone';
  function getOrCreateTbZone() {
    let zone = document.getElementById(TB_ZONE_ID);
    if (!zone) {
      // بین آیکون‌های تسک‌بار و بخش راست قرار میگیره
      zone = document.createElement('div');
      zone.id = TB_ZONE_ID;
      zone.style.cssText = `
        display:flex; align-items:center; gap:4px;
        padding: 0 6px;
        border-left: 1px solid rgba(255,255,255,0.07);
        border-right: 1px solid rgba(255,255,255,0.07);
        height: 100%; min-width: 0; max-width: 400px;
        overflow: hidden;
      `;
      const tb = document.getElementById('taskbar');
      const tbRight = document.getElementById('tb-right');
      if (tb && tbRight) tb.insertBefore(zone, tbRight);
    }
    return zone;
  }

  function addTbItem(id, title, iconHTML) {
    const zone = getOrCreateTbZone();
    const item = document.createElement('div');
    item.className = 'wm-tb-item';
    item.dataset.wmId = id;
    item.title = title;
    item.innerHTML = `
      <div class="wm-tb-icon">${iconHTML || defaultIcon(title)}</div>
      <span class="wm-tb-label">${title}</span>
      <div class="wm-tb-dot"></div>
    `;
    item.addEventListener('click', () => {
      const w = windows.get(id);
      if (!w) return;
      if (w.meta.minimized) {
        unminimize(id);
      } else if (activeId === id) {
        minimize(id);
      } else {
        focus(id);
      }
    });
    zone.appendChild(item);
  }

  function removeTbItem(id) {
    const el = document.querySelector(`.wm-tb-item[data-wm-id="${id}"]`);
    if (el) el.remove();
  }

  function updateTbItem(id, title) {
    const el = document.querySelector(`.wm-tb-item[data-wm-id="${id}"]`);
    if (el) el.querySelector('.wm-tb-label').textContent = title;
  }

  function setTbActive(id) {
    document.querySelectorAll('.wm-tb-item').forEach(el => el.classList.remove('active'));
    const el = document.querySelector(`.wm-tb-item[data-wm-id="${id}"]`);
    if (el) el.classList.add('active');
  }

  /* ── Default icon ───────────────────────────── */
  function defaultIcon(title) {
    const letter = (title || '?')[0].toUpperCase();
    return `<svg viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="rgba(59,158,255,0.25)"/>
      <text x="14" y="19" text-anchor="middle" font-size="13" font-weight="600" fill="rgba(255,255,255,0.9)" font-family="Geist,sans-serif">${letter}</text>
    </svg>`;
  }

  /* ── Create window ──────────────────────────── */
  function create(opts = {}) {
    const id = ++idCounter;
    const {
      title    = 'Window',
      icon     = '',
      width    = 720,
      height   = 480,
      x,
      y,
      content  = '',
      resizable = true,
      minWidth  = 280,
      minHeight = 180,
      centered  = true,
    } = opts;

    // محاسبه موقعیت اولیه
    const tbH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tb-h')) || 52;
    const vw    = window.innerWidth;
    const vh    = window.innerHeight - tbH - 10;
    const initX = x !== undefined ? x : Math.max(40, (vw - width)  / 2 + (idCounter - 1) * 24);
    const initY = y !== undefined ? y : Math.max(10, (vh - height) / 2 + (idCounter - 1) * 24);

    const el = document.createElement('div');
    el.className = 'wm-window';
    el.dataset.wmId = id;
    el.style.cssText = `
      width:${width}px; height:${height}px;
      left:${initX}px; top:${initY}px;
      z-index:${++zTop};
    `;
    if (!resizable) el.classList.add('no-resize');

    el.innerHTML = `
      <div class="wm-titlebar" data-wm-drag="${id}">
        <div class="wm-titlebar-left">
          <div class="wm-icon">${icon || defaultIcon(title)}</div>
          <span class="wm-title">${title}</span>
        </div>
        <div class="wm-controls">
          <button class="wm-btn wm-minimize" data-wm-action="minimize" title="Minimize">
            <svg viewBox="0 0 10 10" fill="none"><line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
          <button class="wm-btn wm-maximize" data-wm-action="maximize" title="Maximize">
            <svg viewBox="0 0 10 10" fill="none"><rect x="1.5" y="1.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.3"/></svg>
          </button>
          <button class="wm-btn wm-close" data-wm-action="close" title="Close">
            <svg viewBox="0 0 10 10" fill="none"><line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
      <div class="wm-body">
        <div class="wm-content">${typeof content === 'string' ? content : ''}</div>
      </div>
      ${resizable ? `
        <div class="wm-resize wm-resize-n"  data-dir="n"></div>
        <div class="wm-resize wm-resize-s"  data-dir="s"></div>
        <div class="wm-resize wm-resize-e"  data-dir="e"></div>
        <div class="wm-resize wm-resize-w"  data-dir="w"></div>
        <div class="wm-resize wm-resize-ne" data-dir="ne"></div>
        <div class="wm-resize wm-resize-nw" data-dir="nw"></div>
        <div class="wm-resize wm-resize-se" data-dir="se"></div>
        <div class="wm-resize wm-resize-sw" data-dir="sw"></div>
      ` : ''}
    `;

    // اگر content یه DOM element بود
    if (typeof content !== 'string') {
      el.querySelector('.wm-content').appendChild(content);
    }

    document.body.appendChild(el);

    // ذخیره state
    const meta = {
      id, title, icon,
      minimized: false,
      maximized: false,
      prevRect: null,       // برای restore از maximize
      minWidth, minHeight,
      resizable,
    };
    windows.set(id, { el, meta });

    // Animate in
    requestAnimationFrame(() => {
      el.classList.add('wm-open');
    });

    // Events
    bindWindowEvents(id, el);

    // تسک‌بار
    addTbItem(id, title, icon || defaultIcon(title));
    focus(id);

    return { id, el };
  }

  /* ── Bind events ────────────────────────────── */
  function bindWindowEvents(id, el) {
    // دکمه‌ها
    el.addEventListener('click', e => {
      const btn = e.target.closest('[data-wm-action]');
      if (!btn) return;
      const action = btn.dataset.wmAction;
      if (action === 'close')    close(id);
      if (action === 'minimize') minimize(id);
      if (action === 'maximize') toggleMaximize(id);
    });

    // focus روی کلیک
    el.addEventListener('mousedown', e => {
      if (!e.target.closest('[data-wm-action]')) focus(id);
    });

    // Drag
    const titlebar = el.querySelector('[data-wm-drag]');
    if (titlebar) makeDraggable(id, el, titlebar);

    // Resize
    el.querySelectorAll('.wm-resize').forEach(handle => {
      handle.addEventListener('mousedown', e => {
        e.preventDefault(); e.stopPropagation();
        focus(id);
        startResize(id, el, e, handle.dataset.dir);
      });
    });

    // Double-click titlebar → maximize
    titlebar.addEventListener('dblclick', () => toggleMaximize(id));
  }

  /* ── Drag ───────────────────────────────────── */
  function makeDraggable(id, el, handle) {
    let startX, startY, startLeft, startTop, dragging = false;
    const tbH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tb-h')) || 52;

    handle.addEventListener('mousedown', e => {
      if (e.target.closest('[data-wm-action]')) return;
      const w = windows.get(id);
      if (!w) return;

      // اگر maximize بود، هنگام drag برگرد به normal
      if (w.meta.maximized) {
        const ratio = e.clientX / window.innerWidth;
        restore(id);
        const newW = parseInt(el.style.width);
        el.style.left = (e.clientX - newW * ratio) + 'px';
        el.style.top  = '10px';
      }

      dragging = true;
      startX = e.clientX - el.offsetLeft;
      startY = e.clientY - el.offsetTop;
      el.classList.add('wm-dragging');
      document.body.classList.add('wm-no-select');
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      let nx = e.clientX - startX;
      let ny = e.clientY - startY;
      // مرزها
      const maxX = window.innerWidth  - el.offsetWidth;
      const maxY = window.innerHeight - tbH - 10 - 30; // حداقل ۳۰px از titlebar دیده بشه
      nx = Math.max(-el.offsetWidth + 80, Math.min(nx, maxX + el.offsetWidth - 80));
      ny = Math.max(0, Math.min(ny, maxY));
      el.style.left = nx + 'px';
      el.style.top  = ny + 'px';

      // Snap به top → maximize hint
      const snap = document.getElementById('wm-snap-hint');
      if (snap) snap.classList.toggle('show', ny <= 4);
    });

    document.addEventListener('mouseup', e => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('wm-dragging');
      document.body.classList.remove('wm-no-select');

      // Snap maximize
      if (parseInt(el.style.top) <= 4) {
        el.style.top = '0px';
        setTimeout(() => toggleMaximize(id), 50);
      }
      const snap = document.getElementById('wm-snap-hint');
      if (snap) snap.classList.remove('show');
    });
  }

  /* ── Resize ─────────────────────────────────── */
  function startResize(id, el, e, dir) {
    const w   = windows.get(id);
    if (!w) return;
    const { minWidth, minHeight } = w.meta;
    const tbH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tb-h')) || 52;

    let startX = e.clientX, startY = e.clientY;
    let startW = el.offsetWidth, startH = el.offsetHeight;
    let startL = el.offsetLeft,  startT = el.offsetTop;

    el.classList.add('wm-resizing');

    const onMove = ev => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let nw = startW, nh = startH, nl = startL, nt = startT;

      if (dir.includes('e'))  nw = Math.max(minWidth,  startW + dx);
      if (dir.includes('s'))  nh = Math.max(minHeight, startH + dy);
      if (dir.includes('w')) { nw = Math.max(minWidth,  startW - dx); nl = startL + (startW - nw); }
      if (dir.includes('n')) { nh = Math.max(minHeight, startH - dy); nt = startT + (startH - nh); }

      // مرزها
      nt = Math.max(0, nt);
      nl = Math.max(0, nl);
      nh = Math.min(nh, window.innerHeight - tbH - 10 - nt);
      nw = Math.min(nw, window.innerWidth - nl);

      el.style.width  = nw + 'px';
      el.style.height = nh + 'px';
      el.style.left   = nl + 'px';
      el.style.top    = nt + 'px';
    };

    const onUp = () => {
      el.classList.remove('wm-resizing');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  /* ── Focus ──────────────────────────────────── */
  function focus(id) {
    if (activeId === id) {
      // اگر minimize بوده unminimize کن
      const w = windows.get(id);
      if (w?.meta.minimized) unminimize(id);
      return;
    }
    // deactivate قبلی
    if (activeId) {
      const prev = windows.get(activeId);
      if (prev) {
        prev.el.classList.remove('wm-active');
        prev.el.classList.add('wm-inactive');
      }
    }
    const w = windows.get(id);
    if (!w) return;
    w.el.style.zIndex = ++zTop;
    w.el.classList.add('wm-active');
    w.el.classList.remove('wm-inactive', 'wm-minimized');
    w.meta.minimized = false;
    activeId = id;
    setTbActive(id);
  }

  /* ── Minimize ───────────────────────────────── */
  function minimize(id) {
    const w = windows.get(id);
    if (!w || w.meta.minimized) return;
    w.meta.minimized = true;
    w.el.classList.add('wm-minimized');
    w.el.classList.remove('wm-active');

    // پیدا کردن تسک‌بار آیتم برای animate toward
    const tbItem = document.querySelector(`.wm-tb-item[data-wm-id="${id}"]`);
    if (tbItem) {
      const rect = tbItem.getBoundingClientRect();
      w.el.style.transformOrigin = `${rect.left + rect.width/2}px ${rect.top}px`;
    }

    if (activeId === id) {
      activeId = null;
      setTbActive(null);
      // focus بده به آخرین پنجره باز
      const others = [...windows.entries()]
        .filter(([k, v]) => k !== id && !v.meta.minimized)
        .sort((a, b) => parseInt(b[1].el.style.zIndex) - parseInt(a[1].el.style.zIndex));
      if (others.length) focus(others[0][0]);
    }
  }

  function unminimize(id) {
    const w = windows.get(id);
    if (!w) return;
    w.meta.minimized = false;
    w.el.classList.remove('wm-minimized');
    focus(id);
  }

  /* ── Maximize / Restore ─────────────────────── */
  function toggleMaximize(id) {
    const w = windows.get(id);
    if (!w) return;
    if (w.meta.maximized) restore(id);
    else maximize(id);
  }

  function maximize(id) {
    const w = windows.get(id);
    if (!w || w.meta.maximized) return;
    const el = w.el;
    // ذخیره موقعیت فعلی
    w.meta.prevRect = {
      left: el.style.left, top: el.style.top,
      width: el.style.width, height: el.style.height,
    };
    w.meta.maximized = true;
    el.classList.add('wm-maximized');

    // آیکون maximize عوض میشه
    const maxBtn = el.querySelector('.wm-maximize svg');
    if (maxBtn) maxBtn.innerHTML = `
      <rect x="1.5" y="3" width="7" height="5.5" rx="1" stroke="currentColor" stroke-width="1.3"/>
      <rect x="3" y="1.5" width="5.5" height="5" rx="1" fill="var(--layer1)" stroke="currentColor" stroke-width="1.3"/>
    `;
    focus(id);
  }

  function restore(id) {
    const w = windows.get(id);
    if (!w || !w.meta.maximized) return;
    const el = w.el;
    w.meta.maximized = false;
    el.classList.remove('wm-maximized');
    if (w.meta.prevRect) {
      el.style.left   = w.meta.prevRect.left;
      el.style.top    = w.meta.prevRect.top;
      el.style.width  = w.meta.prevRect.width;
      el.style.height = w.meta.prevRect.height;
    }
    const maxBtn = el.querySelector('.wm-maximize svg');
    if (maxBtn) maxBtn.innerHTML = `<rect x="1.5" y="1.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.3"/>`;
    focus(id);
  }

  /* ── Close ──────────────────────────────────── */
  function close(id) {
    const w = windows.get(id);
    if (!w) return;
    w.el.classList.add('wm-closing');
    w.el.addEventListener('animationend', () => {
      w.el.remove();
    }, { once: true });
    // fallback
    setTimeout(() => { if (w.el.parentNode) w.el.remove(); }, 400);

    windows.delete(id);
    removeTbItem(id);

    if (activeId === id) {
      activeId = null;
      const others = [...windows.entries()]
        .filter(([, v]) => !v.meta.minimized)
        .sort((a, b) => parseInt(b[1].el.style.zIndex) - parseInt(a[1].el.style.zIndex));
      if (others.length) focus(others[0][0]);
    }
  }

  /* ── Public helpers ─────────────────────────── */
  function setTitle(id, title) {
    const w = windows.get(id);
    if (!w) return;
    w.meta.title = title;
    const el = w.el.querySelector('.wm-title');
    if (el) el.textContent = title;
    updateTbItem(id, title);
  }

  function setContent(id, html) {
    const w = windows.get(id);
    if (!w) return;
    const body = w.el.querySelector('.wm-content');
    if (!body) return;
    if (typeof html === 'string') body.innerHTML = html;
    else { body.innerHTML = ''; body.appendChild(html); }
  }

  function getEl(id) {
    return windows.get(id)?.el || null;
  }

  function getContentEl(id) {
    return windows.get(id)?.el.querySelector('.wm-content') || null;
  }

  /* ── Snap hint element ──────────────────────── */
  function initSnapHint() {
    if (document.getElementById('wm-snap-hint')) return;
    const hint = document.createElement('div');
    hint.id = 'wm-snap-hint';
    document.body.appendChild(hint);
  }

  /* ── Init ───────────────────────────────────── */
  function init() {
    injectStyles();
    initSnapHint();
    // کلیک روی دسکتاپ → deactivate همه
    document.addEventListener('mousedown', e => {
      if (!e.target.closest('.wm-window') && !e.target.closest('.wm-tb-item')) {
        if (activeId) {
          const w = windows.get(activeId);
          if (w) {
            w.el.classList.remove('wm-active');
            w.el.classList.add('wm-inactive');
          }
          activeId = null;
          setTbActive(null);
        }
      }
    });
  }

  /* ── Inject CSS ─────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('wm-styles')) return;
    const style = document.createElement('style');
    style.id = 'wm-styles';
    style.textContent = `
/* ═══ WINDOW MANAGER STYLES ═══════════════════════ */

.wm-no-select * { user-select: none !important; cursor: inherit !important; }

/* ── Window shell ───────────────────────────────── */
.wm-window {
  position: fixed;
  display: flex;
  flex-direction: column;
  background: rgba(10, 14, 22, 0.82);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    0 0 0 0.5px rgba(255,255,255,0.04) inset,
    0 1px 0 rgba(255,255,255,0.06) inset,
    0 32px 80px rgba(0,0,0,0.75),
    0 8px 24px rgba(0,0,0,0.5);
  min-width: 280px;
  min-height: 180px;
  transform-origin: center center;

  /* open animation */
  opacity: 0;
  transform: scale(0.93) translateY(10px);
  transition:
    opacity 0.22s cubic-bezier(0.23,1,0.32,1),
    transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  pointer-events: none;
}
.wm-window.wm-open {
  opacity: 1;
  transform: scale(1) translateY(0);
  pointer-events: all;
}

/* active / inactive */
.wm-window.wm-active {
  border-color: rgba(255,255,255,0.14);
  box-shadow:
    0 0 0 0.5px rgba(255,255,255,0.06) inset,
    0 1px 0 rgba(255,255,255,0.08) inset,
    0 40px 100px rgba(0,0,0,0.8),
    0 12px 32px rgba(0,0,0,0.6),
    0 0 0 1px rgba(59,158,255,0.08);
}
.wm-window.wm-inactive {
  border-color: rgba(255,255,255,0.06);
  box-shadow:
    0 20px 60px rgba(0,0,0,0.55),
    0 4px 16px rgba(0,0,0,0.4);
}
.wm-window.wm-inactive .wm-titlebar {
  opacity: 0.7;
}

/* maximize */
.wm-window.wm-maximized {
  left: 0 !important; top: 0 !important;
  width: 100vw !important;
  height: calc(100vh - var(--tb-h, 52px) - 10px) !important;
  border-radius: 0 !important;
  border-color: transparent !important;
  transition:
    left 0.3s cubic-bezier(0.23,1,0.32,1),
    top 0.3s cubic-bezier(0.23,1,0.32,1),
    width 0.3s cubic-bezier(0.23,1,0.32,1),
    height 0.3s cubic-bezier(0.23,1,0.32,1),
    border-radius 0.3s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
}
.wm-window.wm-maximized .wm-resize { display: none; }

/* minimize */
.wm-window.wm-minimized {
  opacity: 0 !important;
  transform: scale(0.7) translateY(30px) !important;
  pointer-events: none !important;
  transition:
    opacity 0.25s cubic-bezier(0.23,1,0.32,1),
    transform 0.3s cubic-bezier(0.23,1,0.32,1) !important;
}

/* dragging */
.wm-window.wm-dragging {
  transition: box-shadow 0.2s ease !important;
  box-shadow:
    0 0 0 0.5px rgba(255,255,255,0.08) inset,
    0 48px 120px rgba(0,0,0,0.9),
    0 16px 40px rgba(0,0,0,0.7),
    0 0 0 1px rgba(59,158,255,0.1);
  cursor: grabbing !important;
}
.wm-window.wm-dragging * { cursor: grabbing !important; }

/* close animation */
.wm-window.wm-closing {
  animation: wm-close-anim 0.25s cubic-bezier(0.23,1,0.32,1) forwards;
}
@keyframes wm-close-anim {
  to { opacity: 0; transform: scale(0.92) translateY(8px); }
}

/* ── Titlebar ─────────────────────────────────── */
.wm-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 8px 0 12px;
  background: rgba(255,255,255,0.025);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  cursor: default;
  user-select: none;
}
.wm-titlebar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.wm-icon {
  width: 18px; height: 18px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.wm-icon svg { width: 18px; height: 18px; }
.wm-title {
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wm-window.wm-active .wm-title {
  color: rgba(255,255,255,0.92);
}

/* ── Window controls ──────────────────────────── */
.wm-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.wm-btn {
  width: 28px; height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.12s, color 0.12s, transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
  flex-shrink: 0;
}
.wm-btn svg { width: 10px; height: 10px; pointer-events: none; }
.wm-btn:hover { color: rgba(255,255,255,0.9); transform: scale(1.1); }
.wm-btn:active { transform: scale(0.9); }

.wm-minimize:hover { background: rgba(255,255,255,0.09); }
.wm-maximize:hover { background: rgba(255,255,255,0.09); }
.wm-close:hover    { background: rgba(232, 17, 35, 0.75); color: #fff; }
.wm-close:active   { background: rgba(232, 17, 35, 0.9); }

/* ── Body ─────────────────────────────────────── */
.wm-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}
.wm-content {
  flex: 1;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}
.wm-content::-webkit-scrollbar { width: 5px; height: 5px; }
.wm-content::-webkit-scrollbar-track { background: transparent; }
.wm-content::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}
.wm-content::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }

/* ── Resize handles ───────────────────────────── */
.wm-resize {
  position: absolute;
  z-index: 10;
}
.wm-resize-n  { top: -4px;  left: 10px;  right: 10px;  height: 8px;  cursor: n-resize;  }
.wm-resize-s  { bottom: -4px; left: 10px; right: 10px; height: 8px;  cursor: s-resize;  }
.wm-resize-e  { right: -4px;  top: 10px; bottom: 10px; width: 8px;   cursor: e-resize;  }
.wm-resize-w  { left: -4px;   top: 10px; bottom: 10px; width: 8px;   cursor: w-resize;  }
.wm-resize-ne { top: -4px;    right: -4px;  width: 14px; height: 14px; cursor: ne-resize; }
.wm-resize-nw { top: -4px;    left: -4px;   width: 14px; height: 14px; cursor: nw-resize; }
.wm-resize-se { bottom: -4px; right: -4px;  width: 14px; height: 14px; cursor: se-resize; }
.wm-resize-sw { bottom: -4px; left: -4px;   width: 14px; height: 14px; cursor: sw-resize; }

.wm-window.no-resize .wm-resize { display: none; }

/* ── Snap hint ────────────────────────────────── */
#wm-snap-hint {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent, #3b9eff), var(--accent2, #7c5cfc));
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  box-shadow: 0 0 16px rgba(59,158,255,0.6);
}
#wm-snap-hint.show { opacity: 1; }

/* ── Taskbar window items ─────────────────────── */
.wm-tb-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  max-width: 140px;
  min-width: 36px;
  padding: 0 10px 0 6px;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.15s, max-width 0.3s cubic-bezier(0.23,1,0.32,1);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
}
.wm-tb-item:hover { background: rgba(255,255,255,0.09); }
.wm-tb-item.active {
  background: rgba(59,158,255,0.12);
  border-color: rgba(59,158,255,0.2);
}
.wm-tb-icon {
  width: 20px; height: 20px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.wm-tb-icon svg { width: 20px; height: 20px; }
.wm-tb-label {
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.wm-tb-item.active .wm-tb-label { color: rgba(255,255,255,0.9); }
.wm-tb-dot {
  position: absolute;
  bottom: 3px; left: 50%;
  transform: translateX(-50%);
  width: 14px; height: 2.5px;
  border-radius: 2px;
  background: var(--accent, #3b9eff);
  opacity: 0;
  transition: opacity 0.2s, width 0.2s;
}
.wm-tb-item.active .wm-tb-dot { opacity: 1; }

      .wm-content {
  overflow: hidden !important;
}
    `;
    document.head.appendChild(style);
  }

  /* ── Auto init ──────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Public API ─────────────────────────────── */
  return {
    create,
    close,
    minimize,
    maximize,
    restore,
    toggleMaximize,
    focus,
    setTitle,
    setContent,
    getEl,
    getContentEl,
    windows,
  };

})();
