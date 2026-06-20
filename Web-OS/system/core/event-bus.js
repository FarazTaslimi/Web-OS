// system/core/event-bus.js
// Isomorphic event bus — works in both Node.js and browser.

(function (global) {
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // Node.js
    const EventEmitter = require('events');
    module.exports = new EventEmitter();
  } else {
    // Browser
    global.EventBus = new EventTarget();
  }
})(typeof window !== 'undefined' ? window : globalThis);