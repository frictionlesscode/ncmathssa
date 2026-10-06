import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { QuizzesListView } from './QuizzesListView';
import { newProfile, saveState } from '../state/storage';
import type { AppStateV2 } from '../state/types';
import type { Grade } from '../curriculum/types';
import { getCurriculum } from '../curriculum/registry';

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

function stateWithDrillAttempt(scoreRaw: number, scoreTotal: number, scorePercent: number): AppStateV2 {
  const quiz = getCurriculum(5).quizzes.find((q) => q.domainId && !q.isMockAssessment)!;
  const profile = newProfile({
    id: 'p', studentName: 'T',
    attempts: [{
      id: 'a1', quizId: quiz.id, quizTitle: quiz.title, completedAt: '2026-09-30T00:00:00.000Z',
      scoreRaw, scoreTotal, scorePercent, isPassingSSA: false, timeElapsedSeconds: 1, answers: {},
    }],
  });
  return { version: 2, profiles: [profile], activeProfileId: 'p' };
}

describe('QuizzesListView pass check (F5)', () => {
  beforeEach(() => localStorage.clear());

  it('F5: a best attempt of 63 of 79 shows 79%, not 80%, and is not shown as passed', () => {
    saveState(localStorage, stateWithDrillAttempt(63, 79, 80));
    renderView();
    const best = screen.getByText('Best: 79%');
    expect(screen.queryByText('Best: 80%')).toBeNull();
    expect(best.className).toContain('text-amber-600');
    expect(best.className).not.toContain('text-emerald-600');
  });

  it('F5: a best attempt stored as 79.7 that did not pass displays 79%, not 80%', () => {
    saveState(localStorage, stateWithDrillAttempt(0, 0, 79.7));
    renderView();
    expect(screen.getByText('Best: 79%').className).toContain('text-amber-600');
  });

  it('F5: an exact-bar attempt of 4 of 5 is shown as passed', () => {
    saveState(localStorage, stateWithDrillAttempt(4, 5, 80));
    renderView();
    expect(screen.getByText('Best: 80%').className).toContain('text-emerald-600');
  });
});
