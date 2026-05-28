import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

const EmptyState = ({ type = 'notes', actionText = 'Create Note', onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center p-8 text-center glass-panel rounded-2xl max-w-lg mx-auto border-dashed border-2 py-16"
    >
      <div className="relative mb-6">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-20 h-20 bg-primary-100 dark:bg-primary-950/40 rounded-full flex items-center justify-center text-primary-500 dark:text-primary-400 shadow-lg shadow-primary-500/10"
        >
          <BookOpen size={38} className="stroke-[1.5]" />
        </motion.div>
        <motion.div
          animate={{
            y: [-4, 4, -4],
            x: [-2, 2, -2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1 -right-1 text-cyber-rose bg-white dark:bg-slate-900 p-1.5 rounded-full shadow-md"
        >
          <Sparkles size={16} />
        </motion.div>
      </div>

      <h3 className="text-xl font-bold font-sans tracking-tight mb-2">
        {type === 'notes' ? 'No notes discovered' : 'Your checklist is clean'}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
        {type === 'notes'
          ? 'Every brilliant idea begins with a single word. Unfurl your thoughts and let your productivity soar.'
          : 'All tasks completed. You are fully aligned and ahead of schedule! Capture a new objective to begin.'}
      </p>

      {onAction && (
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-cyber-violet text-white text-sm font-semibold tracking-wide shadow-md transition-all duration-300 flex items-center gap-2"
        >
          <Sparkles size={16} />
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
