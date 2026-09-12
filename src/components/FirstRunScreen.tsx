import React, { useState } from 'react';
import { listCurricula } from '../curriculum/registry';
import type { Grade } from '../curriculum/types';

export interface FirstRunScreenResult {
  studentName: string;
  grade: Grade;
}

export interface FirstRunScreenProps {
  onComplete: (result: FirstRunScreenResult) => void;
}

export const FirstRunScreen: React.FC<FirstRunScreenProps> = ({ onComplete }) => {
  const curricula = listCurricula();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<Grade>(curricula[0]?.grade ?? 5);
  const trimmedName = name.trim();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedName) return;
    onComplete({ studentName: trimmedName, grade });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">NC Math SSA Practice</h1>
          <p className="mt-1 text-sm text-slate-600">
            A free practice tool built for families going through the math acceleration process.
          </p>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <p>
            <strong>What is Single Subject Acceleration (SSA)?</strong> It is a North Carolina process
            that lets a student move ahead in just one subject &mdash; here, math &mdash; without
            changing their grade in every other class. Schools usually use a test to help decide if a
            student is ready.
          </p>
          <p>
            <strong>This tool is built only for NC.</strong> The questions match this state&rsquo;s
            published math standards (the NCSCOS) for this grade. They are practice questions we
            wrote &mdash; not real, secure items from any actual exam.
          </p>
          <p className="font-medium text-slate-900">
            Nothing you or your child types here ever leaves this browser. There is no account, no
            server, and no internet connection required &mdash; everything stays on this device.
          </p>
        </div>

        <form onSubmit={handleStart} className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <label htmlFor="first-run-name" className="block text-sm font-medium text-slate-700 mb-1">
              Student&rsquo;s name
            </label>
            <input
              id="first-run-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="first-run-grade" className="block text-sm font-medium text-slate-700 mb-1">
              Grade
            </label>
            <select
              id="first-run-grade"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value) as Grade)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {curricula.map((c) => (
                <option key={c.grade} value={c.grade}>
                  Grade {c.grade}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!trimmedName}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Start practicing
          </button>
        </form>
      </div>
    </div>
  );
};

export default FirstRunScreen;
