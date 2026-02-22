import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, X } from 'lucide-react';

type Mode = 'work' | 'short' | 'long';

const MODES: Record<Mode, { label: string; minutes: number; color: string; bg: string }> = {
  work:  { label: 'Focus',       minutes: 25, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-600' },
  short: { label: 'Short Break', minutes: 5,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' },
  long:  { label: 'Long Break',  minutes: 15, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500' },
};

interface PomodoroTimerProps {
  onClose: () => void;
}

export function PomodoroTimer({ onClose }: PomodoroTimerProps) {
  const [mode, setMode] = useState<Mode>('work');
  const [secondsLeft, setSecondsLeft] = useState(MODES.work.minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback((m: Mode = mode) => {
    setRunning(false);
    setSecondsLeft(MODES[m].minutes * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode]);

  const switchMode = (m: Mode) => {
    setMode(m);
    reset(m);
    setSecondsLeft(MODES[m].minutes * 60);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === 'work') setSessions(n => n + 1);
            // Simple audio beep via Web Audio API
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              osc.connect(ctx.destination);
              osc.frequency.value = 880;
              osc.start();
              osc.stop(ctx.currentTime + 0.3);
            } catch { /* ignore */ }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const total = MODES[mode].minutes * 60;
  const progress = (total - secondsLeft) / total;
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const cfg = MODES[mode];
  const circumference = 2 * Math.PI * 54;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-24 md:bottom-20 right-4 md:right-6 z-40 w-72 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Pomodoro</span>
          {sessions > 0 && (
            <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">
              {sessions} 🍅
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {(Object.keys(MODES) as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all ${
              mode === m ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Ring timer */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke="currentColor"
              className={cfg.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-mono text-gray-900 dark:text-white tabular-nums">{mins}:{secs}</span>
            <span className={`text-xs font-medium mt-0.5 ${cfg.color}`}>{cfg.label}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => reset()}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRunning(v => !v)}
            className={`px-8 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:scale-105 active:scale-95 ${cfg.bg}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={running ? 'pause' : 'play'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                className="flex items-center gap-2"
              >
                {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
