import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { CurriculumView } from './CurriculumView';
import { newProfile, saveState } from '../state/storage';
import type { AppStateV2 } from '../state/types';
import type { Grade } from '../curriculum/types';
import { getCurriculum } from '../curriculum/registry';
import type { QuizAttempt } from '../types';

function stateForGrade(grade: Grade): AppStateV2 {
  const profile = newProfile({ id: `p-${grade}`, studentName: 'Test', grade });
  return { version: 2, profiles: [profile], activeProfileId: profile.id };
}

const renderView = () =>
  render(
    <ProgressProvider>
      <CurriculumView onStartStandardDrill={vi.fn()} onOpenStudyGuide={vi.fn()} />
    </ProgressProvider>
  );

describe('CurriculumView weight labeling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('still calls it the NC Blueprint Weight for grade 5, which has a real blueprint', () => {
    // Grade 5's behaviour must not change (Task 21 constraint): the
    // published blueprint band still reads as official.
    saveState(localStorage, stateForGrade(5));
    renderView();
    expect(screen.getAllByText(/NC Blueprint Weight:/).length).toBeGreaterThan(0);
    // The domain filter pills also cite a real band for grade 5.
    expect(screen.getByRole('button', { name: /^NF \(/ })).toBeInTheDocument();
  });

  it('compacts the grouped MD/G pill onto one line without a bare, misattributed band (Finding F1)', () => {
    // Regression from Task 21: weightLabel's full "(Measurement & Data and
    // Geometry combined)" wording, rendered raw inside the pill, wrapped the
    // pill row onto two lines and squeezed the page header. Pin the exact
    // compact string - one line, no nested parens, marks the band shared.
    saveState(localStorage, stateForGrade(5));
    renderView();
    expect(screen.getByRole('button', { name: 'MD (19–23% with G)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'G (19–23% with MD)' })).toBeInTheDocument();
    // The full wording still lives somewhere with room: the domain header.
    expect(screen.getAllByText(/Measurement & Data and Geometry combined/).length).toBeGreaterThan(0);
  });

  it('never claims a blueprint for grade 2, which NCDPI does not publish one for', () => {
    saveState(localStorage, stateForGrade(2));
    renderView();
    expect(screen.queryByText(/NC Blueprint Weight/)).not.toBeInTheDocument();
    expect(screen.queryByText(/blueprint weight/i)).not.toBeInTheDocument();
    // The heading calls the figure what it is...
    expect(screen.getAllByText(/Share of Grade Standards:/).length).toBeGreaterThan(0);
    // ...and the value beside it is a real computed share, never the
    // placeholder string glued onto an honest heading (Ruling 21-3).
    expect(screen.queryByText(/No state assessment at this grade/)).not.toBeInTheDocument();
    // The domain filter pills carry the same fix, and Grade 1-2 values stay
    // exactly as they were ('17%'), unaffected by the F1 compact-label fix.
    expect(screen.getByRole('button', { name: /^OA \(\d+%\)$/ })).toBeInTheDocument();
  });

  it('says "standards", never "blueprint", anywhere in the page chrome at grade 2 (Finding F7)', () => {
    // Controller ruling: Task 21's whole purpose is stopping the UI from
    // claiming a blueprint that does not exist. The eyebrow and h1 must not
    // say "blueprint" for an unweighted grade - "Content Blueprint" /
    // "Standard Blueprints" named the curriculum document, but a Grade 2
    // parent has no blueprint document to be told about either.
    saveState(localStorage, stateForGrade(2));
    renderView();
    expect(screen.queryByText(/blueprint/i)).not.toBeInTheDocument();
  });

  it('keeps the exact page-chrome wording for grade 5, which has a real blueprint (Finding F7)', () => {
    saveState(localStorage, stateForGrade(5));
    renderView();
    expect(screen.getByText('Grade 5 Content Blueprint')).toBeInTheDocument();
    expect(screen.getByText('Curriculum Structure & Standard Blueprints')).toBeInTheDocument();
  });
});

describe('CurriculumView domain ready check (F5)', () => {
  beforeEach(() => localStorage.clear());

  it('F5: a domain with 63 of 79 right (shows 79%, not 80%) is not treated as ready', () => {
    const code = getCurriculum(5).domains.find((d) => d.id === 'NF')!.standards[0].code;
    const attempt: QuizAttempt = {
      id: 'a1', quizId: 'x', quizTitle: 'x', completedAt: '2026-09-30T00:00:00.000Z',
      scoreRaw: 63, scoreTotal: 79, scorePercent: 80, isPassingSSA: false, timeElapsedSeconds: 1,
      answers: Object.fromEntries(Array.from({ length: 79 }, (_, i) => [`q${i}`, { questionId: `q${i}`, studentAnswer: 'A', isCorrect: i < 63, standardCode: code }])),
    };
    saveState(localStorage, { version: 2, activeProfileId: 'p', profiles: [newProfile({ id: 'p', studentName: 'T', attempts: [attempt] })] });
    renderView();
    const score = screen.getByText('79%');
    expect(screen.queryByText('80%')).toBeNull();
    expect(score.className).toContain('text-amber-600');
    expect(score.className).not.toContain('text-emerald-600');
    // F3: the per-standard pill agrees with the number and never reads as ready.
    expect(screen.getByText(/Approaching \(79%\)/)).toBeInTheDocument();
    expect(screen.queryByText(/Ready \(/)).toBeNull();
  });
});
