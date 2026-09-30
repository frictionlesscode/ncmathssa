import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider } from '../context/ProgressContext';
import { ParentHome } from './ParentHome';
import { newProfile, saveState } from '../state/storage';
import type { Profile } from '../state/types';
import { buildReadinessAttempt } from '../state/readiness.testkit';

const ymd = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
function renderHome(over: Partial<Profile> = {}, extraProfiles: Profile[] = []) {
  const p = newProfile({ id: 'p1', studentName: 'Alex', grade: 5, ...over });
  saveState(localStorage, { version: 2, profiles: [p, ...extraProfiles], activeProfileId: 'p1' });
  const h = { onStartStep: vi.fn(), onContinue: vi.fn(), onOpenDetailed: vi.fn(), onSwitchStudent: vi.fn(), onAddStudent: vi.fn() };
  const utils = render(<ProgressProvider><ParentHome {...h} /></ProgressProvider>);
  return { ...h, ...utils };
}

describe('ParentHome', () => {
  beforeEach(() => localStorage.clear());

  it('shows the tracker and never "0 days" without a date', () => {
    const { container } = renderHome();
    expect(screen.getByText('Alex · Grade 5 math')).toBeInTheDocument();
    expect(screen.getByText(/0% ready/)).toBeInTheDocument();
    expect(screen.getByText(/goal: 80%/)).toBeInTheDocument();
    expect(screen.getByText(/add a test date to get a weekly plan/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/0 days/);
  });

  it('never shows NC codes, domain ids or blueprint weight bands', () => {
    const { container } = renderHome();
    expect(container.textContent).not.toMatch(/NC\.\d|\bNBT\b|\bOA\b|\bNF\b|\bMD\b|\bG\b|\d+\s*[-–]\s*\d+\s*%/);
  });

  it('starts with the check-up and can skip it', async () => {
    const h = renderHome();
    await userEvent.click(screen.getByRole('button', { name: /start the check-up/i }));
    expect(h.onStartStep).toHaveBeenCalledWith({ kind: 'checkup', quizId: 'diagnostic-01' });
    await userEvent.click(screen.getByRole('button', { name: /skip and start practicing/i }));
    expect(screen.getByRole('button', { name: /start today's practice \(round 1\)/i })).toBeInTheDocument();
  });

  it('offers Continue for a saved session and can discard it', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const h = renderHome({ activeSession: {
      kind: 'practice', quizId: 'path-practice-1', title: 'Round 1 practice',
      refs: [{ kind: 'authored', id: 'a' }, { kind: 'authored', id: 'b' }],
      answers: { a: { selected: 'A', isCorrect: true } }, flagged: {}, currentIndex: 1,
      startedAt: '2026-09-30T00:00:00Z', secondsElapsed: 0,
    } });
    await userEvent.click(screen.getByRole('button', { name: /continue — 1 of 2 done/i }));
    expect(h.onContinue).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: /start fresh instead/i }));
    expect(confirm).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /start the check-up/i })).toBeInTheDocument();
  });

  it('shows weeks left and a weekly plan for a date far out', () => {
    renderHome({ targetExamDate: ymd(42) });
    expect(screen.getByText(/6 weeks left/)).toBeInTheDocument();
    expect(screen.getByText(/on track/i)).toBeInTheDocument();
    expect(screen.getByText(/plan: about \d+ sessions? a week/i)).toBeInTheDocument();
  });

  it('switches to short-on-time advice within 14 days', () => {
    renderHome({ targetExamDate: ymd(7) });
    expect(screen.getByText(/7 days left/)).toBeInTheDocument();
    expect(screen.getByText(/short on time/i)).toBeInTheDocument();
    expect(screen.getByText(/round 3: test-ready \(optional\)/i)).toBeInTheDocument();
  });

  it('says "Test is today" rather than 0 days', () => {
    const { container } = renderHome({ targetExamDate: ymd(0) });
    expect(screen.getByText(/test is today/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/0 days/);
  });

  it('asks to update a passed date', () => {
    renderHome({ targetExamDate: ymd(-3) });
    expect(screen.getByText(/test date passed/i)).toBeInTheDocument();
  });

  it('saves a test date typed inline', () => {
    renderHome();
    fireEvent.change(screen.getByLabelText(/test date/i), { target: { value: ymd(42) } });
    expect(screen.getByText(/weeks left/)).toBeInTheDocument();
  });

  it('Settings shows the date set through the inline input', async () => {
    renderHome();
    fireEvent.change(screen.getByLabelText(/test date/i), { target: { value: ymd(42) } });
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    // The inline input is gone once a date is set, so this is the modal's field.
    expect(screen.getByDisplayValue(ymd(42))).toBeInTheDocument();
  });

  it('dates the "Ready to try for SSA" line', () => {
    renderHome({ attempts: [{
      id: 'm1', quizId: 'mock-ssa-01', quizTitle: 'Mock', completedAt: new Date(2026, 10, 2, 12).toISOString(),
      scoreRaw: 9, scoreTotal: 10, scorePercent: 90, isPassingSSA: true, timeElapsedSeconds: 0, answers: {},
    }] });
    expect(screen.getByText(/Ready to try for SSA.*passed Nov 2/)).toBeInTheDocument();
  });

  it('shows Switch student only with more than one student', () => {
    const first = renderHome();
    expect(screen.queryByRole('button', { name: /switch student/i })).not.toBeInTheDocument();
    first.unmount();
    localStorage.clear();
    renderHome({}, [newProfile({ id: 'p2', studentName: 'Sam' })]);
    expect(screen.getByRole('button', { name: /switch student/i })).toBeInTheDocument();
  });
});

describe('ParentHome short-on-time path (F1)', () => {
  beforeEach(() => localStorage.clear());

  it('F1: shows Round 1 as skipped, not finished, and never "Ahead"', () => {
    const { container } = renderHome({ targetExamDate: ymd(7), checkupSkipped: true });
    expect(screen.getByText(/round 1: try every topic \(skipped\)/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/✔ Round 1/);
    expect(container.textContent).not.toMatch(/ahead/i);
  });

  it('F1: test date today shows Round 1 skipped, never a check mark, never "Ahead"', () => {
    const { container } = renderHome({ targetExamDate: ymd(0), checkupSkipped: true });
    expect(screen.getByText(/round 1: try every topic \(skipped\)/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/✔ Round 1/);
    expect(container.textContent).not.toMatch(/ahead/i);
  });
});

describe('ParentHome readiness and topic captions', () => {
  beforeEach(() => localStorage.clear());

  it('F3: 79.6% shows as 79% and not ready', () => {
    renderHome({ attempts: [buildReadinessAttempt(250, 199)] });
    expect(screen.getByTestId('readiness-tracker')).toHaveTextContent(/79% ready/);
    expect(screen.getByTestId('readiness-tracker')).toHaveAttribute('data-readiness-state', 'building');
  });

  it('F7: explains that topic labels use every answer while rounds use the recent ones', () => {
    renderHome();
    expect(screen.getByText(/topics are labelled from all answers so far/i)).toBeInTheDocument();
  });
});
