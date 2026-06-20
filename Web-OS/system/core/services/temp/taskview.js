// system/services/taskview.js – WebOS Task View (Virtual Desktops) – Simple & Reliable
document.addEventListener('DOMContentLoaded', function() {
  const panel = document.getElementById('taskview-panel');
  const btn = document.getElementById('btn-taskview');

  if (!panel || !btn) {
    console.warn('Task View: panel or button not found');
    return;
  }

  let desktops = [{ id: 'desk-1', name: 'Desktop 1', windows: [] }];
  let activeDesktop = 'desk-1';

  // Load state
  fetch('/api/taskview')
    .then(r => r.json())
    .then(data => {
      if (data.desktops) {
        desktops = data.desktops;
        activeDesktop = data.activeDesktop || desktops[0].id;
      }
      render();
    })
    .catch(() => render());

  // Toggle panel on button click
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (panel.style.display === 'block') {
      panel.style.display = 'none';
    } else {
      render();
      panel.style.display = 'block';
    }
  });

  // Hide when clicking outside
  document.addEventListener('click', function(e) {
    if (panel.style.display === 'block' && !panel.contains(e.target) && e.target !== btn) {
      panel.style.display = 'none';
    }
  });

  function save() {
    fetch('/api/taskview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ desktops, activeDesktop })
    }).catch(() => {});
  }

  function render() {
    // Find or create the container for desktop thumbnails
    let container = panel.querySelector('.desktops-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'desktops-container';
      container.style.cssText = 'display:flex; gap:12px; padding:8px 0; overflow-x:auto; align-items:center;';
      // Insert after the title (if any) or at the end
      const title = panel.querySelector('.np-title');
      if (title) {
        title.after(container);
      } else {
        panel.appendChild(container);
      }
    }

    // Clear previous dynamic thumbs (keep the original static one if it's the first desktop)
    container.querySelectorAll('.dynamic-desk-thumb, .new-desk-btn').forEach(el => el.remove());

    // Update the original desktop thumb (the one that came from HTML)
    const originalThumb = panel.querySelector('.desktop-thumb:not(.dynamic-desk-thumb)');
    if (originalThumb) {
      originalThumb.dataset.deskId = desktops[0].id;
      if (desktops[0].id === activeDesktop) {
        originalThumb.style.border = '2px solid #60cdff';
        originalThumb.style.background = 'rgba(96,205,255,0.15)';
      } else {
        originalThumb.style.border = '1px solid rgba(255,255,255,0.1)';
        originalThumb.style.background = 'rgba(255,255,255,0.05)';
      }
      // Remove old close button if any
      originalThumb.querySelector('.desk-close-btn')?.remove();
      // Add close button only if more than 1 desktop and not active
      if (desktops.length > 1 && desktops[0].id !== activeDesktop) {
        const closeBtn = createCloseButton(desktops[0].id);
        originalThumb.appendChild(closeBtn);
      }
      originalThumb.onclick = () => switchToDesktop(desktops[0].id);
    }

    // Create thumbs for additional desktops
    desktops.forEach((desk, index) => {
      if (index === 0) return; // skip first (original)

      const isActive = desk.id === activeDesktop;
      const thumb = document.createElement('div');
      thumb.className = 'dynamic-desk-thumb';
      thumb.dataset.deskId = desk.id;
      thumb.style.cssText = `
        min-width:160px; height:100px;
        background: ${isActive ? 'rgba(96,205,255,0.15)' : 'rgba(255,255,255,0.05)'};
        border-radius:12px; cursor:pointer; position:relative;
        border: ${isActive ? '2px solid #60cdff' : '1px solid rgba(255,255,255,0.1)'};
        display:flex; align-items:center; justify-content:center;
        transition: all 0.2s; flex-shrink:0;
      `;
      thumb.innerHTML = `<span style="color:#fff; font-size:0.9rem;">${desk.name}</span>`;

      if (!isActive) {
        const closeBtn = createCloseButton(desk.id);
        thumb.appendChild(closeBtn);
      }

      thumb.addEventListener('click', () => switchToDesktop(desk.id));
      container.appendChild(thumb);
    });

    // Add new desktop button
    const addBtn = document.createElement('div');
    addBtn.className = 'new-desk-btn';
    addBtn.style.cssText = `
      min-width:160px; height:100px;
      background:rgba(255,255,255,0.03);
      border-radius:12px; cursor:pointer;
      border:1px dashed rgba(255,255,255,0.2);
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0;
    `;
    addBtn.innerHTML = '<span style="color:#60cdff; font-size:2rem; line-height:1;">+</span>';
    addBtn.addEventListener('click', newDesktop);
    container.appendChild(addBtn);
  }

  function createCloseButton(deskId) {
    const btn = document.createElement('button');
    btn.className = 'desk-close-btn';
    btn.dataset.deskId = deskId;
    btn.style.cssText = `
      position:absolute; top:6px; right:6px;
      background:rgba(255,255,255,0.1); border:none;
      color:#fff; border-radius:50%;
      width:22px; height:22px; cursor:pointer;
      font-size:14px; display:flex; align-items:center;
      justify-content:center; line-height:1;
    `;
    btn.textContent = '✕';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeDesktop(deskId);
    });
    return btn;
  }

  function switchToDesktop(deskId) {
    activeDesktop = deskId;
    save();
    render();
  }

  function newDesktop() {
    const id = 'desk-' + Date.now();
    const name = `Desktop ${desktops.length + 1}`;
    desktops.push({ id, name, windows: [] });
    save();
    render();
  }

  function closeDesktop(deskId) {
    if (desktops.length <= 1) return;
    desktops = desktops.filter(d => d.id !== deskId);
    if (activeDesktop === deskId) {
      activeDesktop = desktops[0].id;
    }
    save();
    render();
  }
});