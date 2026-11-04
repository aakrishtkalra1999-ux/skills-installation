/** A vocabulary item. Every word has a picture so pre-readers can play. */
export interface Word {
  id: string;
  native: string;
  roman: string;
  en: string;
  emoji: string;
  /** Marks family elders a child can choose to "talk to" during onboarding. */
  elder?: boolean;
}

/**
 * A line with personalisation slots. `{gp}` is replaced by the family member the
 * child talks to (in the course's script, or romanised in `roman`/`en`), and
 * `{name}` by the child's name.
 */
export interface Line {
  native: string;
  roman: string;
  en: string;
}

/** A "Tap and say it" moment: a little scene, then the child says the line out loud. */
export interface SayPrompt {
  scene: string;
  line: Line;
  /** Unlocks a parent milestone the first time it is said. */
  milestone?: 'hello' | 'sentence';
}

/** A sentence split into tiles, for children who can read (6+). */
export interface Sentence {
  native: string[];
  roman: string;
  en: string[];
}

export interface Lesson {
  id: string;
  title: string;
  words: string[];
  say?: SayPrompt[];
  sentences?: Sentence[];
}

export type Topic = 'family' | 'food' | 'animals' | 'colours' | 'numbers';

export interface Unit {
  id: string;
  title: string;
  description: string;
  topic: Topic;
  lessons: Lesson[];
}

export interface StoryPage {
  speaker: 'child' | 'gp';
  line: Line;
  emoji: string;
}

export interface Story {
  id: string;
  title: string;
  cover: string;
  pages: StoryPage[];
}

export interface Course {
  code: string;
  name: string;
  nativeName: string;
  /** BCP-47 tag used for text-to-speech and speech recognition. */
  ttsLang: string;
  status: 'launch' | 'preview';
  words: Word[];
  units: Unit[];
  stories: Story[];
}
