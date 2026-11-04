import type { Course, Line, Topic, Unit, Word } from '../data/types';

export interface ChildProfile {
  name: string;
  age: number;
  favourites: Topic[];
}

/** The elder the child talks to in this course, defaulting to the first one listed. */
export function elderFor(course: Course, elderId: string | undefined): Word {
  const elders = course.words.filter((w) => w.elder);
  return elders.find((w) => w.id === elderId) ?? elders[0];
}

export function fillText(text: string, name: string, gp: string): string {
  return text.replaceAll('{name}', name).replaceAll('{gp}', gp);
}

/** Fills `{name}` and `{gp}` in every form of a line: the elder in script for `native`, romanised elsewhere. */
export function personaliseLine(line: Line, name: string, elder: Word): Line {
  return {
    native: fillText(line.native, name, elder.native),
    roman: fillText(line.roman, name, elder.roman),
    en: fillText(line.en, name, elder.roman),
  };
}

/** Units in path order: the first unit stays first, then the child's favourite topics come forward. */
export function orderedUnits(course: Course, favourites: Topic[]): Unit[] {
  const [first, ...rest] = course.units;
  const liked = rest.filter((u) => favourites.includes(u.topic));
  const others = rest.filter((u) => !favourites.includes(u.topic));
  return [first, ...liked, ...others];
}

/** Children younger than this get picture-and-audio exercises only, no reading. */
export const READING_AGE = 6;
