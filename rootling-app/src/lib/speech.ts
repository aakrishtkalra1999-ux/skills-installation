/** Audio through the browser: text-to-speech for every word, and speech recognition for "say it" moments. */

function voiceFor(lang: string): SpeechSynthesisVoice | undefined {
  if (typeof speechSynthesis === 'undefined') return undefined;
  const base = lang.split('-')[0];
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(base));
}

export function canSpeak(lang: string): boolean {
  return voiceFor(lang) !== undefined;
}

export function speak(text: string, lang: string, rate = 0.8): void {
  const voice = voiceFor(lang);
  if (!voice) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = rate;
  speechSynthesis.speak(u);
}

/** Voices load asynchronously in Chrome; call back once they are ready. */
export function onVoicesReady(cb: () => void): () => void {
  if (typeof speechSynthesis === 'undefined') return () => {};
  speechSynthesis.addEventListener('voiceschanged', cb);
  return () => speechSynthesis.removeEventListener('voiceschanged', cb);
}

type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function recognitionCtor(): (new () => Recognition) | undefined {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function canListenToChild(): boolean {
  return typeof window !== 'undefined' && recognitionCtor() !== undefined;
}

/**
 * Listens for one phrase. Resolves with what was heard, or null if nothing was.
 * Young children's pronunciation varies a lot, so callers treat any speech as a
 * good try rather than grading it.
 */
export function listenOnce(lang: string, timeoutMs = 6000): Promise<string | null> {
  const Ctor = recognitionCtor();
  if (!Ctor) return Promise.resolve(null);
  return new Promise((resolve) => {
    const rec = new Ctor();
    let heard: string | null = null;
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      heard = e.results[0]?.[0]?.transcript ?? null;
    };
    rec.onerror = () => {};
    const timer = setTimeout(() => rec.stop(), timeoutMs);
    rec.onend = () => {
      clearTimeout(timer);
      resolve(heard);
    };
    try {
      rec.start();
    } catch {
      resolve(null);
    }
  });
}
