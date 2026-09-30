import { describe, it, expect } from 'vitest';
import { getCurriculum, standardsOf } from '../curriculum/registry';
import { createAdaptiveSessionDrill, createMissedQuestionsDrill, createStandardDrill } from './drills';

describe('drill factories work for any grade', () => {
  it('builds a standard drill from grade 3 content', () => {
    const c = getCurriculum(3);
    const code = c.source.allStandardsWithContent().find((s) => c.source.authoredFor(s).length > 0)!;
    const drill = createStandardDrill(code, c);
    expect(drill.standardCode).toBe(code);
    expect(drill.domainId).toBe(standardsOf(c).find((s) => s.code === code)!.domainId);
    expect(drill.questionIds.length).toBeGreaterThan(0);
  });

  it('encodes generated refs in adaptive drills and keeps missed ids', () => {
    expect(createAdaptiveSessionDrill([{ ref: { kind: 'generated', templateId: 't', seed: 7 }, origin: 'new' }]).questionIds).toEqual(['t#7']);
    expect(createMissedQuestionsDrill(['a', 'b']).questionIds).toEqual(['a', 'b']);
  });
});
