import { describe, it, expect } from 'vitest';
import { makeQuestionSource } from './questionSource';
import { GRADE_5_AUTHORED } from '../curriculum/grade5/authored';
import { GRADE_5_TEMPLATES } from '../curriculum/grade5/templates';

const src = makeQuestionSource(GRADE_5_AUTHORED, GRADE_5_TEMPLATES);

describe('makeQuestionSource', () => {
  it('returns the requested number of refs', () => {
    expect(src.itemsFor('NC.5.NF.1', { count: 5, seedBase: 1 })).toHaveLength(5);
  });

  it('returns an empty list for a standard with no content', () => {
    expect(src.itemsFor('NC.9.ZZ.9', { count: 3, seedBase: 1 })).toEqual([]);
  });

  it('never repeats an authored item within one request', () => {
    const refs = src.itemsFor('NC.5.NF.1', { count: 4, seedBase: 7 });
    const authored = refs.filter((r) => r.kind === 'authored').map((r) => (r as {id: string}).id);
    expect(new Set(authored).size).toBe(authored.length);
  });

  it('gives distinct seeds to repeated uses of one template', () => {
    const refs = src.itemsFor('NC.5.NBT.5', { count: 6, seedBase: 100 });
    const gen = refs.filter((r) => r.kind === 'generated') as
      { kind: 'generated'; templateId: string; seed: number }[];
    const keys = gen.map((r) => `${r.templateId}:${r.seed}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('is reproducible for the same seedBase', () => {
    const a = src.itemsFor('NC.5.NF.1', { count: 5, seedBase: 55 });
    const b = src.itemsFor('NC.5.NF.1', { count: 5, seedBase: 55 });
    expect(a).toEqual(b);
  });

  it('resolves a generated ref to the same question every time', () => {
    const ref = { kind: 'generated' as const, templateId: 'g5.nf1.add-unlike', seed: 4912 };
    expect(src.resolve(ref)).toEqual(src.resolve(ref));
  });

  it('resolves an authored ref to its item', () => {
    const q = src.resolve({ kind: 'authored', id: GRADE_5_AUTHORED[0].id });
    expect(q.id).toBe(GRADE_5_AUTHORED[0].id);
  });

  it('throws on an unknown ref rather than returning a blank question', () => {
    expect(() => src.resolve({ kind: 'authored', id: 'nope' })).toThrow(/unknown/i);
    expect(() => src.resolve({ kind: 'generated', templateId: 'nope', seed: 1 }))
      .toThrow(/unknown/i);
  });
});
