/**
 * VTz Voice System — Drop-in TTS module
 * ----------------------------------------
 * Como usar em qualquer projeto:
 *
 * 1. Adicione no <head> do HTML (opcional mas recomendado para vozes neurais):
 *    <script src="https://code.responsivevoice.org/responsivevoice.js" defer></script>
 *
 * 2. Inclua este arquivo:
 *    <script src="vtx-voice.js"></script>
 *
 * 3. Use:
 *    VTzVoice.speak("Olá, mundo!");
 *    VTzVoice.setVoice("Brazilian Portuguese Male");
 *    VTzVoice.setRate(1.1);
 *    VTzVoice.setPitch(0.95);
 *    VTzVoice.preview();
 *    VTzVoice.stop();
 *
 * Vozes disponíveis (ResponsiveVoice):
 *   "Brazilian Portuguese Female"  ← padrão, melhor qualidade
 *   "Brazilian Portuguese Male"
 *   "Portuguese Female"            ← Portugal
 *   "Google português do Brasil"   ← depende do navegador
 */

const VTzVoice = (() => {
  /* ── CONFIGURAÇÃO PADRÃO ── */
  const STORAGE_KEYS = {
    voice: 'vtx_voice',
    rate:  'vtx_rate',
    pitch: 'vtx_pitch',
  };

  const DEFAULTS = {
    voice: 'Brazilian Portuguese Female',
    rate:  0.9,
    pitch: 1.0,
  };

  /* ── PREFERÊNCIAS ── */
  function getPrefs() {
    return {
      voice: localStorage.getItem(STORAGE_KEYS.voice) || DEFAULTS.voice,
      rate:  parseFloat(localStorage.getItem(STORAGE_KEYS.rate)  || DEFAULTS.rate),
      pitch: parseFloat(localStorage.getItem(STORAGE_KEYS.pitch) || DEFAULTS.pitch),
    };
  }

  function setVoice(v) { localStorage.setItem(STORAGE_KEYS.voice, v); }
  function setRate(r)  { localStorage.setItem(STORAGE_KEYS.rate,  r); }
  function setPitch(p) { localStorage.setItem(STORAGE_KEYS.pitch, p); }

  /* ── FALLBACK: WEB SPEECH API (nativa do navegador) ── */
  function speakBrowser(text, prefs) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang   = 'pt-BR';
      u.rate   = prefs.rate;
      u.pitch  = prefs.pitch;
      u.volume = 1;

      const pickAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find(v => v.lang === 'pt-BR' && v.name.includes('Google'))    ||
          voices.find(v => v.lang === 'pt-BR' && v.name.includes('Neural'))    ||
          voices.find(v => v.lang === 'pt-BR' && v.name.includes('Francisca')) ||
          voices.find(v => v.lang === 'pt-BR' && v.localService)               ||
          voices.find(v => v.lang === 'pt-BR')                                  ||
          voices.find(v => v.lang.startsWith('pt'));
        if (preferred) u.voice = preferred;
        window.speechSynthesis.speak(u);
      };

      const loaded = window.speechSynthesis.getVoices();
      if (loaded.length) pickAndSpeak();
      else window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        pickAndSpeak();
      };
    } catch (e) {
      console.warn('[VTzVoice] Browser TTS error:', e);
    }
  }

  /* ── FALAR ── */
  function speak(text) {
    if (!text) return;
    const p = getPrefs();

    /* ResponsiveVoice (vozes neurais Google — melhor qualidade) */
    if (window.responsiveVoice) {
      try {
        responsiveVoice.cancel();
        responsiveVoice.speak(text, p.voice, {
          rate:   p.rate,
          pitch:  p.pitch,
          volume: 1,
          onerror: () => speakBrowser(text, p),
        });
        return;
      } catch (e) { /* cai no fallback */ }
    }

    /* Fallback: Web Speech API nativa */
    speakBrowser(text, p);
  }

  /* ── PARAR ── */
  function stop() {
    if (window.responsiveVoice) try { responsiveVoice.cancel(); } catch(e){}
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  /* ── PREVIEW ── */
  function preview(text) {
    speak(text || 'Olá! Sistema de voz VTz ativo e funcionando.');
  }

  /* ── GERA HTML DO PAINEL DE CONFIGURAÇÃO ── */
  function renderPanel(containerId) {
    const p = getPrefs();
    const el = document.getElementById(containerId);
    if (!el) return;

    const VOICES = [
      ['Brazilian Portuguese Female', '🇧🇷 Feminina (padrão)'],
      ['Brazilian Portuguese Male',   '🇧🇷 Masculina'],
      ['Portuguese Female',           '🇵🇹 Portugal'],
      ['Google português do Brasil',  'Google pt-BR'],
    ];

    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px">Voz</label>
          <select id="_vtx_voice" onchange="VTzVoice.setVoice(this.value)" style="width:100%">
            ${VOICES.map(([v,l]) => `<option value="${v}" ${p.voice===v?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px">
            Velocidade — <b id="_vtx_rate_lbl">${p.rate}</b>×
          </label>
          <input type="range" min="0.5" max="1.5" step="0.05" value="${p.rate}"
            oninput="document.getElementById('_vtx_rate_lbl').textContent=this.value;VTzVoice.setRate(this.value)"
            style="width:100%">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px">
            Tom — <b id="_vtx_pitch_lbl">${p.pitch}</b>
          </label>
          <input type="range" min="0.5" max="1.5" step="0.05" value="${p.pitch}"
            oninput="document.getElementById('_vtx_pitch_lbl').textContent=this.value;VTzVoice.setPitch(this.value)"
            style="width:100%">
        </div>
        <button onclick="VTzVoice.preview()" style="cursor:pointer;padding:8px 16px;border-radius:8px;border:none;background:#6d5efc;color:#fff;font-weight:600">
          ▶ Testar voz
        </button>
      </div>`;
  }

  /* ── API PÚBLICA ── */
  return { speak, stop, preview, setVoice, setRate, setPitch, getPrefs, renderPanel };
})();

/* Alias global para retrocompatibilidade com VTz Life */
window.speak = (text) => VTzVoice.speak(text);
