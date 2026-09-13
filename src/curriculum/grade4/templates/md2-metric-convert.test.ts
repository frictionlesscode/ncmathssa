import { describe, it, expect } from 'vitest';
import { assertTemplateSound } from '../../../engine/templateTesting';
import { makeRng } from '../../../engine/rng';
import { md2MetricConvert, PAIRS } from './md2-metric-convert';

const bare = (s: string): number => Number(s.replace(/,/g, ''));

/** The conversion the item asks for, read back out of the line the generator
 *  actually printed: "7 meters = ? centimeters". */
function asked(details: string): { quantity: number; big: string; small: string } {
  const m = details.match(/^([\d,]+) ([a-z]+) = \? ([a-z]+)$/);
  if (!m) throw new Error(`unparsable promptDetails: ${details}`);
  return { quantity: bare(m[1]), big: m[2], small: m[3] };
}

const taggedValue = (g: ReturnType<typeof md2MetricConvert.generate>, tag: string): number => {
  const opt = g.options.find((o) => o.misconception === tag);
  if (!opt) throw new Error(`no option tagged ${tag}`);
  return bare(opt.text);
};

describe('g4.md2.metric-convert', () => {
  it('is sound at every seed', () => {
    assertTemplateSound(md2MetricConvert);
  });

  it('is deterministic in its seed', () => {
    expect(md2MetricConvert.generate(makeRng(23))).toEqual(md2MetricConvert.generate(makeRng(23)));
  });

  it('produces a known question at a pinned seed', () => {
    const g = md2MetricConvert.generate(makeRng(2));
    const { quantity, big, small } = asked(g.promptDetails!);
    const factor = PAIRS.find((p) => p.big === big && p.small === small)!.factor;
    expect(bare(g.answerText)).toBe(quantity * factor);
    expect(g.options.find((o) => o.isCorrect)!.text).toBe(g.answerText);
  });

  it('produces a second known question at a pinned seed', () => {
    const g = md2MetricConvert.generate(makeRng(58));
    const { quantity, big, small } = asked(g.promptDetails!);
    const factor = PAIRS.find((p) => p.big === big && p.small === small)!.factor;
    expect(bare(g.answerText)).toBe(quantity * factor);
  });

  // NC.4.MD.2's sourced text is "convert metric measurements from a LARGER
  // unit to a SMALLER unit". The direction is the standard, so it is asserted
  // rather than assumed: the answer must always be bigger than the quantity.
  it('only ever converts a larger unit into a smaller one', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md2MetricConvert.generate(makeRng(seed));
      const { quantity, big, small } = asked(g.promptDetails!);
      const pair = PAIRS.find((p) => p.big === big && p.small === small);
      expect(pair, `seed ${seed}: ${big} to ${small} is not a sourced pair`).toBeTruthy();
      expect(bare(g.answerText), `seed ${seed}`).toBe(quantity * pair!.factor);
      expect(bare(g.answerText), `seed ${seed}`).toBeGreaterThan(quantity);
    }
  });

  // The two place-value tags swap places with the factor, because which one
  // names the error depends on which factor the pair really uses: 1,000 is a
  // real conversion factor applied to the wrong pair, while 10 and 10,000
  // belong to no pair among the six sourced units at all.
  it('gives each faulty method its own distractor, and names it correctly', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md2MetricConvert.generate(makeRng(seed));
      const { quantity, big, small } = asked(g.promptDetails!);
      const factor = PAIRS.find((p) => p.big === big && p.small === small)!.factor;
      const other = factor === 100 ? 1000 : 100;
      const nonFactor = factor === 100 ? 10 : 10000;

      expect(taggedValue(g, 'used-wrong-conversion-factor'), `seed ${seed}`).toBe(
        quantity * other,
      );
      expect(taggedValue(g, 'wrong-power-of-ten'), `seed ${seed}`).toBe(quantity * nonFactor);
      expect(taggedValue(g, 'left-the-measurement-unconverted'), `seed ${seed}`).toBe(quantity);
    }
  });

  // DIVIDING where multiplying was needed is the characteristic NC.4.MD.2
  // error, and it is deliberately NOT modelled here: dividing by 1,000 lands
  // in thousandths, which is NC.5.NBT.3 a grade above. The authored items
  // g4-md2-01 and g4-md2-02 carry it instead. Assert the absence, so nobody
  // adds it here later without reading why it is missing.
  it('prints no value below one, so no seed reaches a grade-above place value', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md2MetricConvert.generate(makeRng(seed));
      for (const o of g.options) {
        expect(o.text.includes('.'), `seed ${seed}: ${o.text} is not a whole number`).toBe(false);
        expect(bare(o.text), `seed ${seed}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('keeps every number it prints inside Grade 4', () => {
    for (let seed = 0; seed < 300; seed++) {
      const g = md2MetricConvert.generate(makeRng(seed));
      const worked = [
        g.prompt,
        g.promptDetails ?? '',
        ...g.options.map((o) => o.text),
        ...g.explanation.stepByStep,
        g.explanation.conceptSummary,
        g.explanation.commonMisconception ?? '',
      ].join(' ');
      for (const numeral of worked.match(/\d[\d,]*/g) ?? []) {
        // 9 x 10,000 is the ceiling; Grade 4 Base Ten works within 100,000.
        expect(bare(numeral), `seed ${seed}: ${numeral}`).toBeLessThanOrEqual(90000);
      }
    }
  });

  // The sweep DRIVES generate() rather than recomputing what it ought to
  // print. (pair, quantity) is the whole space and promptDetails names both.
  it('covers its whole parameter space, checked on what it really generates', () => {
    const seen = new Set<string>();
    const failures: string[] = [];
    for (let seed = 0; seed < 6000; seed++) {
      const g = md2MetricConvert.generate(makeRng(seed));
      const { quantity, big, small } = asked(g.promptDetails!);
      seen.add(`${big}>${small}:${quantity}`);
      const where = `seed ${seed} (${quantity} ${big})`;

      const values = g.options.map((o) => bare(o.text));
      if (new Set(values).size !== 4) failures.push(`${where}: two options name one amount`);
      const factor = PAIRS.find((p) => p.big === big && p.small === small)?.factor;
      if (!factor) failures.push(`${where}: unsourced unit pair`);
      else if (bare(g.answerText) !== quantity * factor) {
        failures.push(`${where}: key is not the conversion`);
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
    // 24 quantities for meters-to-centimeters plus 8 each for the two
    // thousand-factor pairs.
    expect(seen.size).toBe(40);
  });
});
