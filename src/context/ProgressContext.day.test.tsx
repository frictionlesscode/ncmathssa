import type React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ProgressProvider, useReadinessSummary, useProgress } from './ProgressContext';

describe('F11: day-dependent values refresh after midnight', () => {
  beforeEach(() => { localStorage.clear(); vi.useFakeTimers({ toFake: ['Date'] }); });
  afterEach(() => vi.useRealTimers());

  it('F11: daysUntilExam counts down when the day changes, without any data change', () => {
    vi.setSystemTime(new Date(2026, 8, 30, 23, 0));
    const wrapper = ({ children }: { children: React.ReactNode }) => <ProgressProvider>{children}</ProgressProvider>;
    const { result, rerender } = renderHook(() => ({ p: useProgress(), r: useReadinessSummary() }), { wrapper });
    act(() => result.current.p.updateActiveProfile({ targetExamDate: '2026-10-05' }));
    expect(result.current.r.daysUntilExam).toBe(5);
    vi.setSystemTime(new Date(2026, 9, 1, 0, 5));
    rerender();
    expect(result.current.r.daysUntilExam).toBe(4);
  });
});
