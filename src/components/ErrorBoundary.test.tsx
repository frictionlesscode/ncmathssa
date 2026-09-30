import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';
import { createMemoryStorage } from '../state/memoryStorage';
import { STORAGE_KEY_V2, CORRUPT_KEY_PREFIX } from '../state/storage';

const Boom: React.FC = () => { throw new Error('boom'); };
const STORED = '{"version":2,"profiles":[],"activeProfileId":"x"}';

describe('ErrorBoundary', () => {
  beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { vi.restoreAllMocks(); });

  const setup = () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY_V2, STORED);
    const download = vi.fn();
    const onReload = vi.fn();
    render(<ErrorBoundary storage={storage} download={download} onReload={onReload}><Boom /></ErrorBoundary>);
    return { storage, download, onReload };
  };

  it('renders its children when nothing throws', () => {
    render(<ErrorBoundary><p>fine</p></ErrorBoundary>);
    expect(screen.getByText('fine')).toBeInTheDocument();
  });

  it('logic-flows High: shows a recovery screen instead of a white screen', () => {
    setup();
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
  });

  it('exports the raw stored JSON', async () => {
    const { download } = setup();
    await userEvent.click(screen.getByRole('button', { name: /export my data/i }));
    expect(download).toHaveBeenCalledTimes(1);
    expect(download.mock.calls[0][0]).toMatch(/^ncmath-progress-\d{4}-\d{2}-\d{2}\.json$/);
    expect(download.mock.calls[0][1]).toBe(STORED);
  });

  it('Start over keeps a backup copy, clears the live keys and reloads, after a confirm', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { storage, onReload } = setup();
    await userEvent.click(screen.getByRole('button', { name: /start over/i }));
    expect(confirm).toHaveBeenCalled();
    expect(storage.getItem(STORAGE_KEY_V2)).toBeNull();
    const backups = Array.from({ length: storage.length }, (_, i) => storage.key(i) as string).filter((k) => k.startsWith(CORRUPT_KEY_PREFIX));
    expect(backups).toHaveLength(1);
    expect(storage.getItem(backups[0])).toBe(STORED);
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('Start over does nothing when the parent cancels', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { storage, onReload } = setup();
    await userEvent.click(screen.getByRole('button', { name: /start over/i }));
    expect(storage.getItem(STORAGE_KEY_V2)).toBe(STORED);
    expect(onReload).not.toHaveBeenCalled();
  });

  it('logic-flows High: Start over never deletes data it could not back up', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const inner = createMemoryStorage();
    inner.setItem(STORAGE_KEY_V2, STORED);
    const storage = Object.create(inner) as Storage;
    storage.setItem = (k: string, v: string) => {
      if (k.startsWith(CORRUPT_KEY_PREFIX)) throw new Error('QuotaExceededError');
      inner.setItem(k, v);
    };
    const onReload = vi.fn();
    render(<ErrorBoundary storage={storage} download={vi.fn()} onReload={onReload}><Boom /></ErrorBoundary>);
    await userEvent.click(screen.getByRole('button', { name: /start over/i }));
    expect(inner.getItem(STORAGE_KEY_V2)).toBe(STORED);
    expect(screen.getByText(/couldn't make a backup copy, so nothing was deleted/i)).toBeInTheDocument();
    expect(onReload).not.toHaveBeenCalled();
  });
});
