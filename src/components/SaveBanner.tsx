import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { downloadText, exportFilename } from '../state/exportData';

/** Persistent warning when progress cannot be written to this device. Export
 *  hands over the CURRENT in-memory state, not the (stale) stored copy. */
export const SaveBanner: React.FC = () => {
  const { saveOk, state } = useProgress();
  if (saveOk) return null;
  return (
    <div role="alert" className="bg-rose-50 border-b border-rose-200 px-4 py-3 text-center text-sm text-rose-900">
      {"Progress isn't being saved on this device"}
      <button
        onClick={() => downloadText(exportFilename(), JSON.stringify(state, null, 2))}
        className="ml-3 rounded-md border border-rose-300 bg-white px-2 py-0.5 text-xs font-semibold text-rose-900 hover:bg-rose-100"
      >
        Export
      </button>
    </div>
  );
};

export default SaveBanner;
