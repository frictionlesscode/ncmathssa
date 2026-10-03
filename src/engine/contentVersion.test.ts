import { describe, it, expect } from 'vitest';
import { getCurriculum } from '../curriculum/registry';
import type { GradeCurriculum } from '../curriculum/types';
import type { QuizAttempt, QuizAttemptAnswer } from '../types';
import { contentVersionOf, correctOption, labelOptions, type Question } from './questionModel';
import { makeQuestionSource } from './questionSource';
import { realize, type QuestionTemplate } from './template';
import { makeRng } from './rng';
import { isCurrentAnswer, masteryByStandard } from './mastery';
import {
  newSession, recordAnswer, resolveSession, sessionToAttempt, stampContentVersions,
} from './activeSession';

const base = getCurriculum(5);
const CODE = 'NC.5.NF.1';

function item(id: string, contentVersion?: number): Question {
  return {
    id, standardCode: CODE, domainId: 'NF', prompt: `prompt ${id}`,
    options: labelOptions([
      { text: 'right', isCorrect: true },
      { text: 'wrong', isCorrect: false, misconception: 'added-denominators' },
    ]),
    calculatorAllowed: false, isStretch: false, difficulty: 'mastery',
    explanation: { stepByStep: ['s'], conceptSummary: 'c' },
    ...(contentVersion === undefined ? {} : { contentVersion }),
  };
}

const template = (contentVersion?: number): QuestionTemplate => ({
  id: 't.cv', standardCode: CODE, domainId: 'NF', difficulty: 'mastery',
  calculatorAllowed: false, isStretch: false,
  ...(contentVersion === undefined ? {} : { contentVersion }),
  generate: () => ({
    prompt: 'p', options: labelOptions([
      { text: '1', isCorrect: true }, { text: '2', isCorrect: false, misconception: 'added-denominators' },
    ]),
    explanation: { stepByStep: ['s'], conceptSummary: 'c' }, answerText: '1',
  }),
});

/** Grade 5 with a bank of two authored items (one rewritten to v2) and one v2 template. */
function curriculumWith(authored: Question[], t: QuestionTemplate[] = []): GradeCurriculum {
  return { ...base, source: makeQuestionSource(authored, t) };
}

const answer = (questionId: string, isCorrect: boolean, contentVersion?: number): QuizAttemptAnswer => ({
  questionId, studentAnswer: 'A', isCorrect, standardCode: CODE,
  ...(contentVersion === undefined ? {} : { contentVersion }),
});

const attemptOf = (...answers: QuizAttemptAnswer[]): QuizAttempt => ({
  id: 'a1', quizId: 'q', quizTitle: 't', completedAt: '2026-09-30T12:00:00.000Z',
  scoreRaw: 0, scoreTotal: answers.length, scorePercent: 0, isPassingSSA: false, timeElapsedSeconds: 1,
  answers: Object.fromEntries(answers.map((a) => [a.questionId, a])),
});

describe('contentVersionOf (spec 3.3)', () => {
  it('defaults to 1 and rejects nonsense', () => {
    expect(contentVersionOf({})).toBe(1);
    expect(contentVersionOf({ contentVersion: 3 })).toBe(3);
    expect(contentVersionOf({ contentVersion: 0 })).toBe(1);
    expect(contentVersionOf({ contentVersion: 1.5 })).toBe(1);
    expect(contentVersionOf({ contentVersion: Number.NaN })).toBe(1);
  });
});

describe('QuestionSource.versionOf', () => {
  const c = curriculumWith([item('old'), item('new', 2)], [template(3)]);
  it('reads an authored item, a template and an unknown id', () => {
    expect(c.source.versionOf({ kind: 'authored', id: 'old' })).toBe(1);
    expect(c.source.versionOf({ kind: 'authored', id: 'new' })).toBe(2);
    expect(c.source.versionOf({ kind: 'generated', templateId: 't.cv', seed: 9 })).toBe(3);
    expect(c.source.versionOf({ kind: 'authored', id: 'gone' })).toBeUndefined();
    expect(c.source.versionOf({ kind: 'generated', templateId: 'gone', seed: 1 })).toBeUndefined();
  });

  it('realize carries a template version onto the question and omits the default', () => {
    expect(realize(template(3), 1, makeRng(1)).contentVersion).toBe(3);
    expect('contentVersion' in realize(template(), 1, makeRng(1))).toBe(false);
    expect('contentVersion' in realize(template(1), 1, makeRng(1))).toBe(false);
  });
});

describe('masteryByStandard ignores answers recorded against an older version', () => {
  const c = curriculumWith([item('old'), item('new', 2)], [template(3)]);
  const total = (attempts: QuizAttempt[]) => masteryByStandard(attempts, c).get(CODE)!;

  it('drops a v1 answer to a question that is now v2, and keeps a matching v2 answer', () => {
    expect(total([attemptOf(answer('new', false, 1))]).total).toBe(0);
    const kept = total([attemptOf(answer('new', true, 2))]);
    expect(kept.total).toBe(1);
    expect(kept.correct).toBe(1);
  });

  it('treats an old stored answer with no version as version 1', () => {
    expect(total([attemptOf(answer('new', true))]).total).toBe(0); // question is v2 now
    expect(total([attemptOf(answer('old', true))]).total).toBe(1); // question is still v1
  });

  it('applies to generated ids through the template version', () => {
    expect(total([attemptOf(answer('t.cv#7', true, 1))]).total).toBe(0);
    expect(total([attemptOf(answer('t.cv#7', true, 3))]).total).toBe(1);
  });

  it('keeps an answer whose id the source no longer knows', () => {
    expect(isCurrentAnswer({ questionId: 'gone', contentVersion: 1 }, c)).toBe(true);
    // a malformed stored id must not throw in parseQuestionRef
    expect(isCurrentAnswer({ questionId: 42 as unknown as string }, c)).toBe(true);
    expect(total([attemptOf(answer('gone', true))]).total).toBe(1);
  });

  it('does not mutate the stored attempts, so history can still list stale answers', () => {
    const attempts = [attemptOf(answer('new', true, 1))];
    total(attempts);
    expect(Object.keys(attempts[0].answers)).toEqual(['new']);
  });

  it('coexists with an origin flag on the answer (Plan A shape)', () => {
    const withOrigin = { ...answer('old', true, 1), origin: 'review' } as QuizAttemptAnswer;
    expect(total([attemptOf(withOrigin)]).total).toBe(1);
  });
});

describe('sessions record and check content versions', () => {
  const refsOf = (...ids: string[]) => ids.map((id) => ({ kind: 'authored' as const, id }));
  const started = (c: GradeCurriculum, ...ids: string[]) =>
    stampContentVersions(
      newSession({ kind: 'practice', quizId: 'p', title: 't', refs: refsOf(...ids), now: new Date() }),
      c,
    );

  it('stamps the version of every question when a session starts', () => {
    const c = curriculumWith([item('old'), item('new', 2)]);
    expect(started(c, 'old', 'new').versions).toEqual({ old: 1, new: 2 });
  });

  it('resumes a session whose questions are unchanged', () => {
    const c = curriculumWith([item('old'), item('new', 2)]);
    expect(resolveSession(started(c, 'old', 'new'), c).map((q) => q.id)).toEqual(['old', 'new']);
  });

  it('cannot resume a session once one of its questions was rewritten', () => {
    const before = curriculumWith([item('a'), item('b')]);
    const s = started(before, 'a', 'b');
    const after = curriculumWith([item('a'), item('b', 2)]);
    expect(resolveSession(s, after)).toEqual([]);
  });

  it('treats a saved session with no versions as version 1 everywhere', () => {
    const legacy = newSession({ kind: 'practice', quizId: 'p', title: 't', refs: refsOf('a', 'b'), now: new Date() });
    expect(legacy.versions).toBeUndefined();
    expect(resolveSession(legacy, curriculumWith([item('a'), item('b')]))).toHaveLength(2);
    expect(resolveSession(legacy, curriculumWith([item('a'), item('b', 2)]))).toEqual([]);
  });

  // Review Focus 2: a stored blob edited by hand, or written by another build.
  it('does not crash on a malformed versions value', () => {
    const c = curriculumWith([item('a'), item('b')]);
    const s = newSession({ kind: 'practice', quizId: 'p', title: 't', refs: refsOf('a', 'b'), now: new Date() });
    for (const versions of ['oops', 7, null, [], { a: 'x' }, { a: -3 }]) {
      const bad = { ...s, versions } as unknown as typeof s;
      expect(() => resolveSession(bad, c)).not.toThrow();
    }
    // A string, number, null or array carries no version for any question, so
    // every question counts as version 1 and the session resumes.
    for (const versions of ['oops', 7, null, []]) {
      expect(resolveSession({ ...s, versions } as unknown as typeof s, c)).toHaveLength(2);
    }
    // A version that is not 1 for a question that is 1 is stale.
    expect(resolveSession({ ...s, versions: { a: 'x' } } as unknown as typeof s, c)).toEqual([]);
  });

  it('still skips a ref that no longer resolves, without calling the session stale', () => {
    const c = curriculumWith([item('a')]);
    expect(resolveSession(started(c, 'a', 'gone'), c).map((q) => q.id)).toEqual(['a']);
  });

  it('records the version on each graded answer', () => {
    const c = curriculumWith([item('a'), item('b', 2)]);
    const s0 = started(c, 'a', 'b');
    const [qa, qb] = resolveSession(s0, c);
    const s = recordAnswer(recordAnswer(s0, qa, correctOption(qa).label), qb, correctOption(qb).label);
    const attempt = sessionToAttempt(s, [qa, qb], 80, new Date(), { answeredOnly: false });
    expect(attempt.answers.a.contentVersion).toBe(1);
    expect(attempt.answers.b.contentVersion).toBe(2);
    // and the mastery reader accepts what the grader wrote
    expect(masteryByStandard([attempt], c).get(CODE)!.total).toBe(2);
  });
});
