import { useState, useEffect, useRef } from 'react';
import { GameMode, GameStats, HistoryEntry } from './types';
import { generateTarget, getFactorPairs } from './data';
import ModeSelector from './components/ModeSelector';
import StatsPanel from './components/StatsPanel';
import MathKeyboard from './components/MathKeyboard';
import FactorListHelp from './components/FactorListHelp';
import { 
  Calculator, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Timer, 
  Sparkles, 
  Trophy, 
  HelpCircle,
  Play,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Game modes and targets
  const [mode, setMode] = useState<GameMode>('tables');
  const [target, setTarget] = useState<number>(0);
  const [hintFacts, setHintFacts] = useState<string>('');
  
  // Inputs
  const [inputExpression, setInputExpression] = useState<string>('');
  const nextQuestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'info' | '' }>({ text: '', type: '' });
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [bounce, setBounce] = useState<boolean>(false);
  
  // Statistics and History
  const [stats, setStats] = useState<GameStats>({
    totalPlayed: 0,
    totalCorrect: 0,
    currentStreak: 0,
    maxStreak: 0,
    bestChallengeScore: 0
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Challenge Mode (Timer) States
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isChallengeActive, setIsChallengeActive] = useState<boolean>(false);
  const [challengeScore, setChallengeScore] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(3);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  // Time metrics inside questions for multiplier decay
  const questionStartTime = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound synthesis using Web Audio API (cross-platform, zero dependencies)
  const playBeep = (type: 'success' | 'error' | 'click' | 'countdown' | 'levelup') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const context = new AudioCtx();
      const now = context.currentTime;

      if (type === 'success') {
        // High, joyful dual notes
        [329.63, 523.25].forEach((freq, idx) => {
          const osc = context.createOscillator();
          const gainNode = context.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gainNode.gain.setValueAtTime(0.12, now + idx * 0.08);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
          osc.connect(gainNode);
          gainNode.connect(context.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
      } else if (type === 'error') {
        // Flat discordant buzzer sound
        const osc = context.createOscillator();
        const gainNode = context.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(95, now + 0.25);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.connect(gainNode);
        gainNode.connect(context.destination);
        osc.start();
        osc.stop(now + 0.3);
      } else if (type === 'click') {
        const osc = context.createOscillator();
        const gainNode = context.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, now);
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gainNode);
        gainNode.connect(context.destination);
        osc.start();
        osc.stop(now + 0.05);
      } else if (type === 'countdown') {
        const osc = context.createOscillator();
        const gainNode = context.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gainNode);
        gainNode.connect(context.destination);
        osc.start();
        osc.stop(now + 0.1);
      } else if (type === 'levelup') {
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
        notes.forEach((freq, idx) => {
          const osc = context.createOscillator();
          const gainNode = context.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gainNode.gain.setValueAtTime(0.1, now + idx * 0.07);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);
          osc.connect(gainNode);
          gainNode.connect(context.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.25);
        });
      }
    } catch {
      // Browser blocks Audio initially
    }
  };

  // Load stats from localStorage on mount
  useEffect(() => {
    try {
      const storedStats = localStorage.getItem('factormaster_stats_v3');
      const storedHistory = localStorage.getItem('factormaster_history_v3');
      const storedMute = localStorage.getItem('factormaster_mute');

      if (storedStats) setStats(JSON.parse(storedStats));
      if (storedHistory) setHistory(JSON.parse(storedHistory));
      if (storedMute) setIsMuted(JSON.parse(storedMute));
    } catch (e) {
      console.warn('Local storage retrieval error: ', e);
    }
  }, []);

  // Sync state modifications to Local Storage
  const saveStatsAndHistory = (newStats: GameStats, newHistory: HistoryEntry[]) => {
    setStats(newStats);
    setHistory(newHistory);
    try {
      localStorage.setItem('factormaster_stats_v3', JSON.stringify(newStats));
      localStorage.setItem('factormaster_history_v3', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error writing to localStorage: ', e);
    }
  };

  // Clear stats callback
  const handleClearStats = () => {
    const freshStats: GameStats = {
      totalPlayed: 0,
      totalCorrect: 0,
      currentStreak: 0,
      maxStreak: 0,
      bestChallengeScore: stats.bestChallengeScore // Preserve historical record high
    };
    saveStatsAndHistory(freshStats, []);
    setFeedback({ text: 'Performance logs and score metrics cleared!', type: 'info' });
    playBeep('click');
  };

  // Switch sound mute state
  const toggleMute = () => {
    const targetState = !isMuted;
    setIsMuted(targetState);
    localStorage.setItem('factormaster_mute', JSON.stringify(targetState));
    if (!targetState) {
      setTimeout(() => playBeep('click'), 50);
    }
  };

  // Create a new question
  const prepareQuestion = (targetMode: GameMode) => {
    if (nextQuestionTimeoutRef.current) {
      clearTimeout(nextQuestionTimeoutRef.current);
      nextQuestionTimeoutRef.current = null;
    }
    setInputExpression('');
    setFeedback({ text: '', type: '' });
    setIsRevealed(false);

    const result = generateTarget(targetMode, target);
    setTarget(result.target);
    setHintFacts(result.hintFacts || '');
    
    // Reset solve metrics
    questionStartTime.current = Date.now();
    setMultiplier(3);

    // Dynamic autofocus
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 120);
  };

  // Change active mode
  const handleModeChange = (newMode: GameMode) => {
    if (isChallengeActive) return; // Prevent changing mode mid-trial
    setMode(newMode);
    setShowSummary(false);
    prepareQuestion(newMode);
    playBeep('click');
  };

  // Run on game screen startup
  useEffect(() => {
    prepareQuestion(mode);
  }, [mode]);

  // Handle Multiplier countdown timer
  useEffect(() => {
    if (isChallengeActive) {
      const interval = setInterval(() => {
        const timePassed = (Date.now() - questionStartTime.current) / 1000;
        if (timePassed < 3.5) {
          setMultiplier(3);
        } else if (timePassed < 7.5) {
          setMultiplier(2);
        } else {
          setMultiplier(1);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [target, isChallengeActive]);

  // Challenge game loop (countdown timer)
  useEffect(() => {
    if (isChallengeActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // End Challenge Mode
            setIsChallengeActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            
            // Check record
            const updatedBest = Math.max(stats.bestChallengeScore, challengeScore);
            const updatedStats = {
              ...stats,
              bestChallengeScore: updatedBest
            };
            saveStatsAndHistory(updatedStats, history);
            setShowSummary(true);
            playBeep('levelup');
            return 0;
          }
          if (prev <= 10) {
            // Warning sound click
            playBeep('countdown');
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isChallengeActive, challengeScore, stats, history]);

  const startChallenge = () => {
    setIsChallengeActive(true);
    setTimeLeft(60);
    setChallengeScore(0);
    setShowSummary(false);
    prepareQuestion('challenge');
    playBeep('levelup');
  };

  // Parser for standard multiplication expressions, e.g. "12 * 13", "12x13", "12 × 13"
  const parseFactorsExpression = (expr: string): { f1: number; f2: number } | null => {
    const parts = expr.split(/[*xX×]/);
    if (parts.length === 2) {
      const f1 = parseInt(parts[0].trim(), 10);
      const f2 = parseInt(parts[1].trim(), 10);
      if (!isNaN(f1) && !isNaN(f2)) {
        return { f1, f2 };
      }
    }
    return null;
  };

  const triggerSuccess = (f1: number, f2: number, timeTaken: number) => {
    playBeep('success');
    setBounce(true);
    setTimeout(() => setBounce(false), 500);

    const scoreEarned = isChallengeActive ? 10 * multiplier : 10;
    if (isChallengeActive) {
      setChallengeScore((prev) => prev + scoreEarned);
      // Reward extra seconds
      setTimeLeft((prev) => Math.min(75, prev + 5)); // cap bonus pool at 75s
    }

    // Update statistics
    const newStreak = stats.currentStreak + 1;
    const newMaxStreak = Math.max(stats.maxStreak, newStreak);
    const isRecordStreak = newStreak > stats.maxStreak;
    
    const updatedStats: GameStats = {
      ...stats,
      totalPlayed: stats.totalPlayed + 1,
      totalCorrect: stats.totalCorrect + 1,
      currentStreak: newStreak,
      maxStreak: newMaxStreak,
      bestChallengeScore: stats.bestChallengeScore
    };

    const newHistoryEntry: HistoryEntry = {
      id: Math.random().toString(36).substring(2, 9),
      target,
      factor1: f1,
      factor2: f2,
      isCorrect: true,
      timestamp: Date.now(),
      timeTaken,
      mode
    };

    const revisedHistory = [newHistoryEntry, ...history];
    saveStatsAndHistory(updatedStats, revisedHistory);

    let successMsg = `Correct! 🎉 +${scoreEarned} points.`;
    if (isRecordStreak && newStreak > 1) {
      successMsg = `Correct! 🎉 New high streak of ${newStreak}!`;
    }
    setFeedback({ text: successMsg, type: 'success' });

    // Queue next question automatically
    const delayTimer = setTimeout(() => {
      prepareQuestion(mode);
    }, 200);

    return delayTimer;
  };

  const triggerError = (f1: number, f2: number, calculatedProduct: number, timeTaken: number) => {
    playBeep('error');
    setBounce(true);
    setTimeout(() => setBounce(false), 500);

    const updatedStats: GameStats = {
      ...stats,
      totalPlayed: stats.totalPlayed + 1,
      currentStreak: 0
    };

    const newHistoryEntry: HistoryEntry = {
      id: Math.random().toString(36).substring(2, 9),
      target,
      factor1: f1,
      factor2: f2,
      isCorrect: false,
      timestamp: Date.now(),
      timeTaken,
      mode
    };

    const revisedHistory = [newHistoryEntry, ...history];
    saveStatsAndHistory(updatedStats, revisedHistory);

    setFeedback({
      text: `Incorrect. ${f1} × ${f2} = ${calculatedProduct}. Try another combination!`,
      type: 'error'
    });
    setIsRevealed(true); // Automatically reveal answers so they can learn!
  };

  const evaluateAnswer = (expr: string, forceManual = false) => {
    if (feedback.type === 'success' || showSummary) return;

    const parsed = parseFactorsExpression(expr);
    if (!parsed) {
      if (forceManual) {
        setFeedback({ text: 'Please enter a valid factor equation, e.g. 12*13', type: 'error' });
        playBeep('error');
      }
      return;
    }

    const { f1, f2 } = parsed;
    const calculatedProduct = f1 * f2;
    const timeTaken = (Date.now() - questionStartTime.current) / 1000;

    if (calculatedProduct === target) {
      if (f1 === 1 || f2 === 1) {
        setFeedback({ text: 'Too easy! Factors must be greater than 1.', type: 'error' });
        playBeep('error');
        setBounce(true);
        setTimeout(() => setBounce(false), 500);
        return;
      }

      if (nextQuestionTimeoutRef.current) return;
      nextQuestionTimeoutRef.current = triggerSuccess(f1, f2, timeTaken);
    } else {
      if (forceManual) {
        triggerError(f1, f2, calculatedProduct, timeTaken);
      }
    }
  };

  // Keyboard binding inside window
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (showSummary) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        evaluateAnswer(inputExpression, true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, [inputExpression, target, mode, isChallengeActive, showSummary, feedback, stats, history]);

  // Trigger input values from the in-app virtual keyboard
  const handleVirtualKeyPress = (key: string) => {
    playBeep('click');
    const newVal = inputExpression + key;
    setInputExpression(newVal);
    evaluateAnswer(newVal);
  };

  const handleVirtualBackspace = () => {
    playBeep('click');
    const newVal = inputExpression.slice(0, -1);
    setInputExpression(newVal);
    evaluateAnswer(newVal);
  };

  const handleVirtualClear = () => {
    playBeep('click');
    setInputExpression('');
    setFeedback({ text: '', type: '' });
  };

  const skipQuestion = () => {
    playBeep('click');
    prepareQuestion(mode);
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-start py-8 px-4 font-sans text-slate-100 select-none">
      {/* Head banner */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-sm">
            Σ
          </div>
          <div>
            <h1 className="text-lg font-extrabold font-display tracking-tight text-white uppercase">
              Factor <span className="text-emerald-400">Master</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              Mental Mathematics Workout
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 ml-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-emerald-400 transition-colors shadow-sm cursor-pointer"
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main card viewport layout */}
      <main className="w-full max-w-2xl flex flex-col gap-5">
        <ModeSelector 
          currentMode={mode} 
          onModeChange={handleModeChange} 
          disabled={isChallengeActive} 
        />

        {showSummary ? (
          /* Time trial high-score dynamic summary splash */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-slate-900 to-black text-white rounded-3xl p-8 text-center shadow-2xl border border-slate-800"
          >
            <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/10 mb-4 animate-bounce">
              <Award size={36} />
            </div>
            <h2 className="text-2xl font-black font-display mb-1 text-white">Challenge Completed!</h2>
            <p className="text-xs text-slate-400 mb-6 font-medium">60-second speed-round mental gymnastics report</p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
              <div className="bg-slate-900/80 border border-slate-850/60 rounded-2xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Score Earned</span>
                <span className="text-3xl font-black text-emerald-450 font-mono">{challengeScore}</span>
              </div>
              <div className="bg-[#0A0C10] border border-emerald-500/20 rounded-2xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1">Your Record Best</span>
                <span className="text-3xl font-black text-emerald-300 font-mono">{stats.bestChallengeScore}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={startChallenge}
                className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-black font-bold text-sm px-6 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Play size={15} fill="currentColor" />
                Play Challenge Again
              </button>
              <button
                onClick={() => {
                  setShowSummary(false);
                  setMode('tables');
                  prepareQuestion('tables');
                }}
                className="bg-slate-900 hover:bg-slate-850 active:scale-95 text-slate-200 border border-slate-800 font-semibold text-sm px-5 py-3 rounded-xl transition-all cursor-pointer"
              >
                Back to standard practice
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            animate={bounce ? { scale: [1, 1.02, 0.98, 1], rotate: [0, 1, -1, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="bg-[#0D1117]/85 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Top Challenge bar */}
            {isChallengeActive && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-950">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  animate={{ width: `${(timeLeft / 60) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            )}

            <div className="flex items-center justify-between mt-1 mb-5">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Solve for Factors
                </span>
              </div>

              {mode === 'challenge' ? (
                !isChallengeActive ? (
                  <span className="text-[10px] font-bold text-emerald-450 bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Challenge Locked
                  </span>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-900 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-400 border border-slate-800">
                      <Timer size={14} />
                      <span className="font-mono">{timeLeft}s</span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-900 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-450 border border-slate-800">
                      <TrendingUp size={13} />
                      <span className="font-mono">{challengeScore} pts</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-450 bg-emerald-950/30 border border-emerald-900/20 px-2.5 py-1 rounded-full">
                  <Sparkles size={12} className="text-emerald-500" />
                  <span>Streak: <span className="font-mono font-bold text-white">{stats.currentStreak}</span></span>
                </div>
              )}
            </div>

            {/* Target Display Panel */}
            <div className="flex flex-col items-center justify-center py-8 border border-slate-800 bg-[#0A0C10]/60 rounded-2xl mb-6 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] select-none pointer-events-none">
                <span className="text-9xl font-black">×</span>
              </div>

              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                Target Number
              </span>
              <h2 className="text-6xl md:text-7xl font-sans font-black tracking-tight text-white text-center select-none drop-shadow-2xl font-display leading-none mb-1">
                {target || '--'}
              </h2>
              
              {/* Pulsing visual element from design HTML */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>

              {isChallengeActive && (
                <div className="absolute top-3.5 left-4 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Speed Gain: {multiplier}x
                </div>
              )}
              {hintFacts && mode === 'famous' && (
                <p className="text-xs text-slate-400 font-medium px-4 text-center mt-2 max-w-sm font-sans truncate hover:text-clip">
                  {hintFacts}
                </p>
              )}
            </div>

            {/* In game check / locked block */}
            {mode === 'challenge' && !isChallengeActive ? (
              <div className="text-center py-10 bg-slate-900/60 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-slate-200 mb-2 font-display">Are you ready for the speed challenge?</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
                  Solve as many composite targets as you can in 60 seconds! Correct answers add a <span className="font-semibold text-emerald-400">+5s</span> timer reward. Quick solving multipliers will boost your total score.
                </p>
                <button
                  onClick={startChallenge}
                  type="button"
                  className="bg-emerald-500 hover:bg-emerald-600 hover:scale-105 active:scale-95 text-black font-black text-xs uppercase tracking-widest px-8 py-3 rounded-full transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Start 60s Challenge!
                </button>
              </div>
            ) : (
              <>
                {/* Inputs area */}
                <div className="flex flex-col items-center justify-center gap-3.5 mb-5 select-none">
                  <div className="relative w-full max-w-xs group">
                    <div className="absolute -top-3 left-4 px-2 bg-[#0D1117] text-[9px] font-black uppercase tracking-wider text-emerald-400 z-10">Factor Equation</div>
                    <input
                      ref={inputRef}
                      type="text"
                      inputMode="none" // Use styled math virtual keyboard + allow physical keyboard typing
                      value={inputExpression}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9*xX× ]/g, '');
                        setInputExpression(val);
                        evaluateAnswer(val);
                      }}
                      className="w-full h-18 text-center font-mono text-3xl font-bold bg-slate-900 border-2 border-slate-850 focus:border-emerald-500 hover:border-slate-700 text-white rounded-2xl outline-none transition-all shadow-md placeholder:text-slate-700"
                      placeholder="e.g. 12*13"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 text-center px-4">
                    Type physical or virtual keys like <span className="text-emerald-400 font-mono">12*13</span>. Code auto-verifies your solution immediately!
                  </span>
                </div>

                {/* Submitting check button row */}
                <div className="flex gap-2.5 mb-6">
                  {feedback.type === 'success' ? (
                    <button
                      onClick={() => {
                        if (nextQuestionTimeoutRef.current) {
                          clearTimeout(nextQuestionTimeoutRef.current);
                          nextQuestionTimeoutRef.current = null;
                        }
                        prepareQuestion(mode);
                      }}
                      type="button"
                      className="flex-1 h-12 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-emerald-500/15 cursor-pointer active:scale-95 transition-all w-full"
                    >
                      <span>Next Problem</span>
                      <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={skipQuestion}
                      type="button"
                      title="Skip to another problem"
                      className="flex-1 h-12 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider py-2 px-3 border border-slate-800 rounded-xl transition-all cursor-pointer w-full text-center"
                    >
                      Skip Problem
                    </button>
                  )}
                </div>

                {/* Response Feedback banner */}
                <AnimatePresence mode="wait">
                  {feedback.text && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className={`p-3.5 rounded-xl border text-center font-bold text-xs tracking-wide leading-relaxed mb-6
                        ${
                          feedback.type === 'success'
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                            : feedback.type === 'error'
                            ? 'bg-rose-950/20 border-rose-900/30 text-rose-450'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }
                      `}
                    >
                      {feedback.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Virtual Typing Keyboard */}
                <MathKeyboard
                  onKeyPress={handleVirtualKeyPress}
                  onBackspace={handleVirtualBackspace}
                  onClear={handleVirtualClear}
                />

                {/* Educational Factor Tutor Guide collapsible assistance */}
                <FactorListHelp
                  target={target}
                  hintFacts={hintFacts}
                  isRevealed={isRevealed}
                  onReveal={() => {
                    setIsRevealed(true);
                    playBeep('click');
                  }}
                  gameMode={mode}
                />
              </>
            )}
          </motion.div>
        )}

        <StatsPanel 
          stats={stats} 
          history={history} 
          onClearStats={handleClearStats} 
        />
      </main>

      {/* Styled cohesive HUD footer layout from user constraints */}
      <footer className="mt-12 w-full max-w-2xl px-6 py-4 bg-[#080A0E] border border-slate-800/50 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">System Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">Environment: Sandboxed</span>
          </div>
        </div>
        <p className="text-[9px] text-slate-600 uppercase font-mono tracking-widest">
          Factor Master v4.1 // Production Practice Suite
        </p>
      </footer>
    </div>
  );
}
