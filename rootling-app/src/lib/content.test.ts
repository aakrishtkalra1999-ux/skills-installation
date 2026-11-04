import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COURSES } from '../data/courses';
import { contentRows, reviewCsv } from './clips';

describe('native-speaker review sheet and recordings', () => {
  it('content/review.csv matches the courses (run `npm run content:export` after editing content)', () => {
    const file = readFileSync(new URL('../../content/review.csv', import.meta.url), 'utf8').replace(/^﻿/, '');
    expect(file).toBe(reviewCsv(COURSES));
  });

  for (const course of COURSES) {
    it(`${course.name}: every recording has a unique file name`, () => {
      const files = contentRows(course)
        .map((r) => r.audioFile)
        .filter((f) => f.startsWith('audio/'));
      expect(new Set(files).size).toBe(files.length);
      for (const f of files) expect(f).toMatch(new RegExp(`^audio/${course.code}/[a-z0-9-]+\\.mp3$`));
    });
  }

  it('records lines with a family member once per family member', () => {
    const tamil = COURSES.find((c) => c.code === 'ta')!;
    const hello = contentRows(tamil).filter((r) => r.id.startsWith('ta-u1-l1-say1'));
    expect(hello.map((r) => r.id)).toEqual(['ta-u1-l1-say1-paati', 'ta-u1-l1-say1-thaatha']);
    expect(hello[0].script).toBe('வணக்கம், பாட்டி!');
  });
});

describe('child safety', () => {
  it('loads no third-party scripts, styles or fonts', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
    expect(html).not.toMatch(/(src|href)="https?:\/\//);
  });
});
