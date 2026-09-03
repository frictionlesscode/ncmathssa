import React, { useState } from 'react';
import { Calendar, Target, Clock, X, Check, ArrowRight } from 'lucide-react';

import { useProgress } from '../context/ProgressContext';

interface StudyPaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyPaceModal: React.FC<StudyPaceModalProps> = ({ isOpen, onClose }) => {
  const { state, updateSettings, overallReadiness } = useProgress();
  const [name, setName] = useState(state.settings.studentName);
  const [examDate, setExamDate] = useState(state.settings.targetExamDate);
  const [dailyGoal, setDailyGoal] = useState(state.settings.dailyQuestionGoal);
  const [weeklyHours, setWeeklyHours] = useState(state.settings.weeklyStudyGoalHours);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studentName: name,
      targetExamDate: examDate,
      dailyQuestionGoal: Number(dailyGoal),
      weeklyStudyGoalHours: Number(weeklyHours)
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-500/20">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Study Plan & Testing Pace</h3>
              <p className="text-xs text-slate-500">Wake County SSA Exam Timeline & Daily Target</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Student Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              required
            />
          </div>

          {/* Target Exam Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              WCPSS SSA Testing Date / Window
            </label>
            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {overallReadiness.daysUntilExam} days remaining until test window.
            </p>
          </div>

          {/* Goals */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                Daily Questions
              </label>
              <input
                type="number"
                min="3"
                max="50"
                value={dailyGoal}
                onChange={e => setDailyGoal(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Target Weekly Hours
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={weeklyHours}
                onChange={e => setWeeklyHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pace Analysis Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-emerald-950">
              <span>Recommended Daily Pace:</span>
              <span className="px-2 py-0.5 bg-emerald-200/80 rounded-full font-extrabold text-emerald-900">
                {overallReadiness.dailyQuestionsPace} questions/day
              </span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              At this pace, you will cover all 16 Grade 5 NCSCOS standards, reinforce weak spots, and complete full mock assessments well before testing.
            </p>
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
