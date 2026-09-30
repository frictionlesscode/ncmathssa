import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressProvider } from '../context/ProgressContext';
import { ParentHome } from './ParentHome';
import { Dashboard } from './Dashboard';
import { Navbar } from './Navbar';
import { newProfile, saveState } from '../state/storage';
import { buildReadinessAttempt } from '../state/readiness.testkit';

/** For one seeded profile, ParentHome, Dashboard and Navbar must show the
 *  same readiness number and the same ready / not-ready state. */
const cases = [
  { name: 'one perfect answer per standard', per: 1, correct: 1, shown: 25, state: 'building' },
  { name: '79.6% accuracy on every standard', per: 250, correct: 199, shown: 79, state: 'building' },
  { name: 'exactly 80% with enough answers per standard', per: 5, correct: 4, shown: 80, state: 'ready' },
] as const;

describe('cross-screen readiness', () => {
  beforeEach(() => localStorage.clear());

  it.each(cases)('$name: all three screens agree', ({ per, correct, shown, state }) => {
    saveState(localStorage, {
      version: 2, activeProfileId: 'p',
      profiles: [newProfile({ id: 'p', studentName: 'Alex', attempts: [buildReadinessAttempt(per, correct)], checkupSkipped: true })],
    });
    render(
      <ProgressProvider>
        <Navbar currentTab="dashboard" onSelectTab={vi.fn()} onOpenPaceModal={vi.fn()} onOpenReportModal={vi.fn()} />
        <ParentHome onStartStep={vi.fn()} onContinue={vi.fn()} onOpenDetailed={vi.fn()} onSwitchStudent={vi.fn()} onAddStudent={vi.fn()} />
        <Dashboard onStartQuiz={vi.fn()} onOpenStudyGuide={vi.fn()} onNavigateTab={vi.fn()} onOpenPaceModal={vi.fn()} onOpenReportModal={vi.fn()} />
      </ProgressProvider>,
    );

    const tracker = screen.getByTestId('readiness-tracker');
    expect(tracker).toHaveTextContent(new RegExp(`(?<!\\d)${shown}% ready`));
    expect(screen.getByText(new RegExp(`Current Composite: ${shown}%`))).toBeInTheDocument();
    expect(screen.getByTestId('readiness-pill')).toHaveTextContent(new RegExp(`Readiness\\s*${shown}%`));

    for (const el of [tracker, screen.getByTestId('readiness-badge'), screen.getByTestId('readiness-pill')]) {
      expect(el).toHaveAttribute('data-readiness-state', state);
    }
  });
});
