/** Text-to-speech via the browser. Indian-language voices exist on most Android and many desktop systems. */

function voiceFor(lang: string): SpeechSynthesisVoice | undefined {
  if (typeof speechSynthesis === 'undefined') return undefined;
  const base = lang.split('-')[0];
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(base));
}

export function canSpeak(lang: string): boolean {
  return voiceFor(lang) !== undefined;
}

export function speak(text: string, lang: string, rate = 0.85): void {
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
