// js/ui.js
// Restored compatible exports: AudioManager and UI

export class AudioManager {
  constructor(options = {}) {
    const { basePath = 'assets/sounds/', ext = 'mp3' } = options;
    this.basePath = basePath;
    this.ext = ext;
    this._muted = localStorage.getItem('alRuedoMuted') === 'true';
  }

  get muted() {
    return this._muted;
  }

  set muted(value) {
    this._muted = !!value;
    try {
      localStorage.setItem('alRuedoMuted', this._muted);
    } catch (e) {
      // ignore storage errors
    }
  }

  play(name) {
    // Do nothing when muted
    if (this._muted) return null;

    // Best-effort: play a sound located at assets/sounds/{name}.mp3
    try {
      const src = `${this.basePath}${name}.${this.ext}`;
      const audio = new Audio(src);
      // play may reject on some browsers if not user-interacted; swallow errors
      audio.play().catch(() => {});
      return audio;
    } catch (e) {
      return null;
    }
  }

  toggleMute() {
    this.muted = !this._muted;
    return this._muted;
  }
}

export class UI {
  constructor({ creditsEl, betEl, messageEl } = {}) {
    // Accept either element references or element IDs
    this.creditsEl = typeof creditsEl === 'string' ? document.getElementById(creditsEl) : creditsEl;
    this.betEl = typeof betEl === 'string' ? document.getElementById(betEl) : betEl;
    this.messageEl = typeof messageEl === 'string' ? document.getElementById(messageEl) : messageEl;

    // UI state
    this.isSpinning = false;
    this._messageTimeoutId = null;
  }

  setSpinning(value) {
    this.isSpinning = !!value;

    // Keep visual changes minimal and non-invasive. If a spin-related class is
    // desired elsewhere (other scripts), they should observe DOM changes.
    // We toggle a data attribute on documentElement so styles can hook into it
    // without changing existing classes used by other scripts.
    try {
      if (this.isSpinning) {
        document.documentElement.setAttribute('data-spinning', 'true');
      } else {
        document.documentElement.removeAttribute('data-spinning');
      }
    } catch (e) {
      // ignore if DOM can't be updated
    }
  }

  showMessage(text, timeout = 3000) {
    if (!this.messageEl) return;

    // Set the message text
    this.messageEl.textContent = text;

    // Clear any previous timeout
    if (this._messageTimeoutId) {
      clearTimeout(this._messageTimeoutId);
      this._messageTimeoutId = null;
    }

    // If timeout is > 0, clear the message after the timeout
    if (timeout > 0) {
      this._messageTimeoutId = setTimeout(() => {
        if (this.messageEl) this.messageEl.textContent = '';
        this._messageTimeoutId = null;
      }, timeout);
    }
  }
}

// Provide a gentle global fallback for code that previously accessed a global
// UI helper (keeps backwards compatibility for consumers that didn't import).
try {
  if (typeof window !== 'undefined') {
    window.AlRuedo = window.AlRuedo || {};
    window.AlRuedo.AudioManager = window.AlRuedo.AudioManager || AudioManager;
    window.AlRuedo.UI = window.AlRuedo.UI || UI;
  }
} catch (e) {
  // ignore
}
