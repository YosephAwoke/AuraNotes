import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';
import API from '../utils/api';
import confetti from 'canvas-confetti';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email, password } 
        : { username, email, password };

      const { data } = await API.post(endpoint, payload);
      
      // Save credentials locally
      localStorage.setItem('aura_token', data.token);
      localStorage.setItem('aura_user', JSON.stringify({ username: data.username, email: data.email }));
      
      // Fun visual feedback on successful log in/sign up!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#0ea5e9', '#8b5cf6', '#d946ef'],
      });

      onAuthSuccess(data);
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay blurring back-content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md"
      />

      {/* Main Glass Panel Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-md glass-panel rounded-3xl p-8 z-10 border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Background glow effects inside modal */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-cyber-purple/20 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-cyber-violet flex items-center justify-center text-white mb-3 shadow-lg shadow-primary-500/20">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-2xl font-bold font-sans tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isLogin ? 'Access your creative spatial dashboard' : 'Unlock a premium interactive environment'}
          </p>
        </div>

        {/* Error payload */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 text-rose-700 dark:text-rose-200 text-xs font-semibold text-center shadow-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="relative"
              >
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Creative Nickname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-sm font-sans"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Mail size={16} />
            </span>
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-sm font-sans"
            />
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Lock size={16} />
            </span>
            <input
              type="password"
              required
              placeholder="Secure Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-sm font-sans"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-primary-500 to-cyber-violet text-white font-semibold text-sm tracking-wide shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Access Account' : 'Initialize Account'}
            {!loading && <ArrowRight size={15} />}
          </motion.button>
        </form>

        {/* Form Toggle Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account?" : 'Already registered?'}
            <button
              onClick={toggleMode}
              className="ml-1 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-semibold underline underline-offset-4"
            >
              {isLogin ? 'Create one now' : 'Access here'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
