import { describe, it, expect } from 'vitest';
import { GRADE_2_TEMPLATES } from './index';
import { GRADE_2_DOMAINS } from '../standards';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { MISCONCEPTIONS } from '../../misconceptions';

const codes = new Set(GRADE_2_DOMAINS.flatMap((d) => d.standards.map((s) => s.code)));

function questionKey(prompt: string, details: string | undefined): string {
  return `${prompt.trim()}\n<<figure>>\n${(details ?? '').trim()}`;
}

describe('GRADE_2_TEMPLATES', () => {
  it('has unique template ids', () => {
    const ids = GRADE_2_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references only real grade 2 standards', () => {
    for (const t of GRADE_2_TEMPLATES) {
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
    const exported = new Set(GRADE_2_TEMPLATES.map((t) => t.id));
    const missing = onDisk.map((t) => t.id).filter((id) => !exported.has(id));
    expect(missing, `template files not listed in index.ts: ${missing.join(', ')}`).toEqual([]);
  });

  it('names every template g2.<tail>.<slug>', () => {
    for (const t of GRADE_2_TEMPLATES) {
      expect(t.id, `${t.id} is not a dotted g2 template id`).toMatch(/^g2\.[a-z]+\d\.[a-z0-9-]+$/);
    }
  });

  it('tags every distractor with a declared misconception', () => {
    for (const t of GRADE_2_TEMPLATES) {
      for (let seed = 0; seed < 50; seed++) {
        const g = t.generate(makeRng(seed));
        for (const o of g.options) {
          if (o.isCorrect) continue;
          expect(MISCONCEPTIONS[o.misconception ?? ''], `${t.id}: ${o.misconception}`).toBeTruthy();
        }
      }
    }
  });

  it('cannot emit the same question from two different templates', () => {
    const seen = new Map<string, string>();
    for (const t of GRADE_2_TEMPLATES) {
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
      'g2.oa1.change-unknown': /^[A-Z][a-z]+ had \d+ [\w ]+\. [A-Z][a-z]+ (?:gave away|lost|traded away) some of them\./,
      'g2.oa2.fluency-fact': /^What is \d+ [+−] \d+\?$/,
      'g2.oa3.odd-or-even': /^Which of these numbers is (?:EVEN|ODD)\?$/,
      'g2.oa4.array-repeated-addition': /^The \w+ below are arranged in equal rows\./,
      'g2.nbt1.various-groupings': /^Trade one hundred for ten tens\. Which grouping shows the same number\?$/,
      'g2.nbt2.skip-count': /^Skip-count\. What are the next three numbers\?$/,
      'g2.nbt3.expanded-form': /^Which one shows this number in expanded form\?$/,
      'g2.nbt4.compare-three-digit': /^Which sentence is true\?$/,
      'g2.nbt5.add-within-100': /^Add these numbers in your head\.$/,
      'g2.nbt5.subtract-within-100': /^Subtract these numbers in your head\.$/,
      'g2.nbt6.three-addend-sum': /^Add all of the numbers\.$/,
      'g2.nbt7.add-within-1000': /^Line the numbers up by place value, then add\.$/,
      'g2.nbt7.subtract-within-1000': /^Line the numbers up by place value, then subtract\.$/,
      'g2.nbt8.ten-or-hundred': /^Do this in your head\. No counting on\.$/,
    };
    expect(Object.keys(sentinels).sort()).toEqual(GRADE_2_TEMPLATES.map((t) => t.id).sort());
    for (const t of GRADE_2_TEMPLATES) {
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

  it.each(GRADE_2_TEMPLATES.map((t) => [t.id, t] as const))(
    '%s satisfies every template invariant',
    (_id, t) => assertTemplateSound(t, { runs: 200 }),
  );
});
