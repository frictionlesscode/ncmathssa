import { describe, it, expect } from 'vitest';
import {
  assertAuthoredBankSound,
  assertNoGeneratorDuplicatesAuthored,
  numericValue,
} from '../authoredBank.testkit';
import { GRADE_4_DOMAINS } from './standards';
import { GRADE_4_G_AUTHORED } from './authored.g';
import { GRADE_4_TEMPLATES } from './templates';

/** Every word an item puts in front of a child, in one string. */
function allText(q: (typeof GRADE_4_G_AUTHORED)[number]): string {
  return [
    q.prompt,
    q.promptDetails ?? '',
    ...q.options.map((o) => o.text),
    ...q.explanation.stepByStep,
    q.explanation.conceptSummary,
    q.explanation.commonMisconception ?? '',
  ].join(' ');
}

const itemsFor = (code: string) => GRADE_4_G_AUTHORED.filter((q) => q.standardCode === code);

describe('grade 4 G authored bank', () => {
  it('holds every authored-bank invariant', () => {
    const g = GRADE_4_DOMAINS.find((d) => d.id === 'G')!;
    assertAuthoredBankSound(GRADE_4_G_AUTHORED, g);
  });

  // This bank's options are sentences and shape names, so the kit's numeric
  // second-right-answer guard never fires on a single one of them. That is not
  // a reason to have no guard: it is a reason to say so out loud and check the
  // thing that CAN go wrong here, which is two options stating one fact in two
  // wordings. The all-prose assertion keeps a future numeric item from
  // arriving unnoticed and inheriting a guard nobody re-read.
  it('offers prose options only, so the kit’s numeric guard is knowingly inert', () => {
    for (const q of GRADE_4_G_AUTHORED) {
      for (const o of q.options) {
        expect(
          numericValue(o.text),
          `${q.id} option ${o.label} "${o.text}" is a quantity in an all-prose bank`,
        ).toBeNull();
      }
    }
  });

  it('never states one fact twice in two wordings', () => {
    for (const q of GRADE_4_G_AUTHORED) {
      const keys = q.options.map((o) =>
        o.text
          .toLowerCase()
          .replace(/[.,’']/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
      );
      expect(new Set(keys).size, `${q.id}: two options say the same thing`).toBe(4);
    }
  });

  // NC.4.G is TWO-DIMENSIONAL. Solids and volume are Grade 5 (NC.5.MD) and the
  // coordinate plane is Grade 5 Geometry (NC.5.G.1/2). A memory of "grade
  // school geometry" reaches for both; the sourced text in ./standards.ts has
  // neither.
  it('stays inside the two-dimensional scope the standards name', () => {
    const outOfScope =
      /\b(cube|cubes|prism|prisms|pyramid|pyramids|sphere|spheres|cone|cones|cylinder|cylinders|volume|coordinate|coordinates|x-axis|y-axis|ordered pair|quadrant)\b/i;
    for (const q of GRADE_4_G_AUTHORED) {
      const m = outOfScope.exec(allText(q));
      expect(m?.[0], `${q.id} reaches outside Grade 4 Geometry: "${m?.[0]}"`).toBeUndefined();
    }
  });

  // The app has no image assets and will not get any. Every figure is words.
  it('never asks a child to look at a picture', () => {
    const needsAnImage = /\b(picture|image|shown above|figure above|diagram above|as drawn|see the figure)\b/i;
    for (const q of GRADE_4_G_AUTHORED) {
      const m = needsAnImage.exec(allText(q));
      expect(m?.[0], `${q.id} refers to a picture the app cannot show: "${m?.[0]}"`).toBeUndefined();
    }
  });

  // NC uses the INCLUSIVE definition: a trapezoid has AT LEAST one pair of
  // parallel sides, so every parallelogram is a trapezoid. The exclusive
  // definition may appear only inside a distractor - never in a key and never
  // in an explanation, which is where a child goes to find out what is true.
  it('teaches only the inclusive trapezoid definition', () => {
    const exclusive = /exactly one pair of parallel/i;
    for (const q of GRADE_4_G_AUTHORED) {
      const taught = [
        q.prompt,
        q.promptDetails ?? '',
        ...q.options.filter((o) => o.isCorrect).map((o) => o.text),
      ].join(' ');
      expect(exclusive.test(taught), `${q.id} teaches the exclusive trapezoid definition`).toBe(
        false,
      );
      for (const step of q.explanation.stepByStep) {
        expect(
          /a trapezoid (must )?ha(s|ve) exactly one pair/i.test(step),
          `${q.id} explanation asserts the exclusive definition: "${step}"`,
        ).toBe(false);
      }
    }
  });

  // Ruling 9.2: NC.4.G.1 is "Draw and identify points, lines, line segments,
  // rays, angles, and PERPENDICULAR AND PARALLEL LINES" - two of its four
  // keyConcepts are the parallel and perpendicular ones. A bank that only ever
  // asks what a ray is covers half a standard.
  it('covers both halves of NC.4.G.1', () => {
    const g1 = itemsFor('NC.4.G.1');
    expect(
      g1.some((q) => /\bray\b/i.test(allText(q)) && /line segment/i.test(allText(q))),
      'NC.4.G.1 has no item distinguishing a ray from a line segment',
    ).toBe(true);
    expect(
      g1.some((q) => /parallel/i.test(allText(q)) && /perpendicular/i.test(allText(q))),
      'NC.4.G.1 has no item on parallel versus perpendicular lines',
    ).toBe(true);
  });

  // Ruling 9.1: NC.4.G.2 is "Classify quadrilaterals AND TRIANGLES based on
  // ANGLE MEASURE, SIDE LENGTHS, and the presence or absence of PARALLEL OR
  // PERPENDICULAR lines." All three criteria, both families of figure.
  it('classifies triangles as well as quadrilaterals, on all three criteria', () => {
    const g2 = itemsFor('NC.4.G.2');
    expect(
      g2.some((q) => /triangle/i.test(allText(q))),
      'NC.4.G.2 has no triangle-classification item',
    ).toBe(true);
    expect(
      g2.some((q) => /quadrilateral|rectangle|rhombus|square|trapezoid|parallelogram/i.test(allText(q))),
      'NC.4.G.2 has no quadrilateral-classification item',
    ).toBe(true);
    for (const [criterion, re] of [
      ['angle measure', /angle|square corner|right angle|acute|obtuse/i],
      ['side lengths', /side|length|centimeter/i],
      ['parallel or perpendicular lines', /parallel|perpendicular/i],
    ] as const) {
      expect(
        g2.some((q) => re.test(allText(q))),
        `NC.4.G.2 classifies nothing by ${criterion}`,
      ).toBe(true);
    }
  });

  // NC.4.G.3 is "Recognize symmetry in a two-dimensional figure, and identify
  // and draw lines of symmetry."
  it('covers recognizing and locating lines of symmetry', () => {
    const g3 = itemsFor('NC.4.G.3');
    expect(
      g3.every((q) => /symmetr/i.test(allText(q))),
      'an NC.4.G.3 item is not about symmetry',
    ).toBe(true);
    expect(
      g3.some((q) => /line of symmetry|lines of symmetry/i.test(allText(q))),
      'NC.4.G.3 never names a line of symmetry',
    ).toBe(true);
  });

  // Grade 4 Geometry ships no generator (see ./templates/index.ts for why),
  // but the other four domains do, and a question reachable both ways reaches
  // the scheduler under two review keys - {authored, id} and {generated,
  // templateId} - so one child is served it twice.
  it('shares no question with the generators', () => {
    assertNoGeneratorDuplicatesAuthored(GRADE_4_G_AUTHORED, GRADE_4_TEMPLATES);
  });
});
