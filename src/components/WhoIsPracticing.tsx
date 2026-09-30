import React from 'react';
import { useProgress } from '../context/ProgressContext';

/** Shown on startup when a family has two or more students (spec 8). */
export const WhoIsPracticing: React.FC<{ onChosen: () => void; onAddStudent: () => void }> = ({ onChosen, onAddStudent }) => {
  const { state, switchProfile } = useProgress();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Who&rsquo;s practicing today?</h1>
        <div className="space-y-2">
          {state.profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => { switchProfile(p.id); onChosen(); }}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
            >
              <span className="font-semibold text-slate-900">{p.studentName || 'Unnamed student'}</span>
              <span className="ml-2 text-sm text-slate-500">Grade {p.grade}</span>
            </button>
          ))}
        </div>
        <button onClick={onAddStudent} className="text-sm text-blue-700 underline">Add another student</button>
      </div>
    </div>
  );
};

export default WhoIsPracticing;
