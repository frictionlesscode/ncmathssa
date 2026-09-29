import { describe, it, expect } from 'vitest';
import type { Question } from '../engine/questionModel';
import type { DomainInfo } from './types';
import {
  assertAuthoredBankSound,
  assertGradeOneReadable,
  assertGradeTwoReadable,
  GRADE_1_G_VOCAB_ALLOWLIST,
  GRADE_2_VOCAB_ALLOWLIST,
} from './authoredBank.testkit';

/**
 * Negative controls for the shared kit.
 *
 * Twenty-one authored banks are checked by `assertAuthoredBankSound` and
 * nothing checked the checker. A guard that silently stops firing looks
 * exactly like a bank that has no problems - which is how the numeric
 * equivalence guard went missing from the kit in the first place and was only
 * noticed by a human reading two test files side by side.
 *
 * Each test below breaks exactly one invariant and asserts the kit catches it.
 */

const DOMAIN: DomainInfo = {
  id: 'OA',
  name: 'Operations & Algebraic Thinking',
  shortName: 'Operations',
  officialWeightRange: '14–18%',
  officialWeightMidpoint: 16,
  description: 'Fixture.',
  color: 'violet',
  badgeBg: 'bg-violet-100 text-violet-800 border-violet-300',
  standards: [
    {
      code: 'NC.4.OA.1',
      domainId: 'OA',
      title: 'Fixture',
      description: 'Fixture.',
      weightCategory: 'Core (OA band 14–18%)',
      keyConcepts: ['Fixture'],
    },
  ],
};

/** A sound three-item bank. Each test below mutates one copy of it.
 *
 *  The key rotates A, B, C across the three items: the kit rejects a bank that
 *  keys everything at one label, and it rejected this fixture until it did. */
function soundBank(): Question[] {
  const LABELS = ['A', 'B', 'C', 'D'];
  return [0, 1, 2].map((i) => {
    const n = i + 2;
    const answer = `${n * 3}`;
    const wrong = [
      { text: `${n + 3}`, misconception: 'added-instead-of-multiplied' },
      { text: `${n * 4}`, misconception: 'added-carry-before-multiplying' },
      { text: `${n * 3 + 10}`, misconception: 'added-carry-before-multiplying' },
    ];
    const texts: { text: string; isCorrect: boolean; misconception?: string }[] = [...wrong.map(
      (w) => ({ text: w.text, isCorrect: false, misconception: w.misconception }),
    )];
    texts.splice(i, 0, { text: answer, isCorrect: true });
    return {
      id: `fx-0${i}`,
      standardCode: 'NC.4.OA.1',
      domainId: 'OA',
      prompt: `What is ${n} times 3?`,
      options: texts.map((t, k) => ({ ...t, label: LABELS[k] })),
      calculatorAllowed: false,
      isStretch: false,
      difficulty: (i === 0 ? 'mastery' : 'advanced') as Question['difficulty'],
      explanation: {
        stepByStep: ['Multiply.', `The answer is ${answer}.`],
        conceptSummary: 'Fixture.',
      },
    };
  });
}

function expectCaught(mutate: (bank: Question[]) => void, hint: RegExp) {
  const bank = soundBank();
  mutate(bank);
  let message = '';
  try {
    assertAuthoredBankSound(bank, DOMAIN);
  } catch (e) {
    message = e instanceof Error ? e.message : String(e);
  }
  expect(message, 'the kit did not reject this bank at all').not.toBe('');
  expect(message).toMatch(hint);
}

describe('assertAuthoredBankSound rejects', () => {
  it('accepts the sound fixture, so the failures below mean something', () => {
    expect(() => assertAuthoredBankSound(soundBank(), DOMAIN)).not.toThrow();
  });

  it('two options naming the same quantity by different text', () => {
    // The guard the kit was shipped without. "6" and "6.0" are one answer.
    expectCaught((b) => {
      b[0].options[1].text = `${Number(b[0].options[0].text).toFixed(1)}`;
    }, /both equal/);
  });

  it('an untagged wrong option', () => {
    expectCaught((b) => {
      delete b[0].options[1].misconception;
    }, /misconception tag/);
  });

  it('a misconception tag nothing declares', () => {
    expectCaught((b) => {
      b[0].options[1].misconception = 'no-such-tag-exists-anywhere';
    }, /undeclared tag/);
  });

  it('a worked solution whose last step never states the answer', () => {
    expectCaught((b) => {
      b[0].explanation.stepByStep = ['Multiply.', 'Then stop short.'];
    }, /never states the answer/);
  });

  it('an empty prompt', () => {
    expectCaught((b) => {
      b[0].prompt = '   ';
    }, /empty prompt/);
  });

  it('isStretch disagreeing with difficulty', () => {
    expectCaught((b) => {
      b[0].isStretch = true;
    }, /disagrees with difficulty/);
  });

  it('a standard left below its item floor', () => {
    expectCaught((b) => {
      b.pop();
      b.pop();
    }, /needs 3/);
  });

  it('two options with identical text', () => {
    expectCaught((b) => {
      b[0].options[1].text = b[0].options[2].text;
    }, /duplicate option text|both equal/);
  });

  it('duplicate item ids', () => {
    expectCaught((b) => {
      b[1].id = b[0].id;
    }, /duplicate item ids/);
  });

  it('an item belonging to another domain', () => {
    expectCaught((b) => {
      b[0].standardCode = 'NC.4.NBT.1';
    }, /is not a OA standard/);
  });

  it('more than one correct option', () => {
    expectCaught((b) => {
      b[0].options[1].isCorrect = true;
    }, /correct count/);
  });

  it('a bank with no item above mastery level', () => {
    expectCaught((b) => {
      for (const q of b) q.difficulty = 'mastery';
    }, /no items above mastery/);
  });
});

describe('assertAuthoredBankSound rejects an unbalanced answer key', () => {
  /** Twelve items, every key at A. */
  function allAtA(): Question[] {
    return Array.from({ length: 12 }, (_, i) => ({
      ...soundBank()[0],
      id: `fx-a${i}`,
      prompt: `What is ${i + 2} times 3?`,
      options: [
        { label: 'A', text: `${(i + 2) * 3}`, isCorrect: true },
        { label: 'B', text: `${i + 5}`, isCorrect: false, misconception: 'added-instead-of-multiplied' },
        { label: 'C', text: `${(i + 2) * 4}`, isCorrect: false, misconception: 'added-carry-before-multiplying' },
        { label: 'D', text: `${(i + 2) * 7}`, isCorrect: false, misconception: 'added-carry-before-multiplying' },
      ],
      difficulty: i === 0 ? ('mastery' as const) : ('advanced' as const),
      explanation: {
        stepByStep: ['Multiply.', `The answer is ${(i + 2) * 3}.`],
        conceptSummary: 'Fixture.',
      },
    }));
  }

  it('catches a bank whose key never moves', () => {
    let message = '';
    try {
      assertAuthoredBankSound(allAtA(), DOMAIN, { itemsPerStandard: 1 });
    } catch (e) {
      message = e instanceof Error ? e.message : String(e);
    }
    expect(message, 'twelve keys at A was accepted').not.toBe('');
    expect(message).toMatch(/only ever at|more than half/);
  });
});

describe('assertGradeOneReadable', () => {
  function caught(items: { id: string; prompt: string }[]): string {
    try {
      assertGradeOneReadable(items);
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
    return '';
  }

  it('accepts a short setup-and-question word problem', () => {
    expect(caught([{ id: 'ok', prompt: 'Mia has 8 red beads and 5 blue beads. How many beads in all?' }])).toBe('');
  });

  it('accepts a prompt of exactly 89 characters, and a 10-letter word', () => {
    const prompt = `Everything here is fine. ${'a '.repeat(30)}okay`;
    expect(prompt.length).toBe(89);
    expect(caught([{ id: 'edge', prompt }])).toBe('');
  });

  it('rejects a prompt of 90 characters', () => {
    const prompt = `Everything here is fine. ${'a '.repeat(30)}okay?`;
    expect(prompt.length).toBe(90);
    expect(caught([{ id: 'long', prompt }])).toMatch(/long: prompt is 90 characters/);
  });

  it('rejects a third sentence', () => {
    expect(caught([{ id: 'three', prompt: 'Sam had 9 cars. He lost some. How many are left?' }])).toMatch(
      /three: prompt has 3 sentences/,
    );
  });

  it('rejects a word longer than 10 letters', () => {
    expect(caught([{ id: 'word', prompt: 'Which associative rule helps?' }])).toMatch(
      /word: prompt uses words longer than 10 letters: associative/,
    );
  });

  // The Grade 1 Geometry allowlist exempts named words, never the cap itself.
  it('accepts an allowlisted long word', () => {
    function caughtWithAllowlist(items: { id: string; prompt: string }[]): string {
      try {
        assertGradeOneReadable(items, { allowlist: GRADE_1_G_VOCAB_ALLOWLIST });
      } catch (e) {
        return e instanceof Error ? e.message : String(e);
      }
      return '';
    }
    expect(caughtWithAllowlist([{ id: 'allowed', prompt: 'Which shape shows a rectangular prism?' }])).toBe('');
  });

  it('still rejects a DIFFERENT long word even with the allowlist supplied', () => {
    function caughtWithAllowlist(items: { id: string; prompt: string }[]): string {
      try {
        assertGradeOneReadable(items, { allowlist: GRADE_1_G_VOCAB_ALLOWLIST });
      } catch (e) {
        return e instanceof Error ? e.message : String(e);
      }
      return '';
    }
    expect(caughtWithAllowlist([{ id: 'still-caught', prompt: 'Which associative rule helps?' }])).toMatch(
      /still-caught: prompt uses words longer than 10 letters: associative/,
    );
  });
});

describe('assertGradeTwoReadable', () => {
  function caught(items: { id: string; prompt: string }[]): string {
    try {
      assertGradeTwoReadable(items);
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
    return '';
  }

  it('accepts a short one-step word problem', () => {
    expect(
      caught([{ id: 'ok', prompt: 'Mia has 8 red beads and 5 blue beads. How many beads in all?' }]),
    ).toBe('');
  });

  it('accepts a two-step problem told in three short sentences (NC.2.OA.1)', () => {
    expect(
      caught([
        {
          id: 'two-step',
          prompt:
            'Ana had 9 crayons, lost some, then got 4 more, ending with 8. In 9 − ☐ + 4 = 8, how many did Ana lose?',
        },
      ]),
    ).toBe('');
  });

  it('accepts a prompt of exactly 160 characters', () => {
    const prompt = `${'ok '.repeat(52)}end.`;
    expect(prompt.length).toBe(160);
    expect(caught([{ id: 'edge', prompt }])).toBe('');
  });

  it('rejects a prompt of 161 characters', () => {
    const prompt = `${'ok '.repeat(52)}ends.`;
    expect(prompt.length).toBe(161);
    expect(caught([{ id: 'long', prompt }])).toMatch(/long: prompt is 161 characters/);
  });

  it('rejects a fourth sentence', () => {
    expect(
      caught([
        {
          id: 'four',
          prompt: 'Sam had 9 cars. He gave 2 away. Then he found 1. How many does he have now?',
        },
      ]),
    ).toMatch(/four: prompt has 4 sentences/);
  });

  it('rejects a word longer than 10 letters', () => {
    expect(caught([{ id: 'word', prompt: 'Which associative rule helps?' }])).toMatch(
      /word: prompt uses words longer than 10 letters: associative/,
    );
  });

  // The Grade 2 vocabulary allowlist exempts named words sourced from
  // grade2/standards.ts, never the cap itself.
  it('accepts allowlisted long words', () => {
    function caughtWithAllowlist(items: { id: string; prompt: string }[]): string {
      try {
        assertGradeTwoReadable(items, { allowlist: GRADE_2_VOCAB_ALLOWLIST });
      } catch (e) {
        return e instanceof Error ? e.message : String(e);
      }
      return '';
    }
    expect(
      caughtWithAllowlist([{ id: 'allowed', prompt: 'Which shape is a rectangular prism, not a quadrilateral?' }]),
    ).toBe('');
  });

  it('still rejects a DIFFERENT long word even with the allowlist supplied', () => {
    function caughtWithAllowlist(items: { id: string; prompt: string }[]): string {
      try {
        assertGradeTwoReadable(items, { allowlist: GRADE_2_VOCAB_ALLOWLIST });
      } catch (e) {
        return e instanceof Error ? e.message : String(e);
      }
      return '';
    }
    expect(caughtWithAllowlist([{ id: 'still-caught', prompt: 'Which associative rule helps?' }])).toMatch(
      /still-caught: prompt uses words longer than 10 letters: associative/,
    );
  });
});
