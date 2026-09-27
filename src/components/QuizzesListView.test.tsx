import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { QuizzesListView } from './QuizzesListView';
import { newProfile, saveState } from '../state/storage';
import type { AppStateV2 } from '../state/types';
import type { Grade } from '../curriculum/types';

function stateForGrade(grade: Grade): AppStateV2 {
  const profile = newProfile({ id: `p-${grade}`, studentName: 'Test', grade });
  return { version: 2, profiles: [profile], activeProfileId: profile.id };
}

const renderView = () =>
  render(
    <ProgressProvider>
      <QuizzesListView
        onStartQuiz={vi.fn()}
        onStartStandardDrill={vi.fn()}
        onStartAdaptiveSession={vi.fn()}
      />
    </ProgressProvider>
  );

describe('QuizzesListView module drill weight labeling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("labels grade 5's grouped MD+G drill cards with the compact shared form, not a bare band (Finding F1)", () => {
    // Grade 5's behaviour must not change in substance (Task 21 constraint /
    // Ruling 21-8: MD and G share one published band, so a bare
    // `officialWeightRange` on the module card understates that it is
    // shared), but the FULL "(...combined)" wording broke this card's
    // layout (Finding F1) - it is replaced with the compact shared form,
    // matching CurriculumView's pill and Dashboard's badge exactly.
    saveState(localStorage, stateForGrade(5));
    renderView();
    expect(screen.getByText('MD • 19–23% with G')).toBeInTheDocument();
    expect(screen.getByText('G • 19–23% with MD')).toBeInTheDocument();
  });

  it('never shows the unweighted placeholder string on a grade 2 module drill card', () => {
    saveState(localStorage, stateForGrade(2));
    renderView();
    expect(screen.queryByText(/No state assessment at this grade/)).not.toBeInTheDocument();
    // No card claims an official blueprint weight; the mock exam's own
    // subtitle is allowed to *disclaim* one ("no official state blueprint
    // to allocate against"), so this checks the specific false-claim
    // phrase, not the bare word.
    expect(screen.queryByText(/blueprint weight/i)).not.toBeInTheDocument();
    // Every module drill card instead shows a real computed percentage,
    // pinned exactly - unaffected by the F1 compact-label fix.
    expect(screen.getByText('OA • 17%')).toBeInTheDocument();
  });
});

describe('QuizzesListView mock assessment header (Finding F3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps grade 5\'s exact mock header - two forms, a real calculator split', () => {
    saveState(localStorage, stateForGrade(5));
    renderView();
    expect(
      screen.getByText('Timed 60-65 Minutes • Divided into Calculator Inactive & Active'),
    ).toBeInTheDocument();
  });

  it("derives grade 2's mock header from its one 40-minute mock, with no calculator claim", () => {
    // Grade 2 has one mock (40 minutes) and no item anywhere in it allows a
    // calculator, so the header must neither borrow grade 5's range nor
    // claim a calculator split that does not exist.
    saveState(localStorage, stateForGrade(2));
    renderView();
    expect(screen.getByText('Timed 40 Minutes')).toBeInTheDocument();
    expect(screen.queryByText(/Calculator/)).not.toBeInTheDocument();
  });
});
