/** A vocabulary item or a script letter. */
export interface Word {
  id: string;
  native: string;
  roman: string;
  en: string;
  emoji?: string;
  /** Letters are asked as "what sound does this make?" instead of "what does this mean?". */
  kind?: 'word' | 'letter';
}

/** A sentence split into tiles, used by the sentence-building exercise. */
export interface Sentence {
  native: string[];
  roman: string;
  en: string[];
}

export interface Lesson {
  id: string;
  title: string;
  words: string[];
  sentences: Sentence[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  code: string;
  name: string;
  nativeName: string;
  /** BCP-47 tag used to pick a text-to-speech voice. */
  ttsLang: string;
  speakers: string;
  words: Word[];
  units: Unit[];
}
