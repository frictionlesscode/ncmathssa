import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ProgressProvider, useProgress } from './ProgressContext';
import { createMemoryStorage } from '../state/memoryStorage';
import { loadState, saveState, newProfile, STORAGE_KEY_V2 } from '../state/storage';
import type { AppStateV2 } from '../state/types';
import { att } from '../state/state.testkit';

function TabProbe() {
  const { profile, state, updateActiveProfile, clearActiveProfileHistory, deleteProfile } = useProgress();
  return (
    <div>
      <span data-testid="attempts">{profile.attempts.map((a) => a.id).join(',')}</span>
      <span data-testid="name">{profile.studentName}</span>
      <span data-testid="profiles">{state.profiles.map((p) => p.id).join(',')}</span>
      <span data-testid="session-at">{profile.activeSessionAt ?? ''}</span>
      <button onClick={() => updateActiveProfile({ studentName: 'Renamed' })}>rename</button>
      <button onClick={() => updateActiveProfile({ activeSession: undefined })}>drop-session</button>
      <button onClick={clearActiveProfileHistory}>clear</button>
      <button onClick={() => deleteProfile('p2')}>delete-p2</button>
    </div>
  );
}

const seed = (s: Storage, over: Partial<AppStateV2> = {}) => {
  const state: AppStateV2 = {
    version: 2, activeProfileId: 'p1',
    profiles: [newProfile({ id: 'p1', studentName: 'Alex' }), newProfile({ id: 'p2', studentName: 'Bea' })],
    ...over,
  };
  saveState(s, state);
  return state;
};
const mount = (s: Storage) => render(<ProgressProvider storageAccess={() => s}><TabProbe /></ProgressProvider>);
const click = (label: string) => act(() => screen.getByText(label).click());
const storageEvent = () => act(() => { window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY_V2 })); });

describe('multi-tab', () => {
  it('logic-flows High: another tab\'s attempt survives this tab\'s next save', () => {
    const s = createMemoryStorage();
    const base = seed(s);
    mount(s);
    // The other tab writes an attempt into the shared key.
    saveState(s, { ...base, profiles: [{ ...base.profiles[0], attempts: [att('other-tab', '2026-09-30T10:00:00.000Z')] }, base.profiles[1]] });
    click('rename');
    const saved = loadState(s);
    expect(saved.profiles[0].attempts.map((a) => a.id)).toEqual(['other-tab']);
    expect(saved.profiles[0].studentName).toBe('Renamed');
    expect(screen.getByTestId('attempts')).toHaveTextContent('other-tab');
  });

  it('a storage event brings the other tab\'s attempt and edits into view without a save', () => {
    const s = createMemoryStorage();
    const base = seed(s);
    mount(s);
    saveState(s, { ...base, profiles: [{ ...base.profiles[0], studentName: 'Alex2', attempts: [att('other-tab', '2026-09-30T10:00:00.000Z')] }, base.profiles[1]] });
    storageEvent();
    expect(screen.getByTestId('attempts')).toHaveTextContent('other-tab');
    expect(screen.getByTestId('name')).toHaveTextContent('Alex2');
  });

  it('logic-flows High: "Clear history" is not undone by a stale stored copy', () => {
    const s = createMemoryStorage();
    const base = seed(s);
    saveState(s, {
      ...base,
      profiles: [
        { ...base.profiles[0], attempts: [att('old', '2020-01-01T00:00:00.000Z')], reviewQueue: { 'x': { box: 1, dueAt: '2020-01-02T00:00:00.000Z' } } as never, checkupSkipped: true },
        base.profiles[1],
      ],
    });
    mount(s);
    expect(screen.getByTestId('attempts')).toHaveTextContent('old');
    click('clear');
    expect(screen.getByTestId('attempts')).toBeEmptyDOMElement();
    expect(loadState(s).profiles[0].attempts).toEqual([]);
    expect(loadState(s).profiles[0].historyClearedAt).toBeTruthy();
    expect(loadState(s).profiles[0].reviewQueue).toEqual({});
    expect(loadState(s).profiles[0].checkupSkipped).toBeUndefined();
  });

  it('logic-flows High: a stale tab does not bring back the review queue or skip flag another tab cleared', () => {
    const s = createMemoryStorage();
    const base = seed(s);
    saveState(s, {
      ...base,
      profiles: [
        { ...base.profiles[0], reviewQueue: { 'x': { box: 1, dueAt: '2020-01-02T00:00:00.000Z' } } as never, checkupSkipped: true },
        base.profiles[1],
      ],
    });
    mount(s); // this tab now holds the stale copy
    // The other tab clears history and saves.
    const cleared = { ...base.profiles[0], attempts: [], reviewQueue: {}, historyClearedAt: new Date().toISOString() };
    delete (cleared as { checkupSkipped?: boolean }).checkupSkipped;
    saveState(s, { ...base, profiles: [cleared, base.profiles[1]] });
    click('rename'); // no storage event: the merge on save must do it
    const p1 = loadState(s).profiles[0];
    expect(p1.reviewQueue).toEqual({});
    expect(p1.checkupSkipped).toBeUndefined();
    expect(p1.studentName).toBe('Renamed');
  });

  it('logic-flows High: a deleted student is not brought back by a stale tab', () => {
    const s = createMemoryStorage();
    const base = seed(s);
    mount(s);
    click('delete-p2');
    expect(loadState(s).profiles.map((p) => p.id)).toEqual(['p1']);
    // A stale tab still holding both students writes its copy back.
    saveState(s, base);
    storageEvent();
    expect(screen.getByTestId('profiles')).toHaveTextContent('p1');
    expect(screen.getByTestId('profiles')).not.toHaveTextContent('p2');
  });

  it('stamps activeSessionAt when the saved session changes or is cleared', () => {
    const s = createMemoryStorage();
    seed(s);
    mount(s);
    expect(screen.getByTestId('session-at')).toBeEmptyDOMElement();
    click('drop-session');
    expect(screen.getByTestId('session-at').textContent).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
