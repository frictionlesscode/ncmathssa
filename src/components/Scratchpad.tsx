import React, { useRef, useState, useEffect } from 'react';
import { useEscapeKey } from './useEscapeKey';
import { Eraser, Pen, RotateCcw, X } from 'lucide-react';

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose }) => {
  useEscapeKey(isOpen, onClose);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#2563eb'); // blue

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 20;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" aria-label="Scratchpad" className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Pen className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">Math Scratchpad & Whiteboard</h3>
              <p className="text-xs text-slate-500">Show your work, write out fractions, or solve long division</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setTool('pen')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  tool === 'pen' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Pen className="w-3.5 h-3.5" /> Pen
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  tool === 'eraser' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" /> Eraser
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-1.5 px-2 border-l border-r border-slate-200">
              {['#2563eb', '#dc2626', '#16a34a', '#0f172a'].map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setTool('pen');
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    color === c && tool === 'pen' ? 'scale-125 border-slate-800' : 'border-white'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>

            <button
              onClick={clearCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>

            <button
              onClick={onClose}
              aria-label="Close scratchpad"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Area with Graph Paper Grid */}
        <div className="flex-1 relative bg-white overflow-hidden cursor-crosshair">
          {/* Subtle math grid pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
};
