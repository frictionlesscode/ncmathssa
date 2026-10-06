import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { ParentHome } from './ParentHome';
import { newProfile, saveState } from '../state/storage';

const handlers = { onStartStep: vi.fn(), onContinue: vi.fn(), onOpenDetailed: vi.fn(), onSwitchStudent: vi.fn(), onAddStudent: vi.fn() };
const tree = () => <ProgressProvider><ParentHome {...handlers} /></ProgressProvider>;

describe('ParentHome after midnight (F11)', () => {
  beforeEach(() => { localStorage.clear(); vi.useFakeTimers({ toFake: ['Date'] }); });
  afterEach(() => vi.useRealTimers());

  it('F11: the short-on-time switch happens when the day rolls over', () => {
    vi.setSystemTime(new Date(2026, 8, 30, 12));
    saveState(localStorage, { version: 2, activeProfileId: 'p', profiles: [newProfile({ id: 'p', studentName: 'Alex', targetExamDate: '2026-10-15' })] });
    const { rerender } = render(tree());
    expect(screen.getByText(/15 days left|2 weeks left/)).toBeInTheDocument();
    expect(screen.queryByText(/short on time/i)).not.toBeInTheDocument();
    vi.setSystemTime(new Date(2026, 9, 2, 12));
    rerender(tree());
    expect(screen.getByText(/13 days left/)).toBeInTheDocument();
    expect(screen.getByText(/short on time/i)).toBeInTheDocument();
  });
});
