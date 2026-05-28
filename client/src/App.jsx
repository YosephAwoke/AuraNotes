import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Search,
  Pin,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  Edit3,
  Palette,
  FolderPlus,
  Folder,
  Eye,
  List as ListIcon,
} from 'lucide-react';
import API from './utils/api';

// Components
import Navbar from './components/Navbar';
import GlassCard from './components/GlassCard';
import EmptyState from './components/EmptyState';

const AuthModal = lazy(() => import('./components/AuthModal'));
const NoteEditor = lazy(() => import('./components/NoteEditor'));
const TodoWidget = lazy(() => import('./components/TodoWidget'));
const HistorySidebar = lazy(() => import('./components/HistorySidebar'));

const App = () => {
  // Theme & Session
  const [theme, setTheme] = useState(localStorage.getItem('aura_theme') || 'dark');
  const [user, setUser] = useState(null);
  
  // Data Lists
  const [notes, setNotes] = useState([]);
  const [todos, setTodos] = useState([]);
  
  // View Controls
  const [viewMode, setViewMode] = useState('card'); // 'card' (default 3D), 'components', 'list'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  
  // Active states
  const [activeNote, setActiveNote] = useState(null);
  
  // Modals & Panels
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // New Note Custom Setup Modal
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createCategory, setCreateCategory] = useState('General');
  const [createColor, setCreateColor] = useState('#14b8a6');

  // Custom Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState(null); // { x, y, note }
  const [renameNote, setRenameNote] = useState(null); // note being renamed
  const [renameValue, setRenameValue] = useState('');

  const contextMenuRef = useRef(null);

  const fireConfetti = async (options) => {
    const { default: confetti } = await import('canvas-confetti');
    confetti(options);
  };

  const backgroundGlyphs = [
    { icon: Sparkles, top: '12%', left: '6%', delay: 0.0, size: 52 },
    { icon: Layers, top: '22%', right: '8%', delay: 0.8, size: 58 },
    { icon: Eye, bottom: '18%', left: '10%', delay: 1.2, size: 50 },
    { icon: ListIcon, bottom: '24%', right: '14%', delay: 1.7, size: 56 },
  ];

  // Sync theme with HTML class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  useEffect(() => {
    const splash = window.document.getElementById('boot-splash');
    if (!splash) return;
    splash.style.opacity = '0';
    splash.style.transition = 'opacity 220ms ease';
    const timeoutId = window.setTimeout(() => {
      splash.remove();
    }, 240);
    return () => window.clearTimeout(timeoutId);
  }, []);

  // Load User session & Initial Data
  useEffect(() => {
    const localUser = localStorage.getItem('aura_user');
    const localToken = localStorage.getItem('aura_token');

    if (localUser && localToken) {
      setUser(JSON.parse(localUser));
    }
  }, []);

  // Fetch dashboard data on session changes only.
  // Search/filter/sort run client-side to avoid repeated API calls.
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setNotes([]);
      setTodos([]);
      setActiveNote(null);
    }
  }, [user]);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleAuthSuccess = (data) => {
    setUser({ username: data.username, email: data.email });
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    setUser(null);
    setNotes([]);
    setTodos([]);
    setActiveNote(null);
  };

  const fetchDashboardData = async () => {
    setIsInitialLoading(true);
    try {
      await Promise.all([fetchNotes(), fetchTodos()]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // API Call: Fetch Notes
  const fetchNotes = async () => {
    try {
      const { data } = await API.get('/notes');
      setNotes(data);

      if (activeNote) {
        const updatedActive = data.find((n) => n._id === activeNote._id);
        if (updatedActive) {
          setActiveNote(updatedActive);
        }
      }
    } catch (err) {
      console.error('Fetch notes failed:', err);
    }
  };

  // API Call: Create Custom Note
  const handleCreateCustomNote = async (e) => {
    e.preventDefault();
    if (!user) {
      setIsCreateNoteOpen(false);
      setIsAuthOpen(true);
      return;
    }
    
    if (!createTitle.trim()) return;

    try {
      const { data } = await API.post('/notes', {
        title: createTitle.trim(),
        content: '<p>Start typing your masterpiece here...</p>',
        category: createCategory,
        color: createColor,
      });

      fireConfetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.6 },
        colors: [createColor, '#f97316', '#ef4444'],
      });

      setNotes([data, ...notes]);
      setActiveNote(data); // Open instantly in editor
      setIsCreateNoteOpen(false);
      setCreateTitle('');
      setCreateCategory('General');
      setCreateColor('#14b8a6');
    } catch (err) {
      console.error('Create note failed:', err);
    }
  };

  const handleAddClick = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      setIsCreateNoteOpen(true);
    }
  };

  // API Call: Update / Save Note
  const handleSaveNote = async (updatedNote) => {
    try {
      const { data } = await API.put(`/notes/${updatedNote._id}`, updatedNote);
      setNotes(notes.map((n) => (n._id === data._id ? data : n)));
      setActiveNote(data);
    } catch (err) {
      console.error('Save note failed:', err);
    }
  };

  // API Call: Delete Note
  const handleDeleteNote = async (noteId) => {
    try {
      await API.delete(`/notes/${noteId}`);
      setNotes(notes.filter((n) => n._id !== noteId));
      if (activeNote && activeNote._id === noteId) {
        setActiveNote(null);
      }
    } catch (err) {
      console.error('Delete note failed:', err);
    }
  };

  // API Call: Pin Toggle
  const handleTogglePin = async (note) => {
    try {
      const { data } = await API.put(`/notes/${note._id}`, { isPinned: !note.isPinned });
      setNotes(notes.map((n) => (n._id === data._id ? data : n)));
      if (activeNote && activeNote._id === note._id) {
        setActiveNote(data);
      }
    } catch (err) {
      console.error('Toggle pin failed:', err);
    }
  };

  // API Call: Quick Update (rename, category, color)
  const handleQuickUpdateNote = async (noteId, payload) => {
    try {
      const { data } = await API.put(`/notes/${noteId}`, payload);
      setNotes(notes.map((n) => (n._id === data._id ? data : n)));
      if (activeNote && activeNote._id === noteId) {
        setActiveNote(data);
      }
    } catch (err) {
      console.error('Quick update note failed:', err);
    }
  };

  // API Call: Restore Older Note Version
  const handleRevertVersion = async (historyId) => {
    if (!activeNote) return;
    try {
      const { data } = await API.put(`/notes/${activeNote._id}/revert/${historyId}`);
      setNotes(notes.map((n) => (n._id === data._id ? data : n)));
      setActiveNote(data);
      setIsHistoryOpen(false);
      
      fireConfetti({
        particleCount: 40,
        spread: 50,
        colors: ['#14b8a6', '#f97316'],
      });
    } catch (err) {
      console.error('Revert version failed:', err);
    }
  };

  // API Call: Fetch Todos
  const fetchTodos = async () => {
    try {
      const { data } = await API.get('/todos');
      setTodos(data);
    } catch (err) {
      console.error('Fetch todos failed:', err);
    }
  };

  // API Call: Create Todo
  const handleAddTodo = async (newTodo) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const { data } = await API.post('/todos', newTodo);
      setTodos([data, ...todos]);
    } catch (err) {
      console.error('Add todo failed:', err);
    }
  };

  // API Call: Toggle Todo Completed status
  const handleToggleTodo = async (todo) => {
    try {
      const { data } = await API.put(`/todos/${todo._id}`, { isCompleted: !todo.isCompleted });
      setTodos(todos.map((t) => (t._id === data._id ? data : t)));
    } catch (err) {
      console.error('Toggle todo failed:', err);
    }
  };

  // API Call: Delete Todo
  const handleDeleteTodo = async (todoId) => {
    try {
      await API.delete(`/todos/${todoId}`);
      setTodos(todos.filter((t) => t._id !== todoId));
    } catch (err) {
      console.error('Delete todo failed:', err);
    }
  };

  // Custom Right-Click Context Menu Trigger
  const handleContextMenu = (e, note) => {
    e.preventDefault();
    if (!user) return; // Only allow context menu for authenticated users
    
    // Position menu at cursor coordinates
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      note,
    });
  };

  // Start Rename inline
  const startRename = (note) => {
    setRenameNote(note);
    setRenameValue(note.title);
    setContextMenu(null);
  };

  const handleRenameSubmit = async (e, noteId) => {
    e.preventDefault();
    if (!renameValue.trim()) return;
    await handleQuickUpdateNote(noteId, { title: renameValue.trim() });
    setRenameNote(null);
  };

  // Extract clean text from HTML content for thumbnail view
  const getThumbnailContent = (html) => {
    if (!html) return 'Start typing...';
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const filteredNotes = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    let result = notes.filter((note) => {
      const categoryMatches = selectedCategory === 'All' || note.category === selectedCategory;
      if (!categoryMatches) return false;
      if (!searchLower) return true;

      const title = (note.title || '').toLowerCase();
      const content = getThumbnailContent(note.content || '').toLowerCase();
      return title.includes(searchLower) || content.includes(searchLower);
    });

    result = [...result].sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }

      if (sortOption === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortOption === 'alphabetical') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });

    return result;
  }, [notes, search, selectedCategory, sortOption]);

  const categories = ['All', 'General', 'Work', 'Personal', 'Ideas', 'Creative'];
  const colors = [
    { value: '#14b8a6', label: 'Teal' },
    { value: '#f97316', label: 'Orange' },
    { value: '#ef4444', label: 'Coral' },
    { value: '#22c55e', label: 'Green' },
    { value: '#eab308', label: 'Gold' },
    { value: '#06b6d4', label: 'Cyan' },
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-800 dark:text-slate-200 transition-colors duration-300 relative pb-12 md:pb-16 overflow-x-hidden">
      
      {/* 3D Floating Background Blobs - Animating dynamically */}
      <motion.div
        className="absolute top-[6%] left-[2%] w-[520px] h-[520px] bg-blob-indigo rounded-full blur-[105px] pointer-events-none"
        animate={{ x: [0, 30, -18, 0], y: [0, -20, 16, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[36%] right-[2%] w-[460px] h-[460px] bg-blob-cyan rounded-full blur-[95px] pointer-events-none"
        animate={{ x: [0, -22, 24, 0], y: [0, 20, -10, 0], scale: [1, 0.95, 1.06, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[7%] left-[14%] w-[430px] h-[430px] bg-blob-rose rounded-full blur-[100px] pointer-events-none"
        animate={{ x: [0, 18, -12, 0], y: [0, -12, 22, 0], scale: [1, 1.04, 0.94, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
        {backgroundGlyphs.map(({ icon: Icon, top, left, right, bottom, delay, size }, index) => (
          <motion.div
            key={`${index}-${delay}`}
            className="absolute text-primary-500/30 dark:text-primary-200/35 drop-shadow-[0_0_24px_rgba(20,184,166,0.25)] dark:drop-shadow-[0_0_28px_rgba(14,165,233,0.35)]"
            style={{ top, left, right, bottom }}
            animate={{ y: [0, -18, 0], x: [0, 8, -6, 0], rotate: [0, 8, -6, 0], opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 7 + index, repeat: Infinity, ease: 'easeInOut', delay }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </motion.div>
        ))}
      </div>

      {/* Navbar Container */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogoutClick={handleLogout}
      />

      {/* Main Core Layout Grid */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-5 md:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 relative z-10">
        
        {/* Left Side: Notes list & Controls (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Controls Bar: Search & View Options */}
          <div className="glass-panel rounded-3xl p-5 md:p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4 shadow-md backdrop-blur-xl">
            
            {/* Row 1: Search & Add Note */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Fuzzy search titles & contents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/35 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900/50 focus:outline-none transition-all text-base font-sans"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(14, 165, 233, 0.45)' }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAddClick}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-cyber-violet text-white text-base font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
              >
                <Plus size={18} />
                <span>New Space</span>
              </motion.button>
            </div>

            {/* Row 2: Filtering Categories & Layout Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-850">
              
              {/* Category tags */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide border transition-all ${
                      selectedCategory === cat
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-sm'
                        : 'bg-white/30 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:border-slate-350 dark:hover:border-slate-700 border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Layout view controls */}
              <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                {[
                  { mode: 'card', icon: <Sparkles size={14} />, label: '3D Card' },
                  { mode: 'components', icon: <Layers size={14} />, label: 'Components' },
                  { mode: 'list', icon: <ListIcon size={14} />, label: 'List' },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => setViewMode(item.mode)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      viewMode === item.mode
                        ? 'bg-white dark:bg-slate-950 text-primary-500 dark:text-primary-400 shadow-sm border border-slate-250 dark:border-slate-850'
                        : 'text-slate-450 hover:text-slate-600 dark:hover:text-slate-350'
                    }`}
                    title={`${item.label} View`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

            </div>

          </div>

          {/* Notes display zone - Increased text size & high-contrast glass readability */}
          <div className="flex-1">
            {isInitialLoading ? (
              <div className="glass-panel rounded-3xl p-8 border border-slate-200/60 dark:border-slate-700/50 text-sm text-slate-600 dark:text-slate-200 flex flex-col items-center justify-center gap-5 min-h-[320px]">
                <motion.div
                  className="relative w-16 h-16"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="absolute inset-0 rounded-full border-4 border-primary-200/70 dark:border-primary-900/60" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 border-r-cyber-violet" />
                  <div className="absolute inset-3 rounded-full bg-primary-500/10 dark:bg-slate-800/50 flex items-center justify-center text-primary-500 dark:text-primary-300">
                    <Sparkles size={18} />
                  </div>
                </motion.div>
                <div className="text-center">
                  <div className="text-base font-semibold text-slate-700 dark:text-slate-100">Loading your workspace</div>
                  <div className="text-xs text-slate-500 dark:text-slate-300 mt-1">Fetching notes, tasks, and layout</div>
                </div>
                <div className="w-full max-w-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((item) => (
                    <motion.div
                      key={item}
                      className="h-20 rounded-2xl bg-white/50 dark:bg-slate-900/35 border border-slate-200/70 dark:border-slate-700/70"
                      animate={{ opacity: [0.45, 0.95, 0.45], y: [0, -2, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: item * 0.12 }}
                    />
                  ))}
                </div>
              </div>
            ) : filteredNotes.length === 0 ? (
              <EmptyState onAction={handleAddClick} />
            ) : (
              <AnimatePresence mode="popLayout">
                {/* 3D Card View Rendering */}
                {viewMode === 'card' && (
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
                  >
                    {filteredNotes.map((note) => (
                      <GlassCard
                        key={note._id}
                        onClick={() => setActiveNote(note)}
                        onContextMenu={(e) => handleContextMenu(e, note)}
                        accentColor={note.color}
                        className={`p-5 md:p-6 group flex flex-col justify-between h-[228px] relative border-t-[6px] transition-all`}
                        style={{ borderTopColor: note.color }}
                      >
                        {/* Pinned Icon */}
                        {note.isPinned && (
                          <span className="absolute top-5 right-5 text-primary-500 dark:text-primary-400 z-10">
                            <Pin size={15} className="fill-current" />
                          </span>
                        )}

                        <div className="flex flex-col gap-2 min-w-0 pr-6 relative z-10">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400">
                            {note.category}
                          </span>

                          {/* Inline Rename Form or Normal Title */}
                          {renameNote && renameNote._id === note._id ? (
                            <form
                              onSubmit={(e) => handleRenameSubmit(e, note._id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full mt-1"
                            >
                              <input
                                type="text"
                                autoFocus
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={(e) => handleRenameSubmit(e, note._id)}
                                className="w-full px-2 py-1 text-sm font-bold rounded bg-slate-100 dark:bg-slate-900 border border-primary-500 outline-none text-slate-800 dark:text-slate-200"
                              />
                            </form>
                          ) : (
                            <h4 className="font-bold text-base font-sans leading-tight text-slate-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                              {note.title}
                            </h4>
                          )}

                          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200/90 line-clamp-4 mt-1.5 font-sans font-normal">
                            {getThumbnailContent(note.content)}
                          </p>
                        </div>

                        {/* Card bottom actions */}
                        <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/60 pt-4 mt-3 relative z-10">
                          <span className="text-[11px] md:text-xs text-slate-500 dark:text-slate-300 font-semibold">
                            v{note.version} • {new Date(note.updatedAt).toLocaleDateString()}
                          </span>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePin(note);
                              }}
                              className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors ${
                                note.isPinned ? 'text-primary-500' : 'text-slate-450'
                              }`}
                              title={note.isPinned ? 'Unpin concept' : 'Pin concept'}
                            >
                              <Pin size={13} className={note.isPinned ? 'fill-current' : ''} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note._id);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyber-rose hover:bg-cyber-rose/10 transition-colors"
                              title="Delete concept"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </motion.div>
                )}

                {/* Components View Rendering */}
                {viewMode === 'components' && (
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {filteredNotes.map((note, index) => (
                      <motion.div
                        layout
                        key={note._id}
                        onClick={() => setActiveNote(note)}
                        onContextMenu={(e) => handleContextMenu(e, note)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="glass-panel p-5 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-all shadow-sm group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="min-w-0">
                            <h4 className="font-bold text-base md:text-lg text-slate-900 dark:text-white truncate group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                              {note.title}
                            </h4>
                            <p className="text-xs md:text-sm mt-1 text-slate-600 dark:text-slate-200/85 line-clamp-3">
                              {getThumbnailContent(note.content)}
                            </p>
                          </div>
                          <span className="w-3.5 h-3.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: note.color }} />
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
                          <span className="text-[11px] md:text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                            {note.category}
                          </span>
                          <div className="flex items-center gap-2">
                            {note.isPinned && <Pin size={14} className="text-primary-500 fill-current" />}
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">v{note.version}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Vertical Compact List View Rendering */}
                {viewMode === 'list' && (
                  <motion.div
                    layout
                    className="flex flex-col gap-2.5"
                  >
                    {filteredNotes.map((note) => (
                      <motion.div
                        layout
                        key={note._id}
                        onClick={() => setActiveNote(note)}
                        onContextMenu={(e) => handleContextMenu(e, note)}
                        whileHover={{ x: 3 }}
                        className="glass-panel p-4 rounded-2xl cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 border border-slate-200/70 dark:border-slate-700/70 transition-all flex items-center justify-between gap-4 group shadow-sm"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: note.color }} />
                          
                          {note.isPinned && <Pin size={13} className="text-primary-500 flex-shrink-0 fill-current" />}

                          <div className="min-w-0">
                            <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">{note.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-200/85 truncate mt-0.5 max-w-md">
                              {getThumbnailContent(note.content)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold bg-slate-100/80 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
                            {note.category}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-300/80 hidden sm:inline font-semibold">
                            v{note.version}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note._id);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-cyber-rose opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

        </section>

        {/* Right Side: Active Note Editor & Todo Panel (5 Cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Rich Editor Panel */}
          {activeNote ? (
            <div className="h-[500px] md:h-[560px]">
              <Suspense fallback={<div className="glass-panel h-full rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-6">Loading editor...</div>}>
                <NoteEditor
                  activeNote={activeNote}
                  onSave={handleSaveNote}
                  onHistoryOpen={() => setIsHistoryOpen(true)}
                  onClose={() => setActiveNote(null)}
                />
              </Suspense>
            </div>
          ) : (
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 text-center backdrop-blur-xl shadow-md py-16 flex flex-col items-center justify-center h-[240px]">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-950/40 text-primary-500 dark:text-primary-400 flex items-center justify-center mb-4">
                <BookOpen size={24} />
              </div>
              <h3 className="font-bold text-base mb-1">Select a Workspace note</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mb-4">
                Click any card or list item on the left to reveal the custom spatial rich-text document workspace.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddClick}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-500 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Add Custom Note
              </motion.button>
            </div>
          )}

          {/* Checklist Widget */}
          <div className="flex-1 min-h-[380px]">
            <Suspense fallback={<div className="glass-panel h-full rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-6">Loading tasks...</div>}>
              <TodoWidget
                todos={todos}
                onAdd={handleAddTodo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
              />
            </Suspense>
          </div>

        </section>

      </main>

      {/* Auth Modal - Allow closing to view dashboard design */}
      <AnimatePresence>
        {isAuthOpen && (
          <Suspense fallback={null}>
            <AuthModal
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)} // Allowed closing freely!
              onAuthSuccess={handleAuthSuccess}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* History Slide Drawer */}
      <Suspense fallback={null}>
        <HistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          note={activeNote}
          onRevert={handleRevertVersion}
        />
      </Suspense>

      {/* High-Fidelity Custom Right-Click Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={contextMenuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 w-52 glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 backdrop-blur-xl flex flex-col gap-1"
            style={{
              left: `${Math.min(contextMenu.x, window.innerWidth - 220)}px`,
              top: `${Math.min(contextMenu.y, window.innerHeight - 300)}px`,
            }}
          >
            {/* Open item */}
            <button
              onClick={() => {
                setActiveNote(contextMenu.note);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left hover:bg-primary-500 hover:text-white transition-colors"
            >
              <Eye size={14} />
              Open Space Document
            </button>

            {/* Pin Toggle */}
            <button
              onClick={() => {
                handleTogglePin(contextMenu.note);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Pin size={14} />
              {contextMenu.note.isPinned ? 'Unpin Document' : 'Pin to Top'}
            </button>

            {/* Rename */}
            <button
              onClick={() => startRename(contextMenu.note)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Edit3 size={14} />
              Rename Title
            </button>

            <div className="w-full h-[1px] bg-slate-200/50 dark:bg-slate-800 my-1" />

            {/* Category selection */}
            <div className="px-3.5 py-1.5 text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1">
              <Layers size={10} /> Change Category
            </div>
            <div className="grid grid-cols-2 gap-1 px-2 mb-1">
              {categories.slice(1).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    handleQuickUpdateNote(contextMenu.note._id, { category: cat });
                    setContextMenu(null);
                  }}
                  className={`px-1.5 py-1 rounded text-[10px] font-bold text-center border transition-all ${
                    contextMenu.note.category === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent'
                      : 'bg-white/20 dark:bg-slate-900/10 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Color selection */}
            <div className="px-3.5 py-1.5 text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1 border-t border-slate-150 dark:border-slate-850 pt-2">
              <Palette size={10} /> Color Theme
            </div>
            <div className="flex items-center gap-1.5 px-3.5 pb-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    handleQuickUpdateNote(contextMenu.note._id, { color: c.value });
                    setContextMenu(null);
                  }}
                  className={`w-4.5 h-4.5 rounded-full border transition-transform hover:scale-125 ${
                    contextMenu.note.color === c.value
                      ? 'border-slate-900 dark:border-white scale-110 shadow-sm'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>

            <div className="w-full h-[1px] bg-slate-200/50 dark:bg-slate-800 my-1" />

            {/* Delete note */}
            <button
              onClick={() => {
                handleDeleteNote(contextMenu.note._id);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left hover:bg-cyber-rose hover:text-white text-cyber-rose transition-colors"
            >
              <Trash2 size={14} />
              Delete Document
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Frosted Custom Note Creation Modal */}
      <AnimatePresence>
        {isCreateNoteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateNoteOpen(false)}
              className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-md glass-panel border border-white/20 dark:border-white/10 rounded-3xl p-6 shadow-2xl relative z-10"
            >
              <h3 className="font-extrabold text-lg mb-1 tracking-tight flex items-center gap-2 font-sans">
                <FolderPlus className="text-primary-500" size={20} /> Create Creative Document
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 font-sans">Design your space coordinate and document attributes</p>

              <form onSubmit={handleCreateCustomNote} className="flex flex-col gap-4">
                
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Document Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 Interactive Systems Plan"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-sm font-sans"
                  />
                </div>

                {/* Category selectors */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Folder size={11} /> Attribute Tag
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.slice(1).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCreateCategory(cat)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          createCategory === cat
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-sm'
                            : 'bg-white/20 dark:bg-slate-900/10 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Palette size={11} /> Border Canvas Accent
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-white/30 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                    {colors.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCreateColor(c.value)}
                        className={`w-7 h-7 rounded-full border transition-transform hover:scale-110 flex items-center justify-center ${
                          createColor === c.value
                            ? 'border-slate-900 dark:border-white scale-105 shadow'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 mt-1 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsCreateNoteOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-cyber-violet text-white text-sm font-extrabold tracking-wide shadow-md shadow-primary-500/25 flex items-center gap-1.5"
                  >
                    <span>Launch Space</span>
                    <ArrowRight size={13} />
                  </motion.button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default App;
