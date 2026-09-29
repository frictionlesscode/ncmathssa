import { describe, it, expect } from 'vitest';
import { GRADE_1_TEMPLATES } from './index';
import { GRADE_1_DOMAINS } from '../standards';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { MISCONCEPTIONS } from '../../misconceptions';
import { assertGradeOneReadable } from '../../authoredBank.testkit';

const codes = new Set(GRADE_1_DOMAINS.flatMap((d) => d.standards.map((s) => s.code)));

function questionKey(prompt: string, details: string | undefined): string {
  return `${prompt.trim()}\n<<figure>>\n${(details ?? '').trim()}`;
}

describe('GRADE_1_TEMPLATES', () => {
  it('has unique template ids', () => {
    const ids = GRADE_1_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references only real grade 1 standards', () => {
    for (const t of GRADE_1_TEMPLATES) {
      expect(codes.has(t.standardCode), `${t.id} -> ${t.standardCode}`).toBe(true);
    }
  });

  it('exports every template file in this directory', () => {
    const modules = import.meta.glob(['./*.ts', '!./*.test.ts', '!./index.ts'], { eager: true });
    const onDisk = Object.values(modules).flatMap((m) =>
      Object.values(m as Record<string, unknown>).filter(
        (v): v is { id: string } =>
          !!v &&
          typeof v === 'object' &&
          typeof (v as { generate?: unknown }).generate === 'function',
      ),
    );
    const exported = new Set(GRADE_1_TEMPLATES.map((t) => t.id));
    const missing = onDisk.map((t) => t.id).filter((id) => !exported.has(id));
    expect(missing, `template files not listed in index.ts: ${missing.join(', ')}`).toEqual([]);
  });

  it('names every template g1.<tail>.<slug>', () => {
    for (const t of GRADE_1_TEMPLATES) {
      expect(t.id, `${t.id} is not a dotted g1 template id`).toMatch(/^g1\.[a-z]+\d+\.[a-z0-9-]+$/);
    }
  });

  // Ruling 22-1 is exactly the defect this catches: a fluency-within-10
  // generator filed under NC.1.OA.6 would be named g1.oa9.* and fail here.
  it('names every template after the standard it is filed under', () => {
    for (const t of GRADE_1_TEMPLATES) {
      const tail = t.standardCode.split('.').slice(2).join('').toLowerCase();
      expect(t.id.split('.')[1], `${t.id} is filed under ${t.standardCode}`).toBe(tail);
    }
  });

  it('tags every distractor with a declared misconception', () => {
    for (const t of GRADE_1_TEMPLATES) {
      for (let seed = 0; seed < 50; seed++) {
        const g = t.generate(makeRng(seed));
        for (const o of g.options) {
          if (o.isCorrect) continue;
          expect(MISCONCEPTIONS[o.misconception ?? ''], `${t.id}: ${o.misconception}`).toBeTruthy();
        }
      }
    }
  });

  // Each template also asserts this in its own test (ruling 22-7 / E.3); this
  // copy is the net under any Grade 1 generator appended here later.
  it('keeps every generated prompt readable for a six-year-old', () => {
    for (const t of GRADE_1_TEMPLATES) {
      assertGradeOneReadable(
        Array.from({ length: 100 }, (_, seed) => ({ id: `${t.id} @ seed ${seed}`, prompt: t.generate(makeRng(seed)).prompt })),
      );
    }
  });

  it('cannot emit the same question from two different templates', () => {
    const seen = new Map<string, string>();
    for (const t of GRADE_1_TEMPLATES) {
      for (let seed = 0; seed < 800; seed++) {
        const g = t.generate(makeRng(seed));
        const key = questionKey(g.prompt, g.promptDetails);
        const owner = seen.get(key);
        if (owner !== undefined && owner !== t.id) {
          throw new Error(`${t.id} and ${owner} both emit: "${g.prompt}"`);
        }
        seen.set(key, t.id);
      }
    }
    expect(seen.size).toBeGreaterThan(0);
  });

  it('gives each generator a prompt shape no other one can produce', () => {
    const sentinels: Record<string, RegExp> = {
      'g1.oa1.compare-difference':
        /^[A-Z][a-z]+ has \d+ [a-z]+ and [A-Z][a-z]+ has \d+\. How many (?:more|fewer) [a-z]+ does [A-Z][a-z]+ have than [A-Z][a-z]+\?$/,
      'g1.oa2.three-addends':
        /^[A-Z][a-z]+ has \d+ red, \d+ blue, and \d+ green [a-z]+\. How many [a-z]+ does [A-Z][a-z]+ have in all\?$/,
      'g1.oa6.make-ten-add': /^Make a ten to help\. What is \d+ \+ \d+\?$/,
      'g1.oa6.get-to-ten-subtract': /^Get to 10 first\. What is \d+ − \d+\?$/,
      'g1.oa8.missing-part':
        /^What number makes (?:\d+ \+ ☐ = \d+|☐ \+ \d+ = \d+|\d+ = \d+ \+ ☐|\d+ = ☐ \+ \d+|\d+ − ☐ = \d+|\d+ = \d+ − ☐) true\?$/,
      'g1.oa8.missing-whole': /^What number makes (?:☐ − \d+ = \d+|\d+ = ☐ − \d+) true\?$/,
      'g1.oa9.add-within-10': /^What is \d+ \+ \d+\?$/,
      'g1.oa9.subtract-within-10': /^What is \d+ − \d+\?$/,
      'g1.nbt1.count-past-a-ten': /^Count on from \d+\. What are the next three numbers\?$/,
      'g1.nbt2.tens-and-ones': /^What number is \d+ tens? and \d+ ones?\?$/,
      'g1.nbt3.which-sentence-is-true': /^Which sentence about \d+ and \d+ is true\?$/,
      'g1.nbt4.add-within-100': /^Find the total: \d+ \+ \d+\.$/,
      'g1.nbt5.ten-more-or-less': /^What is 10 (?:more|less) than \d+\?$/,
      'g1.nbt6.subtract-multiples-of-ten': /^Find the difference: \d+ − \d+\.$/,
      'g1.nbt7.write-the-numeral': /^Which number is [a-z]+(?:-[a-z]+)?\?$/,
      'g1.md2.measure-with-units': /^How many [a-z]+(?: [a-z]+)* long is the [a-z]+\?$/,
      'g1.md4.read-the-data':
        /^(?:How many students answered in all\?|How many students picked [a-z]+\?|How many more students picked [a-z]+ than [a-z]+\?)$/,
    };
    expect(Object.keys(sentinels).sort()).toEqual(GRADE_1_TEMPLATES.map((t) => t.id).sort());
    for (const t of GRADE_1_TEMPLATES) {
      for (let seed = 0; seed < 400; seed++) {
        const { prompt } = t.generate(makeRng(seed));
        for (const [id, re] of Object.entries(sentinels)) {
          expect(
            re.test(prompt),
            `${t.id} @ seed ${seed}: "${prompt}" ${id === t.id ? 'fails its own' : `matches ${id}'s`} sentinel`,
          ).toBe(id === t.id);
        }
      }
    }
  });

  it.each(GRADE_1_TEMPLATES.map((t) => [t.id, t] as const))(
    '%s satisfies every template invariant',
    (_id, t) => assertTemplateSound(t, { runs: 200 }),
  );
});
