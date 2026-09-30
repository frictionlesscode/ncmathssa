import { STORAGE_KEY_V1, STORAGE_KEY_V2 } from './storage';

export const exportFilename = (now: Date = new Date()) => `ncmath-progress-${now.toISOString().slice(0, 10)}.json`;

/** Saves `text` as a file through a temporary link. */
export function downloadText(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** The stored progress exactly as saved (v2, else v1), or '' when there is none. */
export function rawStoredJson(storage: Storage): string {
  try {
    return storage.getItem(STORAGE_KEY_V2) ?? storage.getItem(STORAGE_KEY_V1) ?? '';
  } catch {
    return '';
  }
}
