import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { WeakSpotsView } from './WeakSpotsView';
import { newProfile, saveState } from '../state/storage';
import type { AppStateV2 } from '../state/types';

// NC.5.NF.1 in the authored bank; correct option is 'C' ("4 7/12"), per
// src/curriculum/grade5/authored.ts.
const STANDARD_CODE = 'NC.5.NF.1';
const AUTHORED_ID = 'nf1-01';
const CORRECT_LABEL = 'C';

function seedDueReviewState(): AppStateV2 {
  const pastIso = new Date(Date.now() - 86400000).toISOString(); // yesterday: already due
  const profile = newProfile({
    id: 'p1',
    reviewQueue: {
      'a:nf1-01': {
        key: { kind: 'authored', id: AUTHORED_ID },
        box: 1,
        dueAt: pastIso,
        lastSeenAt: pastIso
      }
    }
  });
  return { version: 2, profiles: [profile], activeProfileId: profile.id };
}

const renderView = () =>
  render(
    <ProgressProvider>
      <WeakSpotsView onStartCustomQuiz={vi.fn()} onOpenStudyGuide={vi.fn()} />
    </ProgressProvider>
  );

describe('WeakSpotsView', () => {
  beforeEach(() => {
    localStorage.clear();
    saveState(localStorage, seedDueReviewState());
  });

  it('shows the empty state when nothing is due or scheduled', () => {
    localStorage.clear();
    renderView();
    expect(screen.getByText(/Zero Missed Questions/i)).toBeInTheDocument();
  });

  it('renders a due review with its standard code and box number', () => {
    renderView();
    expect(screen.getByText(/Due Now \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(STANDARD_CODE)).toBeInTheDocument();
    expect(screen.getByText('Box 1 of 5')).toBeInTheDocument();
  });

  it('offers a "Practice All" drill sized to the due count', () => {
    renderView();
    expect(screen.getByText('Practice All 1 Due Qs')).toBeInTheDocument();
  });

  it('reports the real next-review interval on a correct retry, not a permanent-clear message', () => {
    renderView();
    act(() => screen.getByRole('button', { name: CORRECT_LABEL }).click());
    // box 1 -> promoted to box 2 -> BOX_INTERVALS_DAYS[1] = 3 days.
    expect(screen.getByText(/Back for review in 3 days\./)).toBeInTheDocument();
    expect(screen.queryByText(/clearing from weak spots/i)).not.toBeInTheDocument();
  });

  it('reports a 1-day interval on an incorrect retry', () => {
    renderView();
    const wrongLabel = 'A'; // never the correct option for this question
    act(() => screen.getByRole('button', { name: wrongLabel }).click());
    expect(screen.getByText(/Back for review in 1 day\./)).toBeInTheDocument();
  });
});
