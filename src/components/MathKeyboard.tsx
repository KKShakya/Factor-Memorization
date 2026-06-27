import { Delete, Trash2 } from 'lucide-react';

interface MathKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

export default function MathKeyboard({ onKeyPress, onBackspace, onClear }: MathKeyboardProps) {
  return (
    <div className="bg-[#0D1117] border border-slate-800 p-3.5 rounded-2xl w-full max-w-sm mx-auto shadow-xl">
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        {['1', '2', '3'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKeyPress(key)}
            className="h-12 flex items-center justify-center bg-slate-900 border border-slate-800/80 rounded-xl font-bold font-mono text-lg text-slate-100 active:scale-95 active:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-md"
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onKeyPress('*')}
          className="h-12 flex items-center justify-center bg-emerald-950/20 border border-emerald-900/40 rounded-xl font-bold font-mono text-xl text-emerald-400 active:scale-95 hover:border-emerald-700 hover:bg-emerald-950/30 transition-all cursor-pointer shadow-md"
        >
          *
        </button>

        {/* Row 2 */}
        {['4', '5', '6'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKeyPress(key)}
            className="h-12 flex items-center justify-center bg-slate-900 border border-slate-800/80 rounded-xl font-bold font-mono text-lg text-slate-100 active:scale-95 active:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-md"
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          onClick={onBackspace}
          className="h-12 flex items-center justify-center bg-slate-800 border border-slate-700/60 rounded-xl text-slate-300 active:scale-95 active:bg-slate-750 transition-all cursor-pointer shadow-md"
          title="Backspace"
        >
          <Delete size={18} />
        </button>

        {/* Row 3 */}
        {['7', '8', '9'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKeyPress(key)}
            className="h-12 flex items-center justify-center bg-slate-900 border border-slate-800/80 rounded-xl font-bold font-mono text-lg text-slate-100 active:scale-95 active:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-md"
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          onClick={onClear}
          className="h-12 flex items-center justify-center bg-rose-950/20 border border-rose-900/40 rounded-xl font-semibold text-rose-400 text-xs tracking-wider active:scale-95 active:bg-rose-950/40 transition-all cursor-pointer shadow-md"
          title="Clear field"
        >
          <Trash2 size={16} />
        </button>

        {/* Row 4 */}
        <button
          type="button"
          onClick={() => onKeyPress('0')}
          className="col-span-4 h-12 flex items-center justify-center bg-slate-900 border border-slate-800/80 rounded-xl font-bold font-mono text-lg text-slate-100 active:scale-95 active:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-md"
        >
          0
        </button>
      </div>
    </div>
  );
}
