// system/services/widgets.js – WebOS Widget Service (Complete)
// ================================================================

window.WidgetRegistry = {
  widgets: {},
  register(widget) {
    if (!widget.id || !widget.title || !widget.render) {
      console.error('Widget must have id, title, and render function');
      return;
    }
    this.widgets[widget.id] = widget;
    if (window.WidgetService) window.WidgetService._renderPanel();
  },
  unregister(widgetId) {
    delete this.widgets[widgetId];
    if (window.WidgetService) window.WidgetService._renderPanel();
  }
};

// ── Default Widgets ─────────────────────────────────
// ۱. Analog Clock
WidgetRegistry.register({
  id: 'analog-clock',
  title: 'Clock',
  render(container) {
    const canvas = document.createElement('canvas');
    canvas.width = 120; canvas.height = 120;
    canvas.style.display = 'block'; canvas.style.margin = '0 auto';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    function drawClock() {
      const now = new Date();
      const hours = now.getHours() % 12, minutes = now.getMinutes(), seconds = now.getSeconds();
      ctx.clearRect(0, 0, 120, 120);
      ctx.beginPath(); ctx.arc(60, 60, 50, 0, 2*Math.PI); ctx.strokeStyle='#ffffff40'; ctx.lineWidth=2; ctx.stroke();
      const hourAngle = (hours+minutes/60)*30*Math.PI/180; ctx.beginPath(); ctx.moveTo(60,60); ctx.lineTo(60+25*Math.cos(hourAngle-Math.PI/2),60+25*Math.sin(hourAngle-Math.PI/2)); ctx.strokeStyle='#ffffff'; ctx.lineWidth=3; ctx.stroke();
      const minAngle = minutes*6*Math.PI/180; ctx.beginPath(); ctx.moveTo(60,60); ctx.lineTo(60+35*Math.cos(minAngle-Math.PI/2),60+35*Math.sin(minAngle-Math.PI/2)); ctx.strokeStyle='#ffffff'; ctx.lineWidth=2; ctx.stroke();
      const secAngle = seconds*6*Math.PI/180; ctx.beginPath(); ctx.moveTo(60,60); ctx.lineTo(60+40*Math.cos(secAngle-Math.PI/2),60+40*Math.sin(secAngle-Math.PI/2)); ctx.strokeStyle='#ff6b6b'; ctx.lineWidth=1; ctx.stroke();
      requestAnimationFrame(drawClock);
    }
    drawClock();
  }
});

// ۲. Date Widget
WidgetRegistry.register({
  id: 'date-widget',
  title: 'Date',
  render(container) {
    const div = document.createElement('div');
    div.style.textAlign = 'center'; div.style.fontSize = '1.1rem';
    container.appendChild(div);
    function updateDate() {
      const now = new Date();
      div.textContent = now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    }
    updateDate();
    setInterval(updateDate, 60000);
  }
});

// ۳. Weather Widget (simulated)
WidgetRegistry.register({
  id: 'weather',
  title: 'Weather',
  render(container) {
    container.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:2rem;">☀️</div>
        <div style="font-size:1.3rem; margin:4px 0;">24°C</div>
        <div style="font-size:0.8rem; opacity:0.6;">Sunny</div>
        <div style="font-size:0.7rem; opacity:0.5; margin-top:4px;">New York, NY</div>
      </div>`;
  }
});

// ── Widget Service ───────────────────────────────────
(function() {
  class WidgetService {
    constructor() {
      this.panel = document.getElementById('widgets-panel');
      this.btn   = document.getElementById('btn-widgets');
      if (!this.panel || !this.btn) return;
      this._bindButton();
    }

    _bindButton() {
      this.btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._togglePanel();
      });
    }

    _togglePanel() {
      const isOpen = this.panel.style.display === 'block';
      if (isOpen) {
        this.panel.style.display = 'none';
      } else {
        document.querySelectorAll('.panel.show').forEach(p => p.classList.remove('show'));
        this._renderPanel();
        this.panel.style.visibility = 'hidden';
        this.panel.style.display = 'block';
        this._positionPanel();
        this.panel.style.visibility = 'visible';
      }
    }

    _positionPanel() {
      const tb = document.getElementById('taskbar');
      if (!tb || !this.panel) return;
      const r = tb.getBoundingClientRect();
      const pw = this.panel.offsetWidth, ph = this.panel.offsetHeight;
      this.panel.style.left = (r.left + r.width/2 - pw/2) + 'px';
      this.panel.style.top  = (r.top - ph - 10) + 'px';
      this.panel.style.bottom = 'auto';
      this.panel.style.right  = 'auto';
      this.panel.style.transform = 'none';
    }

    _renderPanel() {
      if (!this.panel) return;
      let container = this.panel.querySelector('.widgets-grid');
      if (!container) {
        container = document.createElement('div');
        container.className = 'widgets-grid';
        container.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill, minmax(150px,1fr)); gap:12px; padding:8px 0;';
        const title = this.panel.querySelector('.np-title');
        if (title) title.after(container); else this.panel.appendChild(container);
      }
      container.innerHTML = '';
      const widgets = Object.values(WidgetRegistry.widgets);
      if (widgets.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-dim);padding:20px;">No widgets registered</div>';
        return;
      }
      widgets.forEach(w => {
        const card = document.createElement('div');
        card.className = 'widget-card';
        card.style.cssText = 'background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px;';
        const tbDiv = document.createElement('div');
        tbDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:0.75rem; color:rgba(255,255,255,0.5);';
        tbDiv.innerHTML = `<span>${w.title}</span>`;
        card.appendChild(tbDiv);
        const content = document.createElement('div');
        w.render(content);
        card.appendChild(content);
        container.appendChild(card);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new WidgetService());
  } else {
    new WidgetService();
  }
})();