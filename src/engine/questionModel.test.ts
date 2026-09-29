import { describe, it, expect } from 'vitest';
import { reviewKeyOf, reviewKeyId, correctOption, labelOptions } from './questionModel';
import type { Question } from './questionModel';

const q: Question = {
  id: 'x-1', standardCode: 'NC.5.NF.1', domainId: 'NF',
  prompt: 'p', options: [
    { label: 'A', text: '5/6', isCorrect: true },
    { label: 'B', text: '3/9', isCorrect: false, misconception: 'added-denominators' },
  ],
  calculatorAllowed: false, isStretch: false, difficulty: 'mastery',
  explanation: { stepByStep: ['s'], conceptSummary: 'c' },
};

describe('reviewKeyOf', () => {
  it('drops the seed from a generated ref', () => {
    // The scheduler must match a fresh instance of the same template.
    // Keying on the seed would mean a re-served question never matched
    // its own queue entry and stayed due forever.
    expect(reviewKeyOf({ kind: 'generated', templateId: 't1', seed: 42 }))
      .toEqual({ kind: 'generated', templateId: 't1' });
  });

  it('keeps an authored id', () => {
    expect(reviewKeyOf({ kind: 'authored', id: 'nf1-01' }))
      .toEqual({ kind: 'authored', id: 'nf1-01' });
  });

  it('gives two different seeds of one template the same key id', () => {
    const a = reviewKeyId(reviewKeyOf({ kind: 'generated', templateId: 't1', seed: 1 }));
    const b = reviewKeyId(reviewKeyOf({ kind: 'generated', templateId: 't1', seed: 999 }));
    expect(a).toBe(b);
  });

  it('never collides an authored id with a template id', () => {
    expect(reviewKeyId({ kind: 'authored', id: 'same' }))
      .not.toBe(reviewKeyId({ kind: 'generated', templateId: 'same' }));
  });
});

describe('correctOption', () => {
  it('returns the option marked correct', () => {
    expect(correctOption(q).text).toBe('5/6');
  });

  it('throws when no option is correct', () => {
    const bad = { ...q, options: q.options.map((o) => ({ ...o, isCorrect: false })) };
    expect(() => correctOption(bad)).toThrow(/exactly one/i);
  });

  it('throws when more than one option is correct', () => {
    const bad = { ...q, options: q.options.map((o) => ({ ...o, isCorrect: true })) };
    expect(() => correctOption(bad)).toThrow(/exactly one/i);
  });
});

describe('labelOptions', () => {
  it('assigns A, B, C, D in order', () => {
    const out = labelOptions([
      { text: '1', isCorrect: true },
      { text: '2', isCorrect: false, misconception: 'm1' },
      { text: '3', isCorrect: false, misconception: 'm2' },
      { text: '4', isCorrect: false, misconception: 'm3' },
    ]);
    expect(out.map((o) => o.label)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('rejects an incorrect option with no misconception tag', () => {
    expect(() => labelOptions([
      { text: '1', isCorrect: true },
      { text: '2', isCorrect: false },
    ])).toThrow(/misconception/i);
  });
});
