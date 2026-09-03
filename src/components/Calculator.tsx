import React, { useState } from 'react';
import { Calculator as CalcIcon, X } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  if (!isOpen) return null;

  const handleNum = (digit: string) => {
    if (newNumber) {
      setDisplay(digit === '.' ? '0.' : digit);
      setNewNumber(false);
    } else {
      if (digit === '.' && display.includes('.')) return;
      setDisplay(display + digit);
    }
  };

  const handleOp = (nextOp: string) => {
    const current = parseFloat(display);
    if (prevVal === null) {
      setPrevVal(current);
    } else if (op) {
      const res = compute(prevVal, current, op);
      setPrevVal(res);
      setDisplay(String(res));
    }
    setOp(nextOp);
    setNewNumber(true);
  };

  const compute = (a: number, b: number, operation: string): number => {
    switch (operation) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEqual = () => {
    if (op && prevVal !== null) {
      const current = parseFloat(display);
      const res = compute(prevVal, current, op);
      setDisplay(String(res));
      setPrevVal(null);
      setOp(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevVal(null);
    setOp(null);
    setNewNumber(true);
  };

  const handleSqrt = () => {
    const val = parseFloat(display);
    if (val >= 0) {
      setDisplay(String(Math.sqrt(val)));
      setNewNumber(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 p-4 w-72 text-white">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <CalcIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide">NC EOG Calculator</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Screen */}
      <div className="bg-slate-950/80 rounded-xl p-3 mb-3 text-right font-mono text-2xl tracking-wider text-emerald-400 overflow-x-auto border border-slate-800">
        {display}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2 text-sm font-medium">
        <button onClick={handleClear} className="p-2.5 bg-rose-600/80 hover:bg-rose-500 rounded-lg text-white font-bold">C</button>
        <button onClick={handleSqrt} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg">√</button>
        <button onClick={() => setDisplay(String(-parseFloat(display)))} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg">±</button>
        <button onClick={() => handleOp('÷')} className="p-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold">÷</button>

        <button onClick={() => handleNum('7')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg">7</button>
        <button onClick={() => handleNum('8')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg">8</button>
        <button onClick={() => handleNum('9')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg">9</button>
        <button onClick={() => handleOp('×')} className="p-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold">×</button>

        <button onClick={() => handleNum('4')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg">4</button>
        <button onClick={() => handleNum('5')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg">5</button>
        <button onClick={() => handleNum('6')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg">6</button>
        <button onClick={() => handleOp('-')} className="p-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold">-</button>

        <button onClick={() => handleNum('1')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg">1</button>
        <button onClick={() => handleNum('2')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg">2</button>
        <button onClick={() => handleNum('3')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg">3</button>
        <button onClick={() => handleOp('+')} className="p-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold">+</button>

        <button onClick={() => handleNum('0')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg col-span-2">0</button>
        <button onClick={() => handleNum('.')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg">.</button>
        <button onClick={handleEqual} className="p-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold">=</button>
      </div>
    </div>
  );
};
