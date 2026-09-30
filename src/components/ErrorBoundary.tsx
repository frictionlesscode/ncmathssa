import React from 'react';
import { STORAGE_KEY_V1, STORAGE_KEY_V2, backupRaw, getBrowserStorage } from '../state/storage';
import { downloadText, exportFilename, rawStoredJson } from '../state/exportData';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Test seams; the defaults are the real browser. */
  storage?: Storage;
  download?: (filename: string, text: string) => void;
  onReload?: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
  backupFailed?: boolean;
}

/** Last line of defence: a render crash shows a way to save the data and
 *  start over instead of a white screen. Stored progress is never touched
 *  unless the parent picks "Start over", and even then a copy is kept. */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Unhandled render error', error);
  }

  private storage(): Storage {
    return this.props.storage ?? getBrowserStorage().storage;
  }

  private exportData = () => {
    const text = rawStoredJson(this.storage()) || '{}';
    (this.props.download ?? downloadText)(exportFilename(), text);
  };

  private startOver = () => {
    if (!window.confirm('Start over? A backup copy of your saved data stays on this device, but the app will start empty.')) return;
    const storage = this.storage();
    const now = new Date();
    let backupFailed = false;
    try {
      for (const key of [STORAGE_KEY_V2, STORAGE_KEY_V1]) {
        const raw = storage.getItem(key);
        if (raw && !backupRaw(storage, raw, now)) {
          backupFailed = true; // never delete what we could not copy
          continue;
        }
        storage.removeItem(key);
      }
    } catch {
      // Storage is unusable; reloading is still the best we can do.
    }
    if (backupFailed) {
      this.setState({ backupFailed: true });
      return;
    }
    (this.props.onReload ?? (() => window.location.reload()))();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 text-center space-y-4">
          <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
          <p className="text-sm text-slate-600">
            Your saved progress has not been deleted. If you are unsure, export a copy first.
          </p>
          {this.state.backupFailed && (
            <p className="text-sm text-red-700">
              Couldn't make a backup copy, so nothing was deleted. Use Export first.
            </p>
          )}
          <div className="flex flex-col gap-2">
            <button onClick={this.exportData} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Export my data
            </button>
            <button onClick={this.startOver} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Start over
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
