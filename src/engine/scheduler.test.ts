import { describe, it, expect } from 'vitest';
import { recordResult, dueEntries, BOX_INTERVALS_DAYS } from './scheduler';
import type { ReviewQueue } from './scheduler';

const T0 = new Date('2026-01-01T12:00:00Z');
const days = (n: number) => new Date(T0.getTime() + n * 86400000);
const ref = { kind: 'generated' as const, templateId: 'g5.nf1.add-unlike', seed: 11 };

describe('recordResult', () => {
  it('puts a missed item in box 1, due in one day', () => {
    const q = recordResult({}, ref, false, T0);
    const e = Object.values(q)[0];
    expect(e.box).toBe(1);
    expect(new Date(e.dueAt).toISOString()).toBe(days(1).toISOString());
  });

  it('does not enqueue an item answered correctly the first time', () => {
    expect(recordResult({}, ref, true, T0)).toEqual({});
  });

  it('promotes a correct review through the intervals', () => {
    let q: ReviewQueue = recordResult({}, ref, false, T0);
    for (let box = 1; box < BOX_INTERVALS_DAYS.length; box++) {
      q = recordResult(q, ref, true, days(0));
      expect(Object.values(q)[0].box).toBe(box + 1);
    }
  });

  it('retires an item promoted past the last box', () => {
    let q: ReviewQueue = recordResult({}, ref, false, T0);
    for (let i = 0; i < BOX_INTERVALS_DAYS.length; i++) q = recordResult(q, ref, true, T0);
    expect(q).toEqual({});
  });

  it('demotes a missed item back to box 1 from any box', () => {
    let q: ReviewQueue = recordResult({}, ref, false, T0);
    q = recordResult(q, ref, true, T0);
    q = recordResult(q, ref, true, T0);
    expect(Object.values(q)[0].box).toBe(3);
    q = recordResult(q, ref, false, T0);
    expect(Object.values(q)[0].box).toBe(1);
  });

  it('matches a different seed of the same template', () => {
    // The whole point of the seedless ReviewKey: review serves a fresh
    // instance, which must land on the same queue entry.
    let q = recordResult({}, { ...ref, seed: 1 }, false, T0);
    q = recordResult(q, { ...ref, seed: 99999 }, true, T0);
    expect(Object.keys(q)).toHaveLength(1);
    expect(Object.values(q)[0].box).toBe(2);
  });

  it('keeps authored items separate from templates with the same name', () => {
    let q = recordResult({}, { kind: 'authored', id: 'dup' }, false, T0);
    q = recordResult(q, { kind: 'generated', templateId: 'dup', seed: 1 }, false, T0);
    expect(Object.keys(q)).toHaveLength(2);
  });
});

describe('dueEntries', () => {
  it('returns nothing before the due date', () => {
    const q = recordResult({}, ref, false, T0);
    expect(dueEntries(q, days(0.5))).toEqual([]);
  });

  it('returns the entry once due', () => {
    const q = recordResult({}, ref, false, T0);
    expect(dueEntries(q, days(1))).toHaveLength(1);
    expect(dueEntries(q, days(9))).toHaveLength(1);
  });

  it('orders the most overdue first', () => {
    let q = recordResult({}, { kind: 'authored', id: 'old' }, false, T0);
    q = recordResult(q, { kind: 'authored', id: 'new' }, false, days(3));
    const due = dueEntries(q, days(10));
    expect(due.map((e) => (e.key as { id: string }).id)).toEqual(['old', 'new']);
  });
});
