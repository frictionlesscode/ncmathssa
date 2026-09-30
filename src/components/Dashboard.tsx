import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';
import { useProgress, useReadinessSummary, domainStatsFor } from '../context/ProgressContext';
import { standardsOf, weightCompactLabel } from '../curriculum/registry';
import { dueEntries } from '../engine/scheduler';
import { countdownText } from '../engine/path';
import type { NavTab } from './Navbar';

interface DashboardProps {
  onStartQuiz: (quizId: string) => void;
  onOpenStudyGuide: (standardCode: string) => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenPaceModal: () => void;
  onOpenReportModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartQuiz,
  onOpenStudyGuide,
  onNavigateTab,
  onOpenPaceModal,
  onOpenReportModal
}) => {
  const { profile, curriculum, mastery } = useProgress();
  const readiness = useReadinessSummary();
  const passingPercent = curriculum.ssa.passingPercent;
  const totalStandardsCount = standardsOf(curriculum).length;
  const dueReviewCount = dueEntries(profile.reviewQueue, new Date()).length;

  // Both are found by their flag, not by a literal id: Grade 4's are
  // `g4-diagnostic-01` and `g4-mock-ssa-01`, so a grade-5 id here would
  // silently blank the simulation card and leave the diagnostic prompt
  // showing forever for every other grade.
  const diagnosticQuiz = curriculum.quizzes.find(q => q.isDiagnostic);
  const mockQuiz = curriculum.quizzes.find(q => q.isMockAssessment);

  // Check if diagnostic has been taken
  const hasTakenDiagnostic = !!diagnosticQuiz
    && profile.attempts.some(a => a.quizId === diagnosticQuiz.id);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Assessment Reality & Honesty Disclaimer Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-mono text-[11px] font-bold border border-blue-500/30">
                WCPSS SSA REALITY & METHODOLOGY
              </span>
              <span className="text-xs text-slate-400">Collaborative Assessment Solutions for Educators (CASE)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Target: Master Grade {curriculum.grade} to Skip to Grade {curriculum.ssa.targetsGrade + 1} Math
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Wake County administers a secure, above-grade-level assessment built by CASE. The actual item bank is confidential, so this platform builds complete mastery against the public, authoritative <strong className="text-white">North Carolina Standard Course of Study (NCSCOS) Grade {curriculum.grade} Mathematics</strong> {curriculum.weighting.kind === 'ncdpi-blueprint' ? 'blueprint' : 'standards'} with multi-step reasoning, non-routine word problems, and above-grade stretch challenges.
            </p>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 min-w-[220px] text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              SSA Qualifying Bar
            </span>
            <div className="text-3xl font-black text-emerald-400">{passingPercent}% +</div>
            <p className="text-[11px] text-slate-400 mt-1">
              {readiness.isAccelerationReady ? (
                <span className="text-emerald-400 font-bold">Currently Meeting Bar!</span>
              ) : (
                <span>Need {Math.max(0, passingPercent - readiness.weightedScore)}% more for SSA threshold</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Hero Stats & Readiness Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Readiness Meter Card */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Overall SSA Readiness Gauge</h3>
                <p className="text-xs text-slate-500">
                  {curriculum.weighting.kind === 'ncdpi-blueprint'
                    ? 'Weighted by official NC EOG blueprint domain weights'
                    : `Weighted by each domain's share of Grade ${curriculum.grade} standards — no state test exists at this grade`}
                </p>
              </div>
            </div>
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
              readiness.isAccelerationReady
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {readiness.isAccelerationReady ? `Acceleration-Ready (≥${passingPercent}%)` : 'Approaching Mastery'}
            </span>
          </div>

          {/* Progress Bar with passing % Qualifying Marker */}
          <div className="space-y-2 my-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600">Current Composite: {readiness.weightedScore}%</span>
              <span className="text-emerald-700">WCPSS Qualifying Target: {passingPercent}%</span>
            </div>
            <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  readiness.isAccelerationReady
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}
                style={{ width: `${Math.min(100, readiness.weightedScore)}%` }}
              />
              {/* passing % Bar Marker */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-emerald-600 z-10"
                style={{ left: `${passingPercent}%` }}
                title={`${passingPercent}% SSA Bar`}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0% (Untested)</span>
              <span className="font-bold text-emerald-700">{passingPercent}% SSA Bar</span>
              <span>100% (Full Mastery)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-600">
            <span>
              <strong>{readiness.masteredStandardsCount}</strong> of {totalStandardsCount} Standards Mastered
            </span>
            <button
              onClick={onOpenReportModal}
              className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Full Report <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pace & Exam Countdown Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                <Calendar className="w-5 h-5" />
              </span>
              <button
                onClick={onOpenPaceModal}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Change Date
              </button>
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Countdown</h3>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {readiness.daysUntilExam === null ? (
                <span className="text-base font-normal text-slate-500">No test date set</span>
              ) : (
                readiness.daysUntilExam <= 0 ? (
                  <span className="text-base font-normal text-slate-500">
                    {countdownText(readiness.daysUntilExam, 'days left')}
                  </span>
                ) : (
                  <>
                    {readiness.daysUntilExam} <span className="text-base font-normal text-slate-500">{readiness.daysUntilExam === 1 ? 'day' : 'days'} left</span>
                  </>
                )
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Target: {profile.targetExamDate || 'Not set'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-700">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">Recommended Pace:</span>
              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {readiness.dailyQuestionsPace} Qs / Day
              </span>
            </div>
          </div>
        </div>

        {/* Practice Stats Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 bg-violet-100 text-violet-700 rounded-2xl">
                <TrendingUp className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
                {profile.attempts.length} Quizzes Taken
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Questions Practiced</h3>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {readiness.totalQuestionsAnswered}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {readiness.totalCorrectAnswered} correct ({readiness.overallAccuracy}% accuracy)
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Active Weak Spots:</span>
            {dueReviewCount > 0 ? (
              <button
                onClick={() => onNavigateTab('weakspots')}
                className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                {dueReviewCount} Due for Review <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="font-semibold text-emerald-600">0 unmastered!</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Launch Action Hero */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-blue-100 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Recommended Next Step
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {!hasTakenDiagnostic
              ? `Step 1: Take the ${diagnosticQuiz?.questionIds.length ?? totalStandardsCount}-Question Baseline Diagnostic`
              : readiness.weightedScore >= passingPercent
              ? 'Acceleration Ready! Complete a Full 60-Minute Mock Exam'
              : curriculum.weighting.kind === 'ncdpi-blueprint'
              ? `Drill High-Weight Domains to Reach the ${passingPercent}% Benchmark`
              : `Drill the Domains Furthest Below the ${passingPercent}% Benchmark`}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            {!hasTakenDiagnostic
              ? `Test all ${totalStandardsCount} Grade ${curriculum.grade} NCSCOS standards in a single ${diagnosticQuiz?.timeLimitMinutes ?? 45}-minute test to establish your baseline and pinpoint exact focus areas.`
              : 'Practice under authentic test conditions: strict test mode, no mid-quiz hints, all multiple-choice questions.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {!hasTakenDiagnostic && diagnosticQuiz ? (
            <button
              onClick={() => onStartQuiz(diagnosticQuiz.id)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-sm rounded-2xl shadow-md transition-all hover:scale-105"
            >
              Start Diagnostic Test <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              {mockQuiz && (
                <button
                  onClick={() => onStartQuiz(mockQuiz.id)}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-sm rounded-2xl shadow-md transition-all hover:scale-105"
                >
                  Full Mock Exam <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {dueReviewCount > 0 && (
                <button
                  onClick={() => onNavigateTab('weakspots')}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-800/80 hover:bg-blue-800 text-white font-bold text-sm rounded-2xl border border-white/20 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Practice Missed Qs ({dueReviewCount})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Domain Curriculum Modules Overview */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900">
              Grade {curriculum.grade} Program of Study: {curriculum.domains.length} Core NC Domains
            </h2>
            <p className="text-xs text-slate-500">
              Each module is strictly benchmarked against the {passingPercent}% acceleration qualifying bar.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('curriculum')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Explore All {totalStandardsCount} Standards <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {curriculum.domains.map(domain => {
            const dm = domainStatsFor(domain, mastery, passingPercent);
            const isReady = dm.masteryPercent >= passingPercent;

            // Find drill quiz for this domain
            const drillQuiz = curriculum.quizzes.find(q => q.domainId === domain.id);

            return (
              <div
                key={domain.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Domain Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span
                        className={`inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border ${domain.badgeBg}`}
                        title={domain.weightGroupLabel}
                      >
                        {domain.id} • {weightCompactLabel(curriculum, domain.id)} Weight
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1.5 leading-snug">
                        {domain.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      {dm.status === 'untested' ? (
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Untested
                        </span>
                      ) : (
                        <div className="text-right">
                          <span className={`text-xl font-black ${isReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {dm.masteryPercent}%
                          </span>
                          <span className={`block text-[10px] font-bold uppercase ${isReady ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {isReady ? 'Ready' : `Below ${passingPercent}%`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {domain.description}
                  </p>

                  {/* Standards List preview */}
                  <div className="space-y-1.5 mb-4">
                    {domain.standards.map(std => (
                      <div
                        key={std.code}
                        onClick={() => onOpenStudyGuide(std.code)}
                        className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 cursor-pointer transition-colors"
                      >
                        <span className="font-mono font-bold text-slate-800">{std.code}</span>
                        <span className="text-slate-500 truncate max-w-[170px] text-[11px]">
                          {std.title}
                        </span>
                        <BookOpen className="w-3.5 h-3.5 text-blue-500 opacity-60" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    {dm.standardsMastered} of {domain.standards.length} Mastered
                  </span>
                  {drillQuiz && (
                    <button
                      onClick={() => onStartQuiz(drillQuiz.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Take Domain Drill
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Test History */}
      {profile.attempts.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Recent Test History & Scores</h3>
              <p className="text-xs text-slate-500">All tests taken in test conditions with {passingPercent}% benchmark validation</p>
            </div>
            <button
              onClick={onOpenReportModal}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Export Report
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {profile.attempts.slice(0, 5).map(attempt => (
              <div key={attempt.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{attempt.quizTitle}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      attempt.isPassingSSA
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {attempt.isPassingSSA ? `SSA Passed (≥${passingPercent}%)` : `Needs Practice (<${passingPercent}%)`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Completed {new Date(attempt.completedAt).toLocaleDateString()} • {Math.round(attempt.timeElapsedSeconds / 60)} minutes
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div>
                    <span className={`text-lg font-black ${
                      attempt.isPassingSSA ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {attempt.scorePercent}%
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {attempt.scoreRaw} / {attempt.scoreTotal} Correct
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
