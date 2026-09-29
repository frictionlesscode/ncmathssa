import React, { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { dueEntries } from '../engine/scheduler';
import { selectSession } from '../engine/sessionComposer';
import type { QuestionRef } from '../engine/questionModel';

const SESSION_SIZES = [10, 20, 30] as const;

interface AdaptiveSessionCardProps {
  onStart: (refs: QuestionRef[]) => void;
}

/** The daily-practice entry point: a short adaptive session built from due
 *  reviews plus standards the child is struggling with or hasn't seen, per
 *  `selectSession` (Task 11). This sits alongside the static quiz library,
 *  not in place of it - the diagnostic, module drills and full simulations
 *  remain the right tool for a realistic timed practice test. */
export const AdaptiveSessionCard: React.FC<AdaptiveSessionCardProps> = ({ onStart }) => {
  const { curriculum, profile, mastery } = useProgress();
  const [size, setSize] = useState<number>(SESSION_SIZES[0]);

  const dueCount = dueEntries(profile.reviewQueue, new Date()).length;

  const handleStart = () => {
    const refs = selectSession({
      curriculum,
      mastery,
      queue: profile.reviewQueue,
      size,
      now: new Date(),
      // A fresh seed per session keeps repeat sessions from serving
      // identical generated-question instances; the seed is only ever
      // read here, at click time, so a session already underway never
      // has its questions re-rolled by a re-render.
      seed: Date.now(),
    });
    onStart(refs);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-3xl p-6 border border-emerald-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-md">
            DAILY PRACTICE
          </span>
          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            {dueCount > 0 ? `${dueCount} review${dueCount === 1 ? '' : 's'} due` : 'No reviews due'}
          </span>
        </div>
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          Adaptive Practice Session
        </h3>
        <p className="text-xs text-slate-600 max-w-xl">
          A short mixed set built from your due reviews and the standards you're weakest on right
          now - not a fixed test, a quick daily tune-up.
        </p>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <label className="flex flex-col text-[11px] font-bold text-emerald-900 uppercase tracking-wide gap-1">
          Questions
          <select
            aria-label="Questions"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-emerald-300 text-sm font-semibold text-slate-800 bg-white"
          >
            {SESSION_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={handleStart}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-500/20 transition-all"
        >
          Start Practice Session
        </button>
      </div>
    </div>
  );
};
