import { FactorPair, GameMode } from '../types';
import { getFactorPairs, getPrimeFactorization, isPrime } from '../data';
import { HelpCircle, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface FactorListHelpProps {
  target: number;
  hintFacts?: string;
  isRevealed: boolean;
  onReveal: () => void;
  gameMode: GameMode;
}

export default function FactorListHelp({
  target,
  hintFacts,
  isRevealed,
  onReveal,
  gameMode
}: FactorListHelpProps) {
  const pairs = getFactorPairs(target);
  const primeFactors = getPrimeFactorization(target);
  const primeCheck = isPrime(target);

  return (
    <div className="bg-[#0D1117] rounded-2xl border border-slate-800 p-4.5 w-full mt-4">
      {!isRevealed ? (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <HelpCircle size={24} className="text-emerald-400 mb-2 animate-pulse" />
          <p className="text-xs text-slate-300 font-medium max-w-xs mb-3">
            Stuck or want to see the complete mathematical decomposition of {target}?
          </p>
          <button
            onClick={onReveal}
            type="button"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md"
          >
            Reveal Factors & Prime Breakdown
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Factor Analysis: {target}</span>
            </h4>
            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {pairs.length} solution{pairs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Prime Factor breakdown */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
            <p className="text-[11px] font-medium text-slate-400 mb-1">Prime Factorization</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {primeCheck ? (
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Prime Number! (Only 1 × {target} exists)
                </span>
              ) : (
                <>
                  <div className="flex items-center gap-1 font-mono text-sm font-bold text-emerald-400">
                    {primeFactors.join(' × ')}
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Multiplied together, these equal {target})
                  </span>
                </>
              )}
            </div>
          </div>

          {/* List of valid answers (factor pairs) */}
          <div>
            <p className="text-[11px] font-medium text-slate-400 mb-2">Valid Game Combinations (Excluding 1):</p>
            {pairs.length === 0 ? (
              <p className="text-xs text-rose-400 font-medium font-serif italic">
                No non-trivial factor pairs possible (this is prime or single-factor limits).
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {pairs.map((pair, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs font-semibold hover:text-emerald-450 hover:border-slate-700 transition-colors"
                  >
                    {pair.f1} <span className="text-slate-500 mx-1">×</span> {pair.f2}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unique mathematical facts */}
          {hintFacts && (
            <div className="bg-emerald-950/10 rounded-xl p-3 border border-emerald-500/10">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">Trivia & Facts</span>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">{hintFacts}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
