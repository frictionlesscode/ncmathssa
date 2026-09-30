import React, { useState } from 'react';
import { useEscapeKey } from './useEscapeKey';
import { Calendar, Target, X, Check, ArrowRight, RotateCcw, Trash2 } from 'lucide-react';

import { useProgress, useReadinessSummary } from '../context/ProgressContext';
import { standardsOf } from '../curriculum/registry';
import { sessionSizeOf } from '../engine/activeSession';
import { countdownText } from '../engine/path';

interface StudyPaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyPaceModal: React.FC<StudyPaceModalProps> = ({ isOpen, onClose }) => {
  const { state, profile, curriculum, updateActiveProfile, clearActiveProfileHistory, deleteProfile } = useProgress();
  const readiness = useReadinessSummary();
  const totalStandardsCount = standardsOf(curriculum).length;
  const [name, setName] = useState(profile.studentName);
  const [examDate, setExamDate] = useState(profile.targetExamDate);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyQuestionGoal);
  const [sessionSize, setSessionSize] = useState(String(sessionSizeOf(profile)));
  const [saved, setSaved] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState<'clear' | 'delete' | null>(null);

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveProfile({
      studentName: name,
      targetExamDate: examDate,
      dailyQuestionGoal: Number(dailyGoal),
      sessionSize: sessionSizeOf({ sessionSize: Number(sessionSize) }),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="pace-title" className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-500/20">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h3 id="pace-title" className="text-lg font-bold text-slate-900">Study Plan & Testing Pace</h3>
              <p className="text-xs text-slate-500">Wake County SSA Exam Timeline & Daily Target</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Student Name */}
          <div>
            <label htmlFor="pace-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Student Name
            </label>
            <input
              id="pace-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              required
            />
          </div>

          {/* Target Exam Date */}
          <div>
            <label htmlFor="pace-date" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              WCPSS SSA Testing Date / Window
            </label>
            <input
              id="pace-date"
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              required
            />
            {readiness.daysUntilExam !== null && (
              <p className="text-[11px] text-slate-500 mt-1">
                {readiness.daysUntilExam > 0
                  ? `${countdownText(readiness.daysUntilExam, 'days remaining')} until test window.`
                  : countdownText(readiness.daysUntilExam, 'days remaining')}
              </p>
            )}
          </div>

          {/* Goals */}
          <div>
            <label htmlFor="pace-daily" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              Daily Questions
            </label>
            <input
              id="pace-daily"
              type="number"
              min="3"
              max="50"
              value={dailyGoal}
              onChange={e => setDailyGoal(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Questions per session */}
          <div>
            <label htmlFor="pace-session-size" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Questions per session
            </label>
            <input
              id="pace-session-size"
              type="number"
              value={sessionSize}
              onChange={(e) => setSessionSize(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          {/* Pace Analysis Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-emerald-950">
              <span>Recommended Daily Pace:</span>
              <span className="px-2 py-0.5 bg-emerald-200/80 rounded-full font-extrabold text-emerald-900">
                {readiness.dailyQuestionsPace} questions/day
              </span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              At this pace, you will cover all {totalStandardsCount} Grade {curriculum.grade} NCSCOS standards, reinforce weak spots, and complete full mock assessments well before testing.
            </p>
          </div>

          {/* Data controls */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            {confirmingAction === 'clear' ? (
              <div className="space-y-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <p className="text-[11px] font-semibold text-rose-800">
                  Erase all test history and review queue for this student? This also restarts their path. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { clearActiveProfileHistory(); setConfirmingAction(null); }}
                    className="flex-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition-colors"
                  >
                    Yes, erase history
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingAction(null)}
                    className="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingAction('clear')}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                Clear history
              </button>
            )}

            {state.profiles.length > 1 && (
              confirmingAction === 'delete' ? (
                <div className="space-y-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-[11px] font-semibold text-rose-800">
                    Delete this student, including their history? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { deleteProfile(profile.id); setConfirmingAction(null); onClose(); }}
                      className="flex-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition-colors"
                    >
                      Yes, delete student
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingAction(null)}
                      className="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingAction('delete')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete student
                </button>
              )
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                <>
                  Save Plan <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
