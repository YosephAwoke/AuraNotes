import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, RotateCcw, Clock, Layers } from 'lucide-react';

const HistorySidebar = ({ isOpen, onClose, note, onRevert }) => {
  if (!note) return null;

  // Format timestamps nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to extract clean text from raw HTML content for preview
  const getContentPreview = (html) => {
    if (!html) return 'Empty content';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body.textContent || "";
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay background dim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 backdrop-blur-xs"
          />

          {/* Glass Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 z-50 p-6 overflow-y-auto flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-2 text-primary-500">
                <History size={20} />
                <h3 className="font-bold text-lg font-sans">Revision Timeline</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Subheader */}
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Layers size={12} /> Active Document State
              </p>
              <h4 className="font-bold text-sm truncate">{note.title}</h4>
              <p className="text-xs text-slate-400 mt-1">Current Version: v{note.version}</p>
            </div>

            {/* Timeline */}
            <div className="flex-1 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Previous Versions ({note.history.length})</h4>
              
              {note.history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Clock size={36} className="stroke-[1] mb-2 text-slate-300 dark:text-slate-700 animate-pulse" />
                  <p className="text-xs">No previous modifications saved yet.</p>
                  <p className="text-[10px] mt-1 max-w-[200px]">Version history snapshots are created automatically when you update a note's title or content.</p>
                </div>
              ) : (
                <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800 flex flex-col gap-6">
                  {/* Map history reverse order to show newest snapshots at the top */}
                  {[...note.history].reverse().map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-primary-500 transition-colors border border-white dark:border-slate-950" />

                      <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 group-hover:bg-white/90 dark:group-hover:bg-slate-900/90 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            v{item.version}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock size={11} /> {formatDate(item.updatedAt)}
                          </span>
                        </div>

                        <div>
                          <h5 className="font-bold text-xs truncate group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                            {item.title}
                          </h5>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                            {getContentPreview(item.content)}
                          </p>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 dark:border-slate-800/60 pt-2 mt-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onRevert(item._id)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-950/80 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw size={10} />
                            Revert to v{item.version}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistorySidebar;
