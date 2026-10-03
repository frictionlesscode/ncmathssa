import { describe, it, expect } from 'vitest';
import { assertAuthoredBankSound, numericValue } from '../authoredBank.testkit';
import { GRADE_3_DOMAINS } from './standards';
import { GRADE_3_G_AUTHORED } from './authored.g';

const g = GRADE_3_DOMAINS.find((d) => d.id === 'G')!;

function textOf(q: (typeof GRADE_3_G_AUTHORED)[number]): string {
  return [
    q.prompt,
    q.promptDetails ?? '',
    ...q.options.map((o) => o.text),
    ...q.explanation.stepByStep,
    q.explanation.conceptSummary,
    q.explanation.commonMisconception ?? '',
  ].join(' ');
}

describe('grade 3 G authored bank', () => {
  it('holds every authored-bank invariant', () => {
    assertAuthoredBankSound(GRADE_3_G_AUTHORED, g);
  });

  it('names every item g3-g<tail>-NN', () => {
    for (const q of GRADE_3_G_AUTHORED) {
      expect(q.id, `${q.id} is not a g3- hyphenated id`).toMatch(/^g3-g\d-\d{2}$/);
    }
  });

  // Geometry is a ONE-STANDARD domain carrying half of a 23–27% band with
  // Measurement & Data, so three items is a floor and not a target.
  it('carries more than the bare floor', () => {
    expect(GRADE_3_G_AUTHORED.length).toBeGreaterThanOrEqual(5);
  });

  it('leaves no item half-guarded against two options naming one quantity', () => {
    for (const q of GRADE_3_G_AUTHORED) {
      const numeric = q.options.filter((o) => numericValue(o.text) !== null).length;
      expect(
        numeric === 0 || numeric === 4,
        `${q.id}: ${numeric} of 4 options parse as quantities, so the rest are compared by text only`,
      ).toBe(true);
    }
  });

  // ── Ruling 14-3 ──────────────────────────────────────────────────────────
  // NC.3.G.1 is composing and decomposing triangles and quadrilaterals, and
  // examples/non-examples of the named quadrilaterals. Partitioning a shape
  // into equal parts and naming each part a half, a third or a quarter is
  // CCSS 3.G.A.2, which NC has at NO grade in this plan's range and certainly
  // not in Grade 3 Geometry. Geometry has ONE standard, so a single
  // off-standard item is a third of the domain — on-code, and green.
  it('partitions no shape into fractional parts', () => {
    for (const q of GRADE_3_G_AUTHORED) {
      const t = textOf(q);
      expect(
        /\b(one[- ]fourth|a fourth of|quarters?|one[- ]third|a third of|one[- ]half of|partition)\b/i.test(
          t,
        ),
        `${q.id} names a fractional part of a shape — that is CCSS 3.G.A.2, not NC.3.G.1`,
      ).toBe(false);
      expect(/\d+\s*\/\s*\d+/.test(t), `${q.id} writes a fraction; NC.3.G.1 has none`).toBe(false);
    }
  });

  // Both of NC.3.G.1's keyConcepts, not just the vocabulary one.
  it('covers composing and decomposing as well as naming quadrilaterals', () => {
    const blob = GRADE_3_G_AUTHORED.map((q) => textOf(q));
    expect(
      blob.some((t) => /slides them together|puts .* together|join/i.test(t)),
      'no composing item',
    ).toBe(true);
    expect(blob.some((t) => /\bcuts?\b/i.test(t)), 'no decomposing item').toBe(true);
    expect(
      blob.some((t) => /\btrapezoid\b/i.test(t)),
      'no trapezoid item, and NC names trapezoids in the standard',
    ).toBe(true);
    expect(blob.some((t) => /\brhombus|rhombuses\b/i.test(t)), 'no rhombus item').toBe(true);
    expect(blob.some((t) => /\bparallelogram\b/i.test(t)), 'no parallelogram item').toBe(true);
  });

  // NC-R2: NC uses the EXCLUSIVE definition of a trapezoid — exactly one pair
  // of parallel sides — so no parallelogram, rectangle, rhombus or square is
  // a trapezoid. The inclusive definition may appear only inside a distractor,
  // never in a key and never in an explanation.
  it('g3-g1-05: NC-R2 the key uses the exclusive trapezoid definition', () => {
    const q = GRADE_3_G_AUTHORED.find((i) => i.id === 'g3-g1-05')!;
    const correct = q.options.find((o) => o.isCorrect)!;
    expect(correct.text).toMatch(/not a trapezoid/i);
    expect(correct.text).toMatch(/exactly one pair of parallel sides/i);
    const inclusive = q.options.find((o) => /at least one pair/i.test(o.text))!;
    expect(inclusive.isCorrect).toBe(false);
    expect(inclusive.misconception).toBe('inclusive-trapezoid-definition');
    expect(q.contentVersion, 'a flipped key bumps contentVersion').toBe(2);
  });

  it('g3-g1-05: NC-R2 no key or explanation teaches the inclusive definition', () => {
    for (const q of GRADE_3_G_AUTHORED) {
      const correct = q.options.find((o) => o.isCorrect)!;
      const taught = [correct.text, ...q.explanation.stepByStep, q.explanation.conceptSummary].join(' ');
      expect(/at least one pair of parallel/i.test(taught), `${q.id} teaches the inclusive definition`).toBe(false);
    }
  });

  // Shape hierarchies overlap — every square is a rectangle AND a rhombus,
  // while under NC's exclusive definition no parallelogram is a trapezoid. A prose
  // classification bank is therefore one careless option away from two right
  // answers, and the shared kit cannot see it because prose has no value to
  // compare.
  //
  // BE CLEAR ABOUT WHAT THIS DOES AND DOES NOT DO. It does NOT decide whether
  // an option is true — nothing in this repo can, short of a shape-hierarchy
  // model, and a test named as though it could would be exactly the kind of
  // guard this plan has twice shipped and had to fix. What it does is force
  // every item through the human review: adding one means writing down, here,
  // why its three wrong options are false. The one-correct-option check below
  // is already made by assertAuthoredBankSound; it is repeated only so this
  // test fails loudly rather than vacuously if the bank is ever restructured.
  it('pins every item in the second-true-answer review', () => {
    // Every incorrect option, with the reason it is false, restated
    // independently of the option's own explanation.
    const falseBecause: Record<string, string> = {
      'g3-g1-01': 'a square, a long rectangle and a tilted rectangle are all rectangles',
      'g3-g1-02': 'two squares joined on a full side make a 1-by-2 rectangle, nothing else',
      'g3-g1-03': 'a straight cut between the midpoints of two opposite sides makes two rectangles',
      'g3-g1-04': 'only "every square is also a rectangle" holds',
      'g3-g1-05': 'a square is a rhombus, and it has two pairs of parallel sides, so it is not a trapezoid',
    };
    for (const q of GRADE_3_G_AUTHORED) {
      expect(falseBecause[q.id], `${q.id} is not pinned in the second-true-answer review`).toBeTruthy();
      expect(q.options.filter((o) => o.isCorrect).length, q.id).toBe(1);
    }
  });
});
