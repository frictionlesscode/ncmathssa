import { describe, it, expect } from 'vitest';
import { GRADE_5_QUIZZES } from './quizzes';
import { GRADE_5_AUTHORED } from './authored';
import { GRADE_5_DOMAINS, GRADE_5_STANDARDS } from './standards';
import quizzesSource from './quizzes.ts?raw';

/** The audit's recommended tolerance for the diagnostic, in percentage points. */
const BLUEPRINT_TOLERANCE_POINTS = 5;

const domainOfItem = new Map(GRADE_5_AUTHORED.map((q) => [q.id, q.domainId] as const));
const standardOfItem = new Map(GRADE_5_AUTHORED.map((q) => [q.id, q.standardCode] as const));

/** MD and G share one published band, so they count as one group. */
const groupOfDomain = new Map(GRADE_5_DOMAINS.map((d) => [d.id, d.weightGroup ?? d.id] as const));

const bands = new Map(
  GRADE_5_DOMAINS.map((d) => {
    const m = /(\d+)\D+(\d+)%/.exec(d.officialWeightRange);
    if (!m) throw new Error(`unparsable band ${d.officialWeightRange}`);
    return [d.weightGroup ?? d.id, { low: Number(m[1]), high: Number(m[2]) }] as const;
  }),
);

function quiz(id: string) {
  const q = GRADE_5_QUIZZES.find((x) => x.id === id);
  if (!q) throw new Error(`no quiz ${id}`);
  return q;
}

/** Percent of a form's items in each blueprint group. */
function shares(ids: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const id of ids) {
    const domain = domainOfItem.get(id);
    if (!domain) throw new Error(`form cites unknown item ${id}`);
    const group = groupOfDomain.get(domain)!;
    counts.set(group, (counts.get(group) ?? 0) + 1);
  }
  return new Map([...bands.keys()].map((g) => [g, ((counts.get(g) ?? 0) / ids.length) * 100] as const));
}

describe('Grade 5 forms follow the NCDPI blueprint (audit Medium)', () => {
  it.each(['mock-ssa-01', 'mock-ssa-02'])('%s: every domain share is inside its published band', (id) => {
    const ids = quiz(id).questionIds;
    for (const [group, pct] of shares(ids)) {
      const band = bands.get(group)!;
      expect(pct, `${id}: ${group} is ${pct.toFixed(1)}% of ${ids.length} items`).toBeGreaterThanOrEqual(band.low);
      expect(pct, `${id}: ${group} is ${pct.toFixed(1)}% of ${ids.length} items`).toBeLessThanOrEqual(band.high);
    }
  });

  it('diagnostic-01: every share is within the tolerance of its band, and every standard appears', () => {
    const ids = quiz('diagnostic-01').questionIds;
    for (const [group, pct] of shares(ids)) {
      const band = bands.get(group)!;
      expect(pct, `${group} is ${pct.toFixed(1)}% of ${ids.length} items`).toBeGreaterThanOrEqual(band.low - BLUEPRINT_TOLERANCE_POINTS);
      expect(pct, `${group} is ${pct.toFixed(1)}% of ${ids.length} items`).toBeLessThanOrEqual(band.high + BLUEPRINT_TOLERANCE_POINTS);
    }
    const covered = new Set(ids.map((id) => standardOfItem.get(id)));
    for (const s of GRADE_5_STANDARDS) expect(covered.has(s.code), `no item for ${s.code}`).toBe(true);
  });

  it('no form repeats an item', () => {
    for (const id of ['diagnostic-01', 'mock-ssa-01', 'mock-ssa-02']) {
      const ids = quiz(id).questionIds;
      expect(new Set(ids).size, id).toBe(ids.length);
    }
  });

  it('the two practice tests share only fraction items (only 12 exist, so a 40% share cannot be disjoint)', () => {
    const a = new Set(quiz('mock-ssa-01').questionIds);
    const shared = quiz('mock-ssa-02').questionIds.filter((id) => a.has(id));
    expect(shared.length).toBeGreaterThan(0);
    for (const id of shared) expect(domainOfItem.get(id), `${id} is shared`).toBe('NF');
  });

  it('quizzes.ts describes no calculator sections (audit Medium: the app flags each question)', () => {
    expect(quizzesSource).not.toMatch(/Calculator (Inactive|Active)/i);
  });

  it('the module and mock subtitles name line graphs, not line plots or above-grade stretch items', () => {
    expect(quizzesSource).not.toMatch(/line plots?|above-grade stretch/i);
  });
});
