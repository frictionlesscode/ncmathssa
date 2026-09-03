import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Flame,
  HelpCircle
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { NC_DOMAINS } from '../data/ncStandards';
import { QUESTIONS_BANK } from '../data/questions';

interface CurriculumViewProps {
  onStartStandardDrill: (standardCode: string) => void;
  onOpenStudyGuide: (standardCode: string) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  onStartStandardDrill,
  onOpenStudyGuide
}) => {
  const { getStandardMastery, getDomainMastery } = useProgress();
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [expandedStandards, setExpandedStandards] = useState<Record<string, boolean>>({
    'NC.5.NF.1': true, // Open high-weight fractions by default
    'NC.5.NBT.5': true
  });

  const toggleExpand = (code: string) => {
    setExpandedStandards(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const filteredDomains = selectedDomain === 'all'
    ? NC_DOMAINS
    : NC_DOMAINS.filter(d => d.id === selectedDomain);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              NC STANDARD COURSE OF STUDY (NCSCOS)
            </span>
            <span className="text-xs font-semibold text-slate-500">Grade 5 Content Blueprint</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Curriculum Structure & Standard Blueprints
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Each standard is tested with non-routine word problems, multi-step math, and above-grade stretch items. Achieve 80%+ on each to guarantee SSA acceleration readiness.
          </p>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start">
          <button
            onClick={() => setSelectedDomain('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedDomain === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 5 Domains
          </button>
          {NC_DOMAINS.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(d.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                selectedDomain === d.id ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d.id} ({d.officialWeightRange})
            </button>
          ))}
        </div>
      </div>

      {/* Domain Sections */}
      <div className="space-y-10">
        {filteredDomains.map(domain => {
          const dm = getDomainMastery(domain.id);
          const isDomainReady = dm.masteryPercent >= 80;

          return (
            <div key={domain.id} className="space-y-4">
              {/* Domain Header Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${domain.badgeBg}`}>
                      {domain.id} DOMAIN
                    </span>
                    <span className="text-xs font-extrabold text-slate-700">
                      NC Blueprint Weight: {domain.officialWeightRange}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    {domain.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                    {domain.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block font-semibold">Mastery Score</span>
                    <span className={`text-2xl font-black ${
                      dm.status === 'untested'
                        ? 'text-slate-400'
                        : isDomainReady
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}>
                      {dm.status === 'untested' ? 'Untested' : `${dm.masteryPercent}%`}
                    </span>
                  </div>
                  <div className="text-right border-l border-slate-200 pl-4">
                    <span className="text-xs text-slate-500 block font-semibold">Standards Ready</span>
                    <span className="text-sm font-bold text-slate-800">
                      {dm.standardsMastered} / {domain.standards.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Standard Cards within Domain */}
              <div className="grid gap-4">
                {domain.standards.map(standard => {
                  const sm = getStandardMastery(standard.code);
                  const isExpanded = !!expandedStandards[standard.code];
                  const stdQuestions = QUESTIONS_BANK.filter(q => q.standardCode === standard.code);
                  const stretchCount = stdQuestions.filter(q => q.isStretch).length;

                  return (
                    <div
                      key={standard.code}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-blue-300"
                    >
                      {/* Standard Summary Row */}
                      <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <span className="font-mono text-xs font-extrabold px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl border border-slate-200 mt-0.5">
                            {standard.code}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-extrabold text-slate-900">
                                {standard.title}
                              </h3>
                              {stretchCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                                  <Flame className="w-3 h-3 text-amber-600" />
                                  {stretchCount} Stretch Challenge
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                              {standard.description}
                            </p>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                          {/* Status Pill */}
                          <div className="text-right mr-2">
                            {sm.status === 'acceleration-ready' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200">
                                <CheckCircle className="w-3.5 h-3.5" /> Ready ({sm.masteryPercent}%)
                              </span>
                            )}
                            {sm.status === 'approaching' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-full border border-amber-200">
                                Approaching ({sm.masteryPercent}%)
                              </span>
                            )}
                            {sm.status === 'needs-focus' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 font-extrabold text-xs rounded-full border border-rose-200">
                                Needs Focus ({sm.masteryPercent}%)
                              </span>
                            )}
                            {sm.status === 'untested' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 font-semibold text-xs rounded-full">
                                <HelpCircle className="w-3.5 h-3.5" /> Untested
                              </span>
                            )}
                          </div>

                          {/* Study Guide Button */}
                          <button
                            onClick={() => onOpenStudyGuide(standard.code)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                            title="Open Study Guide & Worked Examples"
                          >
                            <BookOpen className="w-3.5 h-3.5" /> Guide
                          </button>

                          {/* Drill Practice Button */}
                          <button
                            onClick={() => onStartStandardDrill(standard.code)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                          >
                            Drill <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Accordion Toggle */}
                          <button
                            onClick={() => toggleExpand(standard.code)}
                            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Concept Details */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Key Skills Evaluated for SSA Acceleration:
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {standard.keyConcepts.map((concept, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                <span>{concept}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
