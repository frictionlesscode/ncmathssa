import React from 'react';
import { Printer, X, Award, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { useProgress, useReadinessSummary, domainStatsFor } from '../context/ProgressContext';
import { standardsOf, weightHeading, weightValue } from '../curriculum/registry';
import { topMisconceptionFamilies } from '../engine/mastery';
import { MISCONCEPTIONS, familyLabel } from '../curriculum/misconceptions';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose }) => {
  const { profile, curriculum, mastery } = useProgress();
  const readiness = useReadinessSummary();
  const passingPercent = curriculum.ssa.passingPercent;
  const standards = standardsOf(curriculum);
  const misconceptions = topMisconceptionFamilies(mastery, 5);

  // Finding F4: recommendation 3 used to hardcode grade 5's own "two full
  // mock exams within a 60-minute window" for every grade. Derive both the
  // count and the minutes from the active curriculum's actual mock quizzes -
  // grade 5 has two (60 and 65 minutes), every other registered grade has
  // one, and the sentence must read correctly for either.
  const mockQuizzes = curriculum.quizzes.filter(q => q.isMockAssessment);
  const mockCount = mockQuizzes.length;
  const mockCountWord = mockCount === 1 ? 'one' : mockCount === 2 ? 'two' : `${mockCount}`;
  const mockNoun = mockCount === 1 ? 'mock exam' : 'mock exams';
  const mockMinuteValues = mockQuizzes
    .map(q => q.timeLimitMinutes)
    .filter((m): m is number => typeof m === 'number');
  const mockWindowMinutes = mockMinuteValues.length > 0 ? Math.min(...mockMinuteValues) : 60;

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <Award className="w-5 h-5 text-blue-600" />
            Official Progress & Readiness Report
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" /> Print or Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-900 custom-scrollbar print:p-0 print:overflow-visible">
          {/* Document Header */}
          <div className="border-b-2 border-slate-800 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-blue-700 uppercase">
                  Wake County Public School System (WCPSS)
                </span>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-0.5">
                  Single Subject Acceleration (SSA) Readiness Evaluation
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Comprehensive mastery report aligned to the North Carolina Standard Course of Study (NCSCOS) for Grade {curriculum.grade} Mathematics.
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 font-semibold">Report Generated</div>
                <div className="text-sm font-bold text-slate-800">{todayStr}</div>
              </div>
            </div>

            {/* Student & Target Details Bar */}
            <div className="grid grid-cols-4 gap-4 mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Student:</span>
                <span className="font-bold text-slate-900 text-sm">{profile.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Grade:</span>
                <span className="font-bold text-slate-900 text-sm">Grade {curriculum.grade}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Target Assessment:</span>
                <span className="font-bold text-slate-900 text-sm">Grade {curriculum.ssa.targetsGrade} (Skip to {curriculum.ssa.targetsGrade + 1})</span>
              </div>
              <div>
                <span className="text-slate-500 block">SSA Qualifying Bar:</span>
                <span className="font-bold text-emerald-700 text-sm">{passingPercent}% or Higher</span>
              </div>
            </div>
          </div>

          {/* Readiness Summary Banner */}
          <div className={`p-6 rounded-2xl border flex items-center justify-between ${
            readiness.isAccelerationReady
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block opacity-75">
                Composite Grade-Level Readiness
              </span>
              <h2 className="text-3xl font-black mt-1">
                {readiness.weightedScore}% Weighted Readiness
              </h2>
              <p className="text-xs mt-1 font-medium max-w-lg">
                {readiness.isAccelerationReady
                  ? `Candidate has achieved the ${passingPercent}% acceleration threshold across tested standards. Continue maintaining readiness with timed full mock exams.`
                  : `Currently ${passingPercent - readiness.weightedScore}% below the ${passingPercent}% WCPSS qualifying bar. ${curriculum.weighting.kind === 'ncdpi-blueprint' ? 'Focused drill on high-weight domains is recommended.' : 'Focused drill on the domains furthest below the bar is recommended.'}`}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-xs ${
                readiness.isAccelerationReady
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-amber-500 text-white border-amber-600'
              }`}>
                {readiness.isAccelerationReady ? 'SSA Ready' : 'Approaching Benchmark'}
              </span>
              <span className="text-xs font-semibold text-slate-600 mt-2">
                {readiness.masteredStandardsCount} of {readiness.totalStandardsCount} Standards Mastered
              </span>
            </div>
          </div>

          {/* Domain Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Performance by NCSCOS Domain
            </h3>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <th className="p-2.5 font-bold">Domain</th>
                  <th className="p-2.5 font-bold">{weightHeading(curriculum)}</th>
                  <th className="p-2.5 font-bold">Questions Practiced</th>
                  <th className="p-2.5 font-bold">Mastery Score</th>
                  <th className="p-2.5 font-bold text-right">SSA Status (Bar: {passingPercent}%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {curriculum.domains.map(domain => {
                  const dm = domainStatsFor(domain, mastery, passingPercent);
                  return (
                    <tr key={domain.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">
                        {domain.name} ({domain.id})
                      </td>
                      <td className="p-2.5 text-slate-600 font-mono">
                        {weightValue(curriculum, domain.id)}
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {dm.totalQuestionsAnswered} ({dm.totalCorrect} correct)
                      </td>
                      <td className="p-2.5 font-bold">
                        {dm.status === 'untested' ? (
                          <span className="text-slate-400">Untested</span>
                        ) : (
                          <span className={dm.masteryPercent >= passingPercent ? 'text-emerald-600 font-extrabold' : 'text-amber-600 font-extrabold'}>
                            {dm.masteryPercent}%
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-semibold">
                        {dm.status === 'acceleration-ready' && (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Ready (≥{passingPercent}%)
                          </span>
                        )}
                        {dm.status === 'approaching' && (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Approaching
                          </span>
                        )}
                        {dm.status === 'needs-focus' && (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            Needs Focus
                          </span>
                        )}
                        {dm.status === 'untested' && (
                          <span className="text-slate-400 italic">Not tested</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Standard-by-Standard Detail */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Individual NCSCOS Standards Checklist ({standards.length} Total)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {standards.map(std => {
                const sm = mastery.get(std.code);
                return (
                  <div
                    key={std.code}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900 mr-2">{std.code}</span>
                      <span className="text-slate-600 text-[11px] truncate inline-block max-w-[200px] align-middle">
                        {std.title}
                      </span>
                    </div>
                    <div>
                      {sm?.status === 'acceleration-ready' ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> {Math.round(sm.percent)}%
                        </span>
                      ) : !sm || sm.status === 'untested' ? (
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" /> Untested
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {Math.round(sm.percent)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Misconceptions */}
          {misconceptions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Top Recurring Misconceptions
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {misconceptions.map(({ family, count, tags }) => {
                  const topTag = tags[0]?.tag;
                  const description = topTag ? MISCONCEPTIONS[topTag]?.description : undefined;
                  return (
                    <div
                      key={family}
                      className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-rose-900 font-semibold block">{familyLabel(family)}</span>
                        {description && (
                          <span className="text-rose-700 text-[11px] leading-snug block mt-0.5">
                            {description}
                          </span>
                        )}
                      </div>
                      <span className="text-rose-700 font-mono font-bold whitespace-nowrap">{count}×</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Parent Strategy Recommendations */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <h4 className="font-bold text-slate-900">Next Steps & Testing Recommendation:</h4>
            <p className="leading-relaxed">
              1. <strong>{curriculum.weighting.kind === 'ncdpi-blueprint' ? 'Focus by Blueprint Weight:' : 'Focus on the Biggest Gaps:'}</strong>{' '}
              {curriculum.weighting.kind === 'ncdpi-blueprint'
                ? `Prioritize the domains with the highest NC EOG blueprint weight above, especially any still below the ${passingPercent}% qualifying bar.`
                : `There is no official state blueprint at this grade to rank by weight. Prioritize the domains furthest below the ${passingPercent}% qualifying bar above.`}
            </p>
            <p className="leading-relaxed">
              2. <strong>Address Recurring Misconceptions:</strong> Review the misconceptions listed above with the student before their next practice session.
            </p>
            <p className="leading-relaxed">
              3. <strong>Timed Mock Testing:</strong> Have the student complete at least {mockCountWord} full {mockNoun} within a {mockWindowMinutes}-minute window before the Wake County test day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
