import type { Course, Line, Word } from '../data/types';

/**
 * A sound the app can play: a native-speaker recording when one exists at
 * public/audio/<course>/<id>.mp3, otherwise the device's text-to-speech voice.
 * `id` is null for lines that include the child's name, which can't be pre-recorded.
 */
export interface Clip {
  course: string;
  id: string | null;
  text: string;
  lang: string;
}

const NAME = '{name}';
const GP = '{gp}';

/** The recording id for a line, given the elder the child chose (lines mentioning {gp} are recorded once per elder). */
function lineId(base: string, line: Line, elder: Word): string | null {
  if (line.native.includes(NAME)) return null;
  return line.native.includes(GP) ? `${base}-${elder.id}` : base;
}

export function wordClip(course: Course, word: Word): Clip {
  return { course: course.code, id: word.id, text: word.native, lang: course.ttsLang };
}

/** `index` is 1-based so file names read naturally (…-say1.mp3). */
export const sayId = (lessonId: string, index: number) => `${lessonId}-say${index}`;
export const sentenceId = (lessonId: string, index: number) => `${lessonId}-sentence${index}`;
export const storyPageId = (storyId: string, page: number) => `${storyId}-p${page}`;

export function lineClip(course: Course, base: string, rawLine: Line, elder: Word, filledNative: string): Clip {
  return { course: course.code, id: lineId(base, rawLine, elder), text: filledNative, lang: course.ttsLang };
}

/** One row per thing a native speaker should check, and per audio file a voice artist should record. */
export interface ContentRow {
  language: string;
  id: string;
  script: string;
  romanised: string;
  english: string;
  whereUsed: string;
  /** Path under public/, or an explanation when the line can't be recorded. */
  audioFile: string;
}

const fill = (text: string, gp: string) => text.replaceAll(GP, gp);

function lineRows(course: Course, base: string, line: Line, whereUsed: string): ContentRow[] {
  const elders = course.words.filter((w) => w.elder);
  const variants = line.native.includes(GP) && !line.native.includes(NAME) ? elders : [null];
  return variants.map((elder) => {
    const id = elder ? `${base}-${elder.id}` : base;
    return {
      language: course.name,
      id,
      script: elder ? fill(line.native, elder.native) : line.native,
      romanised: elder ? fill(line.roman, elder.roman) : line.roman,
      english: elder ? fill(line.en, elder.roman) : line.en,
      whereUsed,
      audioFile: line.native.includes(NAME)
        ? 'not recorded: includes the child’s name, so the device voice reads it'
        : `audio/${course.code}/${id}.mp3`,
    };
  });
}

/** Every word, say-it line, sentence and story line in a course, in the order a child meets them. */
export function contentRows(course: Course): ContentRow[] {
  const rows: ContentRow[] = course.words.map((w) => ({
    language: course.name,
    id: w.id,
    script: w.native,
    romanised: w.roman,
    english: w.en,
    whereUsed: `word${w.elder ? ' (family member the child can choose)' : ''}`,
    audioFile: `audio/${course.code}/${w.id}.mp3`,
  }));
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      (lesson.say ?? []).forEach((say, i) => {
        rows.push(...lineRows(course, sayId(lesson.id, i + 1), say.line, `lesson "${lesson.title}" (${lesson.id}), Tap and say it`));
      });
      (lesson.sentences ?? []).forEach((s, i) => {
        rows.push(
          ...lineRows(
            course,
            sentenceId(lesson.id, i + 1),
            { native: s.native.join(' '), roman: s.roman, en: s.en.join(' ') },
            `lesson "${lesson.title}" (${lesson.id}), sentence building (age 6+)`,
          ),
        );
      });
    }
  }
  for (const story of course.stories) {
    story.pages.forEach((page, i) => {
      const who = page.speaker === 'gp' ? 'family member speaks' : 'child speaks';
      rows.push(...lineRows(course, storyPageId(story.id, i + 1), page.line, `story "${story.title}" (${story.id}) page ${i + 1}, ${who}`));
    });
  }
  return rows;
}

const CSV_HEADER = ['language', 'id', 'script', 'romanised', 'english', 'where_used', 'audio_file', 'reviewed_ok', 'reviewer_notes'];

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

/** The review sheet for native speakers. The last two columns are left empty for them to fill in. */
export function reviewCsv(courses: Course[]): string {
  const lines = [CSV_HEADER.join(',')];
  for (const course of courses) {
    for (const r of contentRows(course)) {
      lines.push([r.language, r.id, r.script, r.romanised, r.english, r.whereUsed, r.audioFile, '', ''].map(csvCell).join(','));
    }
  }
  return lines.join('\n') + '\n';
}
