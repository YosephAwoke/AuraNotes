import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle, Flame } from 'lucide-react';

const TodoWidget = ({ todos, onAdd, onToggle, onDelete }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');

  const fireConfetti = async () => {
    const { default: confetti } = await import('canvas-confetti');
    confetti({
      particleCount: 25,
      spread: 30,
      origin: { y: 0.8 },
      colors: ['#10b981', '#14b8a6', '#f97316'],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({ text: text.trim(), priority });
    setText('');
  };

  // Trigger mini confetti shower on task completion
  const handleToggleClick = (todo) => {
    if (!todo.isCompleted) {
      fireConfetti();
    }
    onToggle(todo);
  };

  // Math for circular progress ring
  const completedCount = todos.filter((t) => t.isCompleted).length;
  const totalCount = todos.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  const priorityColors = {
    low: 'text-cyber-emerald bg-cyber-emerald/10 border-cyber-emerald/20',
    medium: 'text-cyber-amber bg-cyber-amber/10 border-cyber-amber/20',
    high: 'text-cyber-rose bg-cyber-rose/10 border-cyber-rose/20',
  };

  return (
    <div className="glass-panel border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col h-full">
      
      {/* Header Info with Progress Circle */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-6">
        <div>
          <h3 className="font-bold text-lg font-sans tracking-tight">Focus Tasks</h3>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">Streamline your micro-deliverables</p>
        </div>
        
        {/* Dynamic Progress Circle */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              className="text-slate-200 dark:text-slate-800"
              fill="transparent"
            />
            <motion.circle
              cx="28"
              cy="28"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              className="text-primary-500 dark:text-primary-400"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          </svg>
          <span className="absolute text-[10px] font-extrabold tracking-tighter">
            {completionRate}%
          </span>
        </div>
      </div>

      {/* Task Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Add micro task..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/45 dark:bg-slate-900/35 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900/55 focus:outline-none transition-all text-sm font-sans dark:text-slate-100"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            className="absolute right-2 p-1.5 rounded-lg bg-gradient-to-tr from-primary-500 to-cyber-violet text-white shadow-sm"
          >
            <Plus size={16} />
          </motion.button>
        </div>

        {/* Priority Filter Selection */}
        <div className="flex items-center gap-1.5 justify-end">
          <span className="text-xs text-slate-400 font-bold uppercase mr-1 flex items-center gap-1">
            <Flame size={12} /> Priority:
          </span>
          {['low', 'medium', 'high'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`px-3 py-1 rounded-md text-xs font-bold border capitalize transition-all ${
                priority === p
                  ? p === 'low'
                    ? 'bg-cyber-emerald text-white border-cyber-emerald shadow-sm shadow-cyber-emerald/25'
                    : p === 'medium'
                    ? 'bg-cyber-amber text-white border-cyber-amber shadow-sm shadow-cyber-amber/25'
                    : 'bg-cyber-rose text-white border-cyber-rose shadow-sm shadow-cyber-rose/25'
                    : 'bg-white/20 dark:bg-slate-900/20 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 border-slate-200 dark:border-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </form>

      {/* Checklist Timeline */}
      <div className="flex-1 overflow-y-auto max-h-[300px] pr-1.5">
        <AnimatePresence mode="popLayout">
          {todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 h-full min-h-[150px]">
              <AlertCircle size={24} className="stroke-[1.2] mb-1.5 text-slate-300 dark:text-slate-700" />
              <p className="text-sm">No active tasks.</p>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">Focus and checklist items appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todos.map((todo) => (
                <motion.div
                  key={todo._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 group transition-all duration-300 ${
                    todo.isCompleted
                        ? 'bg-slate-100/40 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-700/70'
                        : 'bg-white/35 dark:bg-slate-900/25 border-slate-200/70 dark:border-slate-700/80 hover:bg-white/70 dark:hover:bg-slate-900/45 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Circle click toggle checkbox */}
                    <button
                      onClick={() => handleToggleClick(todo)}
                      className={`flex-shrink-0 transition-colors ${
                        todo.isCompleted ? 'text-cyber-emerald' : 'text-slate-500 dark:text-slate-300 hover:text-primary-500'
                      }`}
                    >
                      {todo.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>

                    <span
                      className={`text-sm font-medium font-sans truncate transition-all duration-300 ${
                        todo.isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>

                  {/* Priority Label & Delete Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${priorityColors[todo.priority]}`}>
                      {todo.priority}
                    </span>

                    <button
                      onClick={() => onDelete(todo._id)}
                      className="p-1 rounded-md text-slate-400 hover:text-cyber-rose hover:bg-cyber-rose/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      title="Delete objective"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default TodoWidget;
