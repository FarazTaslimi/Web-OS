/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           WebOS Resources — system/lib/resources.js          ║
 * ║   Unified SVG icon library for a modern desktop OS concept   ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  Icon style standards:                                       ║
 * ║  • viewBox  : "0 0 24 24"                                    ║
 * ║  • stroke-width : 1.5                                        ║
 * ║  • stroke-linecap / linejoin : "round"                       ║
 * ║  • fill : "none"  (unless fill is intentional)               ║
 * ║  • color : "currentColor"                                    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use strict';

(function (global) {

  /* ─────────────────────────────────────────────────────────────
     SECTION 1 — SYSTEM / TRAY ICONS  (24 × 24, outline style)
  ───────────────────────────────────────────────────────────── */
  const _system = {

    /** Windows-logo — four coloured squares */
    win: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5"  y="2.5"  width="8.5" height="8.5" rx="1.5" fill="currentColor" opacity="1"/>
      <rect x="13"   y="2.5"  width="8.5" height="8.5" rx="1.5" fill="currentColor" opacity=".8"/>
      <rect x="2.5"  y="13"   width="8.5" height="8.5" rx="1.5" fill="currentColor" opacity=".8"/>
      <rect x="13"   y="13"   width="8.5" height="8.5" rx="1.5" fill="currentColor" opacity=".6"/>
    </svg>`,

    /** Magnifying glass */
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10.5" cy="10.5" r="6.5"/>
      <line x1="15.5" y1="15.5" x2="21" y2="21"/>
    </svg>`,

    /** Task view — two windows */
    taskview: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2"  y="4" width="11" height="13" rx="2"/>
      <rect x="15" y="4" width="7"  height="7"  rx="2"/>
      <rect x="15" y="13" width="7" height="7"  rx="2"/>
    </svg>`,

    /** Widgets — mosaic tiles */
    widgets: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2"  y="2"  width="8" height="6"  rx="2"/>
      <rect x="13" y="2"  width="9" height="11" rx="2"/>
      <rect x="2"  y="11" width="8" height="11" rx="2"/>
      <rect x="13" y="16" width="9" height="6"  rx="2"/>
    </svg>`,

    /** Bell / notification */
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>`,

    /** Wi-Fi signal */
    wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 8.5a15 15 0 0 1 21 0"/>
      <path d="M5.5 12.5a9 9 0 0 1 13 0"/>
      <path d="M9.5 16.5a4.5 4.5 0 0 1 5 0"/>
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>
    </svg>`,

    /** Volume / speaker */
    vol: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" opacity=".5"/>
    </svg>`,

    /** Battery */
    battery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="6" width="18" height="12" rx="2"/>
      <path d="M23 10v4" stroke-width="1.5"/>
      <rect x="3" y="8.5" width="11" height="7" rx="1" fill="currentColor" stroke="none"/>
    </svg>`,

    /** Bluetooth */
    bluetooth: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
    </svg>`,

    /** Airplane mode */
    airplane: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor" stroke="none"/>
    </svg>`,

    /** Night light / warm tones */
    nightlight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" fill="currentColor" opacity=".8" stroke="none"/>
      <circle cx="17" cy="7"  r=".75" fill="currentColor" stroke="none"/>
      <circle cx="20" cy="11" r=".5"  fill="currentColor" stroke="none"/>
      <circle cx="19" cy="4"  r=".5"  fill="currentColor" stroke="none"/>
    </svg>`,

    /** Share */
    share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="5"  r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <circle cx="6"  cy="12" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>`,

    /** Sun / brightness */
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2"  x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="2"  y1="12" x2="5"  y2="12"/>
      <line x1="19" y1="12" x2="22" y2="12"/>
      <line x1="4.22"  y1="4.22"  x2="6.34"  y2="6.34"/>
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
      <line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66"/>
      <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"/>
    </svg>`,

    /** Moon */
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`,

  }; /* end _system */


  /* ─────────────────────────────────────────────────────────────
     SECTION 2 — POWER ICONS
  ───────────────────────────────────────────────────────────── */
  const _power = {

    /** Power on/off */
    power: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
      <line x1="12" y1="2" x2="12" y2="12"/>
    </svg>`,

    /** Restart / refresh */
    restart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-5.36L1 10"/>
    </svg>`,

    /** Sleep / crescent */
    sleep: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 18H7a5 5 0 0 1 0-10h.09A7 7 0 0 1 19 12"/>
      <path d="M17 18a5 5 0 0 0 0-10"/>
    </svg>`,

    /** Shutdown — power + line */
    shutdown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
      <line x1="12" y1="2" x2="12" y2="12"/>
      <line x1="8" y1="22" x2="16" y2="22" opacity=".4"/>
    </svg>`,

    /** Hibernate — layers + zzz */
    hibernate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 17h4l-4 5h4"/>
      <path d="M9 14h3l-3 4h3"/>
      <path d="M15 17h2l-2 2h2"/>
      <rect x="2" y="3" width="20" height="12" rx="2"/>
    </svg>`,

    /** Lock screen */
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
    </svg>`,

  }; /* end _power */


  /* ─────────────────────────────────────────────────────────────
     SECTION 3 — NAVIGATION ICONS
  ───────────────────────────────────────────────────────────── */
  const _nav = {

    /** Chevron left */
    'chevron-left': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="15 18 9 12 15 6"/>
    </svg>`,

    /** Chevron right */
    'chevron-right': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="9 18 15 12 9 6"/>
    </svg>`,

    /** Chevron up */
    'chevron-up': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="18 15 12 9 6 15"/>
    </svg>`,

    /** Chevron down */
    'chevron-down': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6 9 12 15 18 9"/>
    </svg>`,

    /** Back arrow */
    'back-arrow': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>`,

    /** Forward arrow */
    'forward-arrow': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>`,

    /** Close / X */
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`,

    /** Minimize — horizontal bar */
    minimize: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <line x1="5" y1="19" x2="19" y2="19"/>
    </svg>`,

    /** Maximize — empty square */
    maximize: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="1.5"/>
    </svg>`,

    /** Restore — overlapping squares */
    restore: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="12" height="12" rx="1.5"/>
      <path d="M16 8V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9.5A1.5 1.5 0 0 0 5 16h3"/>
    </svg>`,

    /** Up — caret */
    up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>`,

    /** Down — caret */
    down: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5v14M5 12l7 7 7-7"/>
    </svg>`,

  }; /* end _nav */


  /* ─────────────────────────────────────────────────────────────
     SECTION 4 — GENERAL / UTILITY ICONS
  ───────────────────────────────────────────────────────────── */
  const _general = {

    /** Plus */
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`,

    /** Minus */
    minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`,

    /** Pin — push-pin */
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l2.5 6H20l-5 3.5 1.5 6.5L12 14l-4.5 4 1.5-6.5L4 8h5.5L12 2z"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
    </svg>`,

    /** Unpin — pin with slash */
    unpin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l2.5 6H20l-5 3.5 1.5 6.5L12 14l-4.5 4 1.5-6.5L4 8h5.5L12 2z" opacity=".4"/>
      <line x1="3" y1="3" x2="21" y2="21"/>
    </svg>`,

    /** Check / checkmark */
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`,

    /** More (three dots horizontal) */
    more: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5"  cy="12" r="1.5"/>
      <circle cx="12" cy="12" r="1.5"/>
      <circle cx="19" cy="12" r="1.5"/>
    </svg>`,

    /** More vertical */
    'more-vertical': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="5"  r="1.5"/>
      <circle cx="12" cy="12" r="1.5"/>
      <circle cx="12" cy="19" r="1.5"/>
    </svg>`,

    /** Edit / pencil */
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>`,

    /** Trash / delete */
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>`,

    /** Copy */
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>`,

    /** Paste / clipboard */
    paste: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1"/>
    </svg>`,

    /** Rename */
    rename: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
      <line x1="2" y1="22" x2="22" y2="22" opacity=".3"/>
    </svg>`,

    /** Link */
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>`,

    /** Info */
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>`,

    /** Warning */
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,

    /** Sort */
    sort: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="15" y2="12"/>
      <line x1="3" y1="18" x2="9"  y2="18"/>
    </svg>`,

    /** Filter */
    filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>`,

    /** Grid view */
    grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>`,

    /** List view */
    list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="6"  x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="3.5" cy="6"  r="1" fill="currentColor" stroke="none"/>
      <circle cx="3.5" cy="12" r="1" fill="currentColor" stroke="none"/>
      <circle cx="3.5" cy="18" r="1" fill="currentColor" stroke="none"/>
    </svg>`,

    /** Refresh */
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>`,

    /** Home */
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>`,

  }; /* end _general */


  /* ─────────────────────────────────────────────────────────────
     SECTION 5 — FILE SYSTEM ICONS  (Desktop folders & drives)
  ───────────────────────────────────────────────────────────── */
  const _files = {

    /** Generic folder */
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>`,

    /** Documents folder */
    documents: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      <line x1="8" y1="14" x2="16" y2="14"/>
      <line x1="8" y1="17" x2="13" y2="17"/>
    </svg>`,

    /** Downloads */
    downloads: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      <polyline points="12 11 12 17 9 14"/>
      <polyline points="12 17 15 14"/>
    </svg>`,

    /** Pictures */
    pictures: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="14" r="2"/>
      <path d="M8.5 18l2.5-3 1.5 1.5 2-2.5 3 4" opacity=".8"/>
    </svg>`,

    /** Music */
    music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      <path d="M10 17v-5l5-1v5"/>
      <circle cx="10" cy="17" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="16" r="1" fill="currentColor" stroke="none"/>
    </svg>`,

    /** Videos */
    videos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      <polygon points="10 12 15 14.5 10 17 10 12" fill="currentColor" stroke="none"/>
    </svg>`,

    /** Recycle bin / Trash */
    recycle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>`,

    /** Desktop icon */
    desktop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8"  y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>`,

    /** Generic file */
    file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <polyline points="13 2 13 9 20 9"/>
    </svg>`,

    /** Hard drive */
    drive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>`,

    /** USB / external drive */
    usb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7"  cy="7"  r="2"/>
      <circle cx="17" cy="7"  r="2"/>
      <path d="M12 21v-8M12 13l-3-3M12 13l3-3M12 21a3 3 0 0 1-3-3v-2h6v2a3 3 0 0 1-3 3z"/>
    </svg>`,

  }; /* end _files */


  /* ─────────────────────────────────────────────────────────────
     SECTION 6 — SETTINGS APP PAGE ICONS
  ───────────────────────────────────────────────────────────── */
  const _settings = {

    /** Display / monitor */
    display: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8"  y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>`,

    /** Sound / waves */
    sound: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" opacity=".8"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" opacity=".5"/>
    </svg>`,

    /** Network / globe */
    network: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>`,

    /** Personalization — paint brush */
    personalization: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
      <circle cx="8.5"  cy="7.5"  r=".5" fill="currentColor"/>
      <circle cx="6.5"  cy="12.5" r=".5" fill="currentColor"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-.5c0-.28-.1-.53-.26-.74a1 1 0 0 1 .76-1.65H16a4 4 0 0 0 4-4c0-4.42-3.58-7.61-8-7.61z"/>
    </svg>`,

    /** Themes — colour palette */
    themes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 13.5A10 10 0 1 0 12 2"/>
      <path d="M12 2v4M12 18v4M2 12H6M18 12h4" opacity=".4"/>
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 8 Q16 12 12 16 Q8 12 12 8z" fill="currentColor" opacity=".6" stroke="none"/>
    </svg>`,

    /** Accounts / user */
    accounts: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>`,

    /** Security / shield */
    security: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`,

    /** Devices / laptop + phone */
    devices: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="14" height="10" rx="2"/>
      <line x1="2" y1="20" x2="16" y2="20"/>
      <line x1="9"  y1="13" x2="9"  y2="20"/>
      <rect x="17" y="8" width="5" height="9" rx="1"/>
      <line x1="19" y1="17" x2="20" y2="17"/>
    </svg>`,

    /** Disk manager */
    diskmanager: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="7" rx="2"/>
      <rect x="2" y="14" width="20" height="7" rx="2"/>
      <circle cx="18.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      <circle cx="18.5" cy="17.5" r="1" fill="currentColor" stroke="none"/>
      <line x1="6" y1="6.5"  x2="13" y2="6.5"/>
      <line x1="6" y1="17.5" x2="13" y2="17.5"/>
    </svg>`,

    /** Updates / arrow cycle */
    updates: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-5.36L1 10"/>
      <line x1="12" y1="8"  x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`,

    /** About / info bubble */
    about: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>`,

    /** Storage — SD card-like */
    storage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>`,

    /** Task manager — activity bars */
    taskmanager: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2"  y="2" width="20" height="20" rx="2"/>
      <line x1="6"  y1="18" x2="6"  y2="12"/>
      <line x1="10" y1="18" x2="10" y2="8"/>
      <line x1="14" y1="18" x2="14" y2="14"/>
      <line x1="18" y1="18" x2="18" y2="10"/>
    </svg>`,

    /** Privacy — eye */
    privacy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`,

    /** Accessibility — person in circle */
    accessibility: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="8"  r="2"/>
      <path d="M9 13h6l-1 5M12 13v3"/>
      <path d="M9.5 11.5l-2 4M14.5 11.5l2 4" opacity=".6"/>
    </svg>`,

    /** Language / globe-speech */
    language: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>`,

    /** Date & time — clock */
    datetime: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`,

  }; /* end _settings */


  /* ─────────────────────────────────────────────────────────────
     SECTION 7 — APP ICONS  (colourful, 44 × 44 canvas style)
     These retain their original coloured fills for desktop use.
  ───────────────────────────────────────────────────────────── */
  const _apps = {

    /** File Explorer — yellow folder */
    explorer: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 17a3 3 0 0 1 3-3h9l4 4h17a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V17z" fill="#f5c518"/>
      <path d="M4 22h36v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V22z" fill="#f9d849"/>
      <path d="M14 28h10M14 32h6" stroke="rgba(0,0,0,.2)" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    /** Microsoft Edge */
    edge: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="e1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#36d6fa"/>
          <stop offset="100%" stop-color="#1a7fe8"/>
        </linearGradient>
      </defs>
      <circle cx="22" cy="22" r="18" fill="url(#e1)"/>
      <path d="M38 22c0 8.8-7.2 16-16 16S6 30.8 6 22S13.2 6 22 6c4.4 0 8.4 1.7 11.3 4.5"
        fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" opacity=".3"/>
      <path d="M12 27c0 4.5 3.8 9 10.5 9C30 36 38 30.5 38 22c0-2.5-1.2-4.8-3-6.2"
        fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
      <circle cx="22" cy="22" r="7" fill="white" opacity=".9"/>
    </svg>`,

    /** Microsoft Store — four coloured squares */
    store: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3"  y="3"  width="18" height="18" rx="3" fill="#F25022"/>
      <rect x="23" y="3"  width="18" height="18" rx="3" fill="#7FBA00"/>
      <rect x="3"  y="23" width="18" height="18" rx="3" fill="#00A4EF"/>
      <rect x="23" y="23" width="18" height="18" rx="3" fill="#FFB900"/>
    </svg>`,

    /** Settings — gear on blue bg */
    settings: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sg1" cx="35%" cy="25%">
          <stop offset="0%" stop-color="#74b9ff"/>
          <stop offset="100%" stop-color="#0984e3"/>
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="19" fill="url(#sg1)"/>
      <path d="M22 13v2M22 29v2M13 22h-2M33 22h2
               M15.5 15.5l1.4 1.4M27.1 27.1l1.4 1.4
               M15.5 28.5l1.4-1.4M27.1 16.9l1.4-1.4"
        stroke="white" stroke-width="2" stroke-linecap="round" opacity=".6"/>
      <circle cx="22" cy="22" r="6" fill="white" opacity=".95"/>
    </svg>`,

    /** Notepad — white paper + yellow marker */
    notepad: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="5" width="26" height="34" rx="3" fill="white" opacity=".97"/>
      <rect x="27" y="5" width="6"  height="34" rx="2" fill="#ffd166"/>
      <line x1="12" y1="15" x2="24" y2="15" stroke="#ddd" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="12" y1="21" x2="24" y2="21" stroke="#ddd" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="12" y1="27" x2="24" y2="27" stroke="#ddd" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="12" y1="33" x2="20" y2="33" stroke="#ddd" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

    /** Recycle Bin — teal bin */
    recycle: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="19" width="24" height="20" rx="3" fill="#5DC2E8" opacity=".9"/>
      <rect x="8"  y="14" width="28" height="6"  rx="2" fill="#4EB3D8"/>
      <rect x="16" y="9"  width="12" height="6"  rx="2" fill="#4EB3D8"/>
      <line x1="18" y1="23" x2="18" y2="35" stroke="white" stroke-width="2" stroke-linecap="round" opacity=".6"/>
      <line x1="22" y1="23" x2="22" y2="35" stroke="white" stroke-width="2" stroke-linecap="round" opacity=".6"/>
      <line x1="26" y1="23" x2="26" y2="35" stroke="white" stroke-width="2" stroke-linecap="round" opacity=".6"/>
    </svg>`,

    /** Terminal / command prompt */
    terminal: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="40" height="40" rx="6" fill="#1a1a2e"/>
      <path d="M10 16l8 8-8 8" stroke="#00ff88" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="22" y1="32" x2="34" y2="32" stroke="#00ff88" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,

    /** Calculator */
    calculator: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="34" height="34" rx="5" fill="#2d3436"/>
      <rect x="9" y="9" width="26" height="9" rx="2" fill="#636e72" opacity=".8"/>
      <rect x="9"  y="22" width="7" height="5" rx="1.5" fill="#74b9ff"/>
      <rect x="19" y="22" width="7" height="5" rx="1.5" fill="#74b9ff"/>
      <rect x="29" y="22" width="7" height="5" rx="1.5" fill="#fd79a8"/>
      <rect x="9"  y="30" width="7" height="5" rx="1.5" fill="#74b9ff"/>
      <rect x="19" y="30" width="7" height="5" rx="1.5" fill="#74b9ff"/>
      <rect x="29" y="30" width="7" height="5" rx="1.5" fill="#fd79a8"/>
    </svg>`,

    /** Camera */
    camera: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="40" height="30" rx="5" fill="#2d3436"/>
      <path d="M14 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" fill="#636e72"/>
      <circle cx="22" cy="25" r="9" stroke="#74b9ff" stroke-width="2.5" fill="none"/>
      <circle cx="22" cy="25" r="5" fill="#74b9ff" opacity=".5"/>
      <circle cx="33" cy="16" r="2" fill="#ffd166"/>
    </svg>`,

    /** Maps / location */
    maps: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="40" height="40" rx="6" fill="#00b894"/>
      <path d="M14 4L6 20l16 20 16-20L30 4z" fill="white" opacity=".15"/>
      <path d="M14 4l8 36 8-36" fill="white" opacity=".1"/>
      <circle cx="22" cy="18" r="6" fill="white"/>
      <circle cx="22" cy="18" r="3" fill="#e17055"/>
    </svg>`,

    /** Calendar */
    calendar: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="7" width="38" height="34" rx="5" fill="white"/>
      <rect x="3" y="7" width="38" height="12" rx="5" fill="#e17055"/>
      <rect x="3" y="16" width="38" height="3" fill="#e17055"/>
      <line x1="9"  y1="5" x2="9"  y2="11" stroke="#e17055" stroke-width="3" stroke-linecap="round"/>
      <line x1="35" y1="5" x2="35" y2="11" stroke="#e17055" stroke-width="3" stroke-linecap="round"/>
      <text x="12" y="35" font-family="system-ui" font-size="13" font-weight="700" fill="#2d3436">10</text>
    </svg>`,

    /** Mail */
    mail: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ml1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#74b9ff"/>
          <stop offset="100%" stop-color="#0984e3"/>
        </linearGradient>
      </defs>
      <rect x="2" y="8" width="40" height="28" rx="5" fill="url(#ml1)"/>
      <path d="M2 13l20 14L42 13" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`,

    /** Photos */
    photos: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ph1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fd79a8"/>
          <stop offset="100%" stop-color="#e84393"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="40" height="40" rx="6" fill="url(#ph1)"/>
      <circle cx="14" cy="14" r="4" fill="white" opacity=".8"/>
      <path d="M2 30l12-10 8 8 6-6 14 12" fill="white" opacity=".4"/>
      <path d="M2 34l12-10 8 8 6-6 14 12V42H2z" fill="white" opacity=".6"/>
    </svg>`,

    /** Music player */
    musicplayer: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mu1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#a29bfe"/>
          <stop offset="100%" stop-color="#6c5ce7"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="40" height="40" rx="8" fill="url(#mu1)"/>
      <circle cx="22" cy="22" r="12" stroke="white" stroke-width="2" fill="none" opacity=".5"/>
      <circle cx="22" cy="22" r="4" fill="white"/>
      <path d="M19 9v4M25 9v4M29 11l-3 3M13 11l3 3" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
    </svg>`,

    /** Videos / movies */
    videoplayer: `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vp1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#55efc4"/>
          <stop offset="100%" stop-color="#00b894"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="40" height="40" rx="6" fill="#1a1a2e"/>
      <rect x="2" y="10" width="40" height="24" fill="url(#vp1)" opacity=".2"/>
      <polygon points="17,14 17,30 32,22" fill="white"/>
    </svg>`,

  }; /* end _apps */


  /* ─────────────────────────────────────────────────────────────
     SECTION 8 — MERGE ALL ICON MAPS
  ───────────────────────────────────────────────────────────── */
  const _allIcons = Object.assign(
    {},
    _system,
    _power,
    _nav,
    _general,
    _files,
    _settings,
    _apps,
    /* Convenience aliases */
    {
      /* legacy / shell.js aliases kept for backward compatibility */
      chevLeft:    _nav['chevron-left'],
      chevRight:   _nav['chevron-right'],
      chevUp:      _nav['chevron-up'],
      chevDown:    _nav['chevron-down'],
      backArrow:   _nav['back-arrow'],
      diskManager: _settings.diskmanager,
      taskManager: _settings.taskmanager,
    }
  );


  /* ─────────────────────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────────────────────── */

  /**
   * WebOSResources — global singleton exposed on window.
   *
   * Usage:
   *   const svg = WebOSResources.getIcon('wifi');
   *   const all = WebOSResources.listIcons();
   */
  const WebOSResources = {

    /**
     * Returns an SVG string for the requested icon name.
     * @param  {string} name  Icon key (case-sensitive).
     * @param  {object} [opts]
     * @param  {string} [opts.size]   CSS width/height value, e.g. "20px". Injected as
     *                                 `style="width:…;height:…"` on the root <svg>.
     * @param  {string} [opts.color]  CSS colour override — sets `color` style so that
     *                                 `currentColor` icons pick it up automatically.
     * @returns {string} SVG markup, or an empty string if the icon is not found.
     */
    getIcon(name, opts = {}) {
      const raw = _allIcons[name];
      if (!raw) {
        console.warn(`[WebOSResources] Icon not found: "${name}"`);
        return '';
      }
      if (!opts.size && !opts.color) return raw;

      /* Inject size / colour into the root <svg> tag */
      const style = [
        opts.size  ? `width:${opts.size};height:${opts.size};` : '',
        opts.color ? `color:${opts.color};` : '',
      ].join('');

      return raw.replace(/^<svg /, `<svg style="${style}" `);
    },

    /**
     * Returns an array of all registered icon names.
     * @returns {string[]}
     */
    listIcons() {
      return Object.keys(_allIcons).sort();
    },

    /**
     * Returns the total number of registered icons.
     * @returns {number}
     */
    get count() {
      return Object.keys(_allIcons).length;
    },

    /**
     * Registers a custom icon at runtime.
     * @param {string} name    Unique icon key.
     * @param {string} svgStr  Raw SVG markup string.
     */
    register(name, svgStr) {
      if (_allIcons[name]) {
        console.warn(`[WebOSResources] Overwriting existing icon: "${name}"`);
      }
      _allIcons[name] = svgStr;
    },

    /* Direct access to icon groups (read-only references) */
    icons: {
      system:   _system,
      power:    _power,
      nav:      _nav,
      general:  _general,
      files:    _files,
      settings: _settings,
      apps:     _apps,
    },

  };

  /* Expose globally */
  global.WebOSResources = WebOSResources;

  /* Also keep backward-compat IC object for legacy code in shell.js */
  global.IC = new Proxy(_allIcons, {
    get(target, key) {
      if (key in target) return target[key];
      console.warn(`[IC] Icon not found: "${key}"`);
      return '';
    }
  });

}(typeof window !== 'undefined' ? window : globalThis));
