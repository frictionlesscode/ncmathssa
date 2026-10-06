import { describe, it, expect } from 'vitest';
import { selectSession, MAX_REVIEW_FRACTION } from './sessionComposer';
import { getCurriculum } from '../curriculum/registry';
import { masteryByStandard } from './mastery';
import { recordResult } from './scheduler';
import type { ReviewQueue } from './scheduler';
import { reviewKeyId, questionRefId } from './questionModel';

const c = getCurriculum(5);
const NOW = new Date('2026-03-01T09:00:00Z');
const empty = masteryByStandard([], c);

describe('selectSession', () => {
  it('returns exactly the requested number of items', () => {
    expect(selectSession({ curriculum: c, mastery: empty, queue: {}, size: 12, now: NOW, seed: 1 }))
      .toHaveLength(12);
  });

  it('is reproducible for the same seed', () => {
    const args = { curriculum: c, mastery: empty, queue: {}, size: 10, now: NOW, seed: 42 };
    expect(selectSession(args)).toEqual(selectSession(args));
  });

  it('varies with the seed', () => {
    const base = { curriculum: c, mastery: empty, queue: {}, size: 10, now: NOW };
    expect(selectSession({ ...base, seed: 1 })).not.toEqual(selectSession({ ...base, seed: 2 }));
  });

  it('caps reviews so a bad week is not all remediation', () => {
    let queue: ReviewQueue = {};
    for (let i = 0; i < 40; i++) {
      queue = recordResult(queue, { kind: 'authored', id: `nf1-0${i % 4 + 1}` }, false,
        new Date('2026-02-01T09:00:00Z'));
    }
    const size = 10;
    const refs = selectSession({ curriculum: c, mastery: empty, queue, size, now: NOW, seed: 5 });
    const queued = new Set(Object.values(queue).map((e) => reviewKeyId(e.key)));
    const reviewCount = refs.filter((r) =>
      queued.has(r.kind === 'authored' ? `a:${r.id}` : `g:${r.templateId}`)).length;
    expect(reviewCount).toBeLessThanOrEqual(Math.ceil(size * MAX_REVIEW_FRACTION));
  });

  it('does not schedule reviews that are not yet due', () => {
    const queue = recordResult({}, { kind: 'authored', id: 'nf1-01' }, false, NOW);
    const refs = selectSession({
      curriculum: c, mastery: empty, queue, size: 8,
      now: new Date(NOW.getTime() + 3600_000), seed: 3,
    });
    // Due tomorrow; an hour later it must not have been pulled in as a review.
    const queuedId = Object.keys(queue)[0];
    const returnedIds = refs.map((r) =>
      r.kind === 'authored' ? `a:${r.id}` : `g:${r.templateId}`);
    expect(returnedIds).not.toContain(queuedId);
    expect(refs).toHaveLength(8);
  });

  it('favors the weakest standards', () => {
    const attempts = [{
      id: 'a', quizId: 'q', quizTitle: 't', completedAt: '2026-02-01T00:00:00Z',
      scoreRaw: 0, scoreTotal: 8, scorePercent: 0, isPassingSSA: false, timeElapsedSeconds: 60,
      answers: Object.fromEntries(Array.from({ length: 8 }, (_, i) => [
        `k${i}`, { questionId: `k${i}`, standardCode: 'NC.5.NBT.5', isCorrect: false, studentAnswer: 'A' },
      ])),
    }];
    const m = masteryByStandard(attempts as never, c);
    const src = c.source;
    const refs = selectSession({ curriculum: c, mastery: m, queue: {}, size: 20, now: NOW, seed: 9 });
    const codes = refs.map((r) => src.resolve(r).standardCode);
    expect(codes.filter((x) => x === 'NC.5.NBT.5').length).toBeGreaterThan(1);
  });

  it('never returns a ref the source cannot resolve', () => {
    const refs = selectSession({ curriculum: c, mastery: empty, queue: {}, size: 30, now: NOW, seed: 4 });
    for (const r of refs) expect(() => c.source.resolve(r)).not.toThrow();
  });

  it('never repeats the exact same question instance in one session (Ruling F17)', () => {
    let queue: ReviewQueue = {};
    for (let i = 0; i < 40; i++) {
      queue = recordResult(queue, { kind: 'authored', id: `nf1-0${i % 4 + 1}` }, false,
        new Date('2026-02-01T09:00:00Z'));
    }
    const refs = selectSession({ curriculum: c, mastery: empty, queue, size: 10, now: NOW, seed: 5 });
    const ids = refs.map(questionRefId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lets a single generated template contribute multiple distinct items to one session (Ruling F18/F14 fix)', () => {
    // A large session, with no reviews competing for slots, should be able
    // to draw more than one distinct seed from the same generated template
    // rather than being capped at one item per template.
    const refs = selectSession({ curriculum: c, mastery: empty, queue: {}, size: 30, now: NOW, seed: 11 });
    const generatedByTemplate = new Map<string, Set<number>>();
    for (const r of refs) {
      if (r.kind !== 'generated') continue;
      const seeds = generatedByTemplate.get(r.templateId) ?? new Set<number>();
      seeds.add(r.seed);
      generatedByTemplate.set(r.templateId, seeds);
    }
    const templatesWithMultipleSeeds = [...generatedByTemplate.values()].filter((seeds) => seeds.size > 1);
    expect(templatesWithMultipleSeeds.length).toBeGreaterThan(0);

    // But identical refs (same template AND same seed) still cannot repeat.
    const ids = refs.map(questionRefId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('selectSession with a plan', () => {
  const now = new Date('2026-09-30T12:00:00Z');
  const domainOf = (code: string) =>
    c.domains.find((d) => d.standards.some((s) => s.code === code))!.id;
  const run = (
    plan?: Parameters<typeof selectSession>[0]['plan'],
    queue: ReviewQueue = {},
    size = 12,
  ) => selectSession({ curriculum: c, mastery: empty, queue, size, now, seed: 42, plan });

  it('draws new content only from the planned domains', () => {
    const refs = run({ domains: new Set(['NF']) });
    expect(refs.length).toBeGreaterThan(0);
    for (const r of refs) expect(domainOf(c.source.resolve(r).standardCode)).toBe('NF');
  });

  it('leans toward preferred difficulties', () => {
    const all = new Set(c.domains.map((d) => d.id));
    const count = (refs: ReturnType<typeof run>) =>
      refs.filter((r) => c.source.resolve(r).difficulty === 'stretch').length;
    const preferred = count(run({ domains: all, prefer: ['stretch'] }));
    const plain = count(run({ domains: all }));
    expect(preferred).toBeGreaterThan(0);
    expect(preferred).toBeGreaterThanOrEqual(plain);
  });

  it('keeps the review cap and never repeats a question', () => {
    const size = 6;
    let queue: ReviewQueue = {};
    for (const code of c.source.allStandardsWithContent().slice(0, 12)) {
      const [ref] = c.source.itemsFor(code, { count: 1, seedBase: 1 });
      if (ref && ref.kind === 'authored') {
        queue = recordResult(queue, ref, false, new Date('2026-09-01T00:00:00Z'));
      }
    }
    const due = new Set(Object.values(queue).map((e) => reviewKeyId(e.key)));
    expect(due.size).toBeGreaterThan(Math.ceil(size * MAX_REVIEW_FRACTION));
    expect(Object.keys(queue).length).toBeGreaterThan(0);
    for (const plan of [undefined, { domains: new Set(['NF']) }]) {
      const refs = run(plan, queue, size);
      const reviews = refs.filter((r) => r.kind === 'authored' && due.has(`a:${r.id}`));
      expect(reviews.length).toBeGreaterThan(0);
      expect(reviews.length).toBeLessThanOrEqual(Math.ceil(size * MAX_REVIEW_FRACTION));
      expect(new Set(refs.map(questionRefId)).size).toBe(refs.length);
    }
  });

  it('is unchanged when no plan is given', () => {
    expect(run(undefined)).toEqual(
      selectSession({ curriculum: c, mastery: empty, queue: {}, size: 12, now, seed: 42 }),
    );
  });
});
