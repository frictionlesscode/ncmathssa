import { describe, it, expect } from 'vitest';
import { getBrowserStorage } from './storage';
import { createMemoryStorage } from './memoryStorage';

describe('getBrowserStorage', () => {
  it('returns the real storage when access works', () => {
    const s = createMemoryStorage();
    expect(getBrowserStorage(() => s)).toEqual({ storage: s, blocked: false });
  });
  it('logic-flows Medium: falls back to memory when the accessor throws', () => {
    const r = getBrowserStorage(() => { throw new Error('denied'); });
    expect(r.blocked).toBe(true);
    r.storage.setItem('k', 'v');
    expect(r.storage.getItem('k')).toBe('v');
  });
});
