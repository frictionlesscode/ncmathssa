import { describe, it, expect } from 'vitest';
import type { Question } from '../engine/questionModel';
import type { DomainInfo } from './types';
import { assertAuthoredBankSound } from './authoredBank.testkit';

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
