/**
 * ==============================================================================
 * BROWSER TEXT-TO-SPEECH (TTS) AUDIO ADVISORY SERVICE
 * Smart India Hackathon 2026 | Problem Statement ID: 26071
 * ==============================================================================
 * Enables multi-lingual voice broadcast of emergency warnings for visually impaired,
 * elderly, and low-literacy citizens via the HTML5 Web Speech Synthesis API.
 */

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.listeners = new Set();
  }

  isSupported() {
    return !!this.synth;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(state) {
    this.isPlaying = state;
    this.listeners.forEach(fn => fn(this.isPlaying));
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
    }
  }

  /**
   * Speak text with language-matched voice
   * @param {string} text - Content to read aloud
   * @param {string} langCode - Language code e.g. 'hi-IN', 'mr-IN', 'ta-IN', 'kn-IN', 'en-IN'
   * @param {object} callbacks - Optional callbacks
   */
  speak(text, langCode = 'hi-IN', { onStart, onEnd, onError } = {}) {
    if (!this.synth) {
      console.warn("SpeechSynthesis not supported on this browser.");
      if (onError) onError("Not supported");
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    if (!text || text.trim() === '') return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for clarity during emergency broadcast
    utterance.pitch = 1.0;

    // Normalize lang codes
    const targetLang = langCode.includes('-') ? langCode : `${langCode}-IN`;
    utterance.lang = targetLang;

    // Pick best matching voice if available
    const voices = this.synth.getVoices ? this.synth.getVoices() : [];
    const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase())) ||
                         voices.find(v => v.lang.toLowerCase().includes('in')) ||
                         voices.find(v => v.lang.startsWith('en'));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.notify(true);
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.notify(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      this.notify(false);
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }
}

export const speechService = new SpeechService();
