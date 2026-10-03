import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { DISCLAIMER_STORAGE_KEY, DISCLAIMER_VERSION } from './components/DisclaimerGate';
import { newProfile, saveState, loadState } from './state/storage';
import { questionRefId } from './engine/questionModel';
import { c5 } from './engine/path.testkit';
import { newSession, stampContentVersions } from './engine/activeSession';

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
    for (const r of s.refs) expect(s.versions![questionRefId(r)], questionRefId(r)).toBe(c5.source.versionOf(r));
  });

  it('stamps 2 for a rewritten item and 1 for an untouched one', () => {
    const refs = [{ kind: 'authored' as const, id: 'nf1-01' }, { kind: 'authored' as const, id: 'nf1-03' }];
    const s = stampContentVersions(newSession({ kind: 'practice', quizId: 'x', title: 'x', refs, now: new Date(2026, 8, 1) }), c5);
    expect(s.versions).toEqual({ 'nf1-01': 2, 'nf1-03': 1 });
  });
});
