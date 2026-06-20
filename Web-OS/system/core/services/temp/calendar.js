// system/services/calendar.js – WebOS Calendar Service (Event Delegation for days)
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalendar);
  } else {
    initCalendar();
  }

  function initCalendar() {
    const panel = document.getElementById('cal-panel');
    const clockBtn = document.getElementById('clock-btn');
    if (!panel || !clockBtn) {
      console.warn('Calendar: panel or clock button not found');
      return;
    }
    const service = new CalendarService(panel, clockBtn);
    window.calendarService = service;
  }

  class CalendarService {
    constructor(panelElement, clockBtn) {
      this.panel = panelElement;
      this.clockBtn = clockBtn;
      this.currentDate = new Date();
      this.selectedDate = new Date();
      this.expanded = false;
      this.alarm = { hour: 8, minute: 0 };
      this.reminder = { hour: 9, minute: 0, date: new Date() };
      this._init();
      this._bindClockBtn();
      this._bindDelegatedEvents();
    }

    async _init() {
      try {
        const res = await fetch('/api/calendar');
        const data = await res.json();
        if (data.alarm) this.alarm = data.alarm;
        if (data.reminder) {
          this.reminder = data.reminder;
          this.reminder.date = new Date(this.reminder.date);
        }
      } catch (e) { /* keep defaults */ }
      this.render();
    }

    async _save() {
      try {
        await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alarm: this.alarm,
            reminder: {
              hour: this.reminder.hour,
              minute: this.reminder.minute,
              date: this.reminder.date instanceof Date ? this.reminder.date.toISOString().split('T')[0] : this.reminder.date
            }
          })
        });
      } catch (e) { console.error('Failed to save calendar', e); }
    }

    _bindClockBtn() {
      this.clockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel();
      });
    }

    // ★ Event Delegation برای تمام کلیک‌های داخل پنل
    _bindDelegatedEvents() {
      this.panel.addEventListener('click', (e) => {
        e.stopPropagation(); // کلیک داخل پنل نباید باعث بسته شدن آن شود

        const target = e.target;

        // ۱. کلیک روی یک روز (انتخاب روز)
        const dayEl = target.closest('.cal-day:not(.other)');
        if (dayEl) {
          const day = parseInt(dayEl.dataset.day);
          this.selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
          this.render();
          if (this.panel.classList.contains('show')) {
            this.adjustPosition();
          }
          return;
        }

        // ۲. دکمه ماه قبل
        if (target.closest('#cal-prev')) {
          this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
          this.render();
          if (this.panel.classList.contains('show')) {
            this.adjustPosition();
          }
          return;
        }

        // ۳. دکمه ماه بعد
        if (target.closest('#cal-next')) {
          this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
          this.render();
          if (this.panel.classList.contains('show')) {
            this.adjustPosition();
          }
          return;
        }

        // ۴. دکمه گسترش (Alarm/Reminder)
        if (target.closest('#cal-expand-btn')) {
          this.expanded = !this.expanded;
          const extras = this.panel.querySelector('#cal-extras');
          if (extras) extras.style.display = this.expanded ? 'block' : 'none';
          const btn = this.panel.querySelector('#cal-expand-btn');
          if (btn) btn.classList.toggle('expanded', this.expanded);
          if (this.panel.classList.contains('show')) {
            setTimeout(() => this.adjustPosition(), 10);
          }
          return;
        }

        // ۵. دکمه Set Alarm
        if (target.closest('#alarm-set-btn')) {
          const h = parseInt(document.getElementById('alarm-hour')?.value) || 0;
          const m = parseInt(document.getElementById('alarm-minute')?.value) || 0;
          this.alarm = { hour: h, minute: m };
          this._save();
          alert(`Alarm set for ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`);
          return;
        }

        // ۶. دکمه Set Reminder
        if (target.closest('#reminder-set-btn')) {
          const dateVal = document.getElementById('reminder-date')?.value;
          const h = parseInt(document.getElementById('reminder-hour')?.value) || 0;
          const m = parseInt(document.getElementById('reminder-minute')?.value) || 0;
          if (dateVal) {
            this.reminder = { hour: h, minute: m, date: new Date(dateVal) };
            this._save();
            alert(`Reminder set for ${dateVal} at ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`);
          }
          return;
        }
      });
    }

    togglePanel() {
      const isOpen = this.panel.classList.contains('show');
      if (isOpen) {
        this.panel.classList.remove('show');
      } else {
        document.querySelectorAll('.panel.show').forEach(p => p.classList.remove('show'));
        this.render();
        this.panel.style.display = 'block';
        this.panel.style.visibility = 'hidden';
        this.adjustPosition();
        this.panel.style.visibility = 'visible';
        this.panel.classList.add('show');
      }
    }

    adjustPosition() {
      const tb = document.getElementById('taskbar');
      if (!tb) return;
      const tbRect = tb.getBoundingClientRect();
      this.panel.style.right = (window.innerWidth - tbRect.right) + 'px';
      this.panel.style.top = (tbRect.top - this.panel.offsetHeight - 10) + 'px';
      this.panel.style.left = 'auto';
      this.panel.style.bottom = 'auto';
    }

    render() {
      const now = new Date();
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayIndex = new Date(year, month, 1).getDay();

      let daysHTML = '';
      for (let i = 0; i < firstDayIndex; i++) {
        daysHTML += '<div class="cal-day other"></div>';
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const isToday = dateObj.toDateString() === now.toDateString();
        const isSelected = dateObj.toDateString() === this.selectedDate.toDateString();
        const classes = ['cal-day'];
        if (isToday) classes.push('today');
        if (isSelected) classes.push('selected');
        daysHTML += `<div class="${classes.join(' ')}" data-day="${day}">${day}</div>`;
      }

      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

      this.panel.innerHTML = `
        <div class="cal-header">
          <div class="cal-nav" id="cal-prev">‹</div>
          <div class="cal-month" id="cal-month-year">${monthNames[month]} ${year}</div>
          <div class="cal-nav" id="cal-next">›</div>
        </div>
        <div class="cal-grid">
          <div class="cal-day-name">Su</div><div class="cal-day-name">Mo</div><div class="cal-day-name">Tu</div><div class="cal-day-name">We</div><div class="cal-day-name">Th</div><div class="cal-day-name">Fr</div><div class="cal-day-name">Sa</div>
          ${daysHTML}
        </div>
        <div class="cal-time-section">
          <div class="cal-time-big" id="cal-time-big">${timeStr}</div>
          <div class="cal-date-label">${dateStr}</div>
        </div>
        <div class="cal-expand-btn" id="cal-expand-btn" title="Alarm & Reminder">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M12 10L8 6l-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <div class="cal-extras" id="cal-extras" style="display:none;">
          <hr class="cal-sep"/>
          <div class="cal-extra-section" id="cal-alarm-section">
            <div class="cal-extra-title">⏰ Alarm</div>
            <div class="cal-extra-controls">
              <input type="number" class="cal-time-input" id="alarm-hour" value="${this.alarm.hour}" min="0" max="23" placeholder="HH">
              <span>:</span>
              <input type="number" class="cal-time-input" id="alarm-minute" value="${this.alarm.minute}" min="0" max="59" placeholder="MM">
              <button class="cal-set-btn" id="alarm-set-btn">Set Alarm</button>
            </div>
          </div>
          <div class="cal-extra-section" id="cal-reminder-section" style="margin-top:10px;">
            <div class="cal-extra-title">📅 Reminder</div>
            <div class="cal-extra-controls">
              <input type="date" class="cal-date-input" id="reminder-date" value="${this.reminder.date instanceof Date ? this.reminder.date.toISOString().split('T')[0] : this.reminder.date}">
              <input type="number" class="cal-time-input" id="reminder-hour" value="${this.reminder.hour}" min="0" max="23" placeholder="HH">
              <span>:</span>
              <input type="number" class="cal-time-input" id="reminder-minute" value="${this.reminder.minute}" min="0" max="59" placeholder="MM">
              <button class="cal-set-btn" id="reminder-set-btn">Set Reminder</button>
            </div>
          </div>
        </div>
      `;
    }
  }
})();