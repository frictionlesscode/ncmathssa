import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { DISCLAIMER_STORAGE_KEY, DISCLAIMER_VERSION } from './components/DisclaimerGate';
import { newProfile, saveState, loadState } from './state/storage';
import { questionRefId } from './engine/questionModel';

// Spec 3.3: every session records the content version of each of its
// questions the moment it starts, so a later deploy that rewrites one is
// noticed on resume.

describe('starting a session', () => {
  beforeEach(() => localStorage.clear());

  it('stamps the content version of every question (spec 3.3)', async () => {
    localStorage.setItem(
      DISCLAIMER_STORAGE_KEY,
      JSON.stringify({ version: DISCLAIMER_VERSION, acceptedAt: '2026-09-30T00:00:00.000Z' }),
    );
    const p = newProfile({ id: 'a', studentName: 'Alex', checkupSkipped: true, sessionSize: 5 });
    saveState(localStorage, { version: 2, profiles: [p], activeProfileId: 'a' });
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start today's practice \(round 1\)/i }));
    const s = loadState(localStorage).profiles[0].activeSession!;
    expect(Object.keys(s.versions ?? {}).sort()).toEqual(s.refs.map((r) => questionRefId(r)).sort());
    expect(Object.values(s.versions!).every((v) => v === 1)).toBe(true);
  });
});
