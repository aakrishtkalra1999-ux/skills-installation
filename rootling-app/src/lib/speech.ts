/**
 * Audio: native-speaker recordings where they exist, the device's text-to-speech
 * otherwise, and speech recognition for "say it" moments.
 */
import manifest from '../data/audio-manifest.json';
import type { Clip } from './clips';

const recorded = new Set<string>(manifest.files);
let current: HTMLAudioElement | null = null;

export function hasRecording(clip: Clip): boolean {
  return clip.id !== null && recorded.has(`${clip.course}/${clip.id}`);
}

/** Whether a speaker button for this clip would make a sound on this device. */
export function canPlay(clip: Clip): boolean {
  return hasRecording(clip) || canSpeak(clip.lang);
}

/** Plays the recording, falling back to the device voice if there is none or it fails to load. */
export function play(clip: Clip): void {
  current?.pause();
  current = null;
  if (!hasRecording(clip)) {
    speak(clip.text, clip.lang);
    return;
  }
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  const audio = new Audio(`/audio/${clip.course}/${clip.id}.mp3`);
  current = audio;
  audio.play().catch(() => {
    // Autoplay can be blocked before the first tap; a missing file also lands here.
    if (current === audio) speak(clip.text, clip.lang);
  });
}

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
