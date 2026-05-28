import React from 'react';
import { Sun, Moon, LogIn, LogOut, User, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = ({ theme, toggleTheme, user, onLoginClick, onLogoutClick }) => {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 w-full px-6 py-4"
    >
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-6 py-3 flex items-center justify-between border border-white/20 dark:border-white/10 shadow-lg backdrop-blur-md">
        
        {/* Brand Logo */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
          className="flex items-center"
        >
          <img
            src={theme === 'dark' ? '/darklogo.png' : '/whitelogo.png'}
            alt="NoteApp logo"
            className="h-11 md:h-12 w-auto object-contain"
          />
        </motion.div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          
          {/* Light/Dark Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/45 dark:bg-slate-900/35 text-slate-600 dark:text-slate-200 hover:text-primary-500 dark:hover:text-primary-300 hover:bg-white dark:hover:bg-slate-900/55 transition-all duration-300"
            title="Toggle Visual Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* User Session Profile & Actions */}
          {user ? (
            <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-700 pl-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs text-slate-400 dark:text-slate-300 uppercase tracking-widest font-bold">Authenticated</span>
                <span className="text-sm font-semibold truncate max-w-[120px]">{user.username}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/45 border border-primary-200 dark:border-primary-700/50 flex items-center justify-center text-primary-600 dark:text-primary-300">
                <User size={16} />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogoutClick}
                className="p-2 rounded-xl text-cyber-rose bg-cyber-rose/5 hover:bg-cyber-rose/10 border border-cyber-rose/10 transition-all duration-300 flex items-center gap-2 text-xs font-semibold"
                title="Disconnect Account"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoginClick}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-cyber-violet hover:from-primary-600 hover:to-cyber-violet text-white text-xs font-bold tracking-wide shadow-md shadow-primary-500/10 flex items-center gap-2 transition-all"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </motion.button>
            </div>
          )}

        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
