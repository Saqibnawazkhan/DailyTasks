import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle, BarChart3, Kanban, ChevronRight, X } from 'lucide-react';

const SLIDES = [
  {
    icon: <Zap className="w-12 h-12 text-indigo-400" />,
    bg: 'from-indigo-500/20 to-purple-500/20',
    title: 'Welcome to TaskFlow',
    body: 'A modern, beautiful task manager built for people who love getting things done. Manage your day, week, and month — all in one place.',
  },
  {
    icon: <CheckCircle className="w-12 h-12 text-emerald-400" />,
    bg: 'from-emerald-500/20 to-teal-500/20',
    title: 'Capture & Complete Tasks',
    body: 'Add tasks with priorities, color labels, tags, notes, and subtasks. Tap to complete — you\'ll even get a confetti burst when you finish everything!',
  },
  {
    icon: <Kanban className="w-12 h-12 text-amber-400" />,
    bg: 'from-amber-500/20 to-orange-500/20',
    title: 'Multiple Views',
    body: 'Switch between Daily, Kanban Board, Weekly, and Calendar views. Use the Pomodoro timer and Focus Mode for deep work sessions.',
  },
  {
    icon: <BarChart3 className="w-12 h-12 text-rose-400" />,
    bg: 'from-rose-500/20 to-pink-500/20',
    title: 'Track Your Progress',
    body: 'Monitor completion rates, streaks, and productivity scores. Export your data anytime. Press ? for keyboard shortcuts.',
  },
];

interface OnboardingModalProps {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [slide, setSlide] = useState(0);
  const isLast = slide === SLIDES.length - 1;
  const current = SLIDES[slide];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {/* Gradient top area */}
            <div className={`flex flex-col items-center justify-center py-12 px-8 bg-gradient-to-br ${current.bg}`}>
              <div className="w-24 h-24 rounded-3xl bg-white/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
                {current.icon}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">{current.title}</h2>
            </div>

            {/* Body */}
            <div className="px-8 py-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed text-center">{current.body}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots + actions */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all ${i === slide ? 'w-5 bg-indigo-500' : 'w-2 bg-gray-200 dark:bg-gray-700'}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isLast && (
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-3 py-2 transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={() => isLast ? onClose() : setSlide(s => s + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              {isLast ? 'Get Started' : 'Next'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
