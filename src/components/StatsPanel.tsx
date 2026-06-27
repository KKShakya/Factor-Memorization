import { GameStats, HistoryEntry } from '../types';
import { Target, Trophy, Clock, History, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface StatsPanelProps {
  stats: GameStats;
  history: HistoryEntry[];
  onClearStats: () => void;
}

export default function StatsPanel({ stats, history, onClearStats }: StatsPanelProps) {
  const [showHistory, setShowHistory] = useState(false);
  const accuracy = stats.totalPlayed > 0 ? Math.round((stats.totalCorrect / stats.totalPlayed) * 100) : 0;

  return (
    <div className="bg-[#0D1117] rounded-2xl border border-slate-800/80 p-5 mt-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <Trophy size={18} className="text-emerald-400" />
          <span>Your Performance Stats</span>
        </h3>
        {stats.totalPlayed > 0 && (
          <button
            onClick={onClearStats}
            title="Reset All Stats"
            className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors py-1 px-2 hover:bg-rose-500/10 rounded-lg cursor-pointer"
          >
            <Trash2 size={13} />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-center">
          <span className="text-xs text-slate-400 font-medium block mb-1">Solved / Total</span>
          <span className="text-xl font-bold text-white font-mono">
            {stats.totalCorrect} <span className="text-xs text-slate-500 font-normal">/ {stats.totalPlayed}</span>
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-center">
          <span className="text-xs text-slate-400 font-medium block mb-1">Accuracy</span>
          <span className={`text-xl font-bold font-mono ${accuracy >= 75 ? 'text-emerald-400' : accuracy >= 40 ? 'text-amber-400' : 'text-slate-400'}`}>
            {accuracy}%
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 text-center">
          <span className="text-xs text-slate-400 font-medium block mb-1">Max Streak</span>
          <span className="text-xl font-bold text-emerald-400 font-mono flex items-center justify-center gap-1">
            <Target size={14} className="text-emerald-500" />
            {stats.maxStreak}
          </span>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-500/15 rounded-xl p-3 text-center">
          <span className="text-xs text-slate-300 font-medium block mb-1">Best Challenge</span>
          <span className="text-xl font-bold text-emerald-300 font-mono">
            {stats.bestChallengeScore || 0} <span className="text-[10px] text-emerald-500 font-medium">pts</span>
          </span>
        </div>
      </div>

      {/* Accordion For History */}
      <div className="border border-slate-800 rounded-xl overflow-hidden mt-4">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-3.5 bg-slate-900/85 hover:bg-slate-900 transition-colors text-[#94a3b8] hover:text-white text-left text-sm font-medium outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <History size={16} className="text-slate-400" />
            <span>Problem Log & Session History</span>
            {history.length > 0 && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full font-mono font-semibold">
                {history.length}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">{showHistory ? 'Collapse ▲' : 'Expand ▼'}</span>
        </button>

        <AnimatePresence initial={false}>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-[#0A0C10] max-h-72 overflow-y-auto"
            >
              {history.length === 0 ? (
                <div className="p-5 text-center text-slate-500 text-xs py-8">
                  No problems solved in this session yet. Your correct and incorrect attempts will appear here!
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {history.map((entry) => (
                    <div key={entry.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-900/40">
                      <div className="flex items-center gap-2.5">
                        {entry.isCorrect ? (
                          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle size={15} className="text-rose-400 shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-200">
                            Problem target: <span className="text-sm font-bold font-mono text-white">{entry.target}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-400">Mode: {entry.mode === 'tables' ? 'Tables' : entry.mode === 'famous' ? 'Famous' : 'Challenge'}</span>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-0.5 text-slate-400"><Clock size={10} /> {entry.timeTaken.toFixed(1)}s</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200">
                          {entry.factor1 !== null && entry.factor2 !== null ? (
                            <>
                              {entry.factor1} <span className="text-[10px] text-slate-500">×</span> {entry.factor2}
                            </>
                          ) : (
                            'Skipped'
                          )}
                        </span>
                        {entry.factor1 !== null && entry.factor2 !== null && (
                          <span className={`block font-bold text-[10px] mt-0.5 ${entry.isCorrect ? 'text-emerald-400' : 'text-slate-500'}`}>
                            = {entry.factor1 * entry.factor2}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
