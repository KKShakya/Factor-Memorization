import { GameMode } from '../types';
import { Calculator, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface ModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
}

export default function ModeSelector({ currentMode, onModeChange, disabled = false }: ModeSelectorProps) {
  const modes: { id: GameMode; title: string; desc: string; icon: typeof Calculator }[] = [
    {
      id: 'tables',
      title: 'Tables (13-29)',
      desc: 'Products of 13-19 & 21-29 times single-digit multipliers.',
      icon: Calculator
    },
    {
      id: 'famous',
      title: 'Famous & Squares',
      desc: 'Master perfect squares, power of twos, and highly composite integers.',
      icon: Sparkles
    },
    {
      id: 'challenge',
      title: 'Timer Challenge',
      desc: 'Speed round! Correct answers add +5s. Multipliers for rapid solves.',
      icon: Zap
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-6">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => !disabled && onModeChange(mode.id)}
            disabled={disabled}
            className={`relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300 outline-none select-none
              ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              ${
                isActive
                  ? 'border-emerald-500 bg-[#0D1117] text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'border-slate-800 bg-[#0D1117]/40 hover:border-slate-700 hover:bg-[#0D1117]/75 text-slate-300'
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeModeIndicator"
                className="absolute inset-0 rounded-xl border-2 border-emerald-500 pointer-events-none"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className={`p-1.5 rounded-lg ${
                  isActive ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Icon size={16} />
              </div>
              <span className={`font-semibold text-sm tracking-tight ${isActive ? 'text-emerald-400' : 'text-slate-200'}`}>{mode.title}</span>
            </div>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">{mode.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
