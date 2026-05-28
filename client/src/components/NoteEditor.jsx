import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Sparkles,
  Save,
  Clock,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

const NoteEditor = ({ activeNote, onSave, onHistoryOpen, onClose }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: activeNote ? activeNote.content : '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert focus:outline-none max-w-none text-slate-900 dark:text-slate-100 min-h-[320px] p-6 text-base md:text-lg leading-relaxed font-sans',
      },
    },
  });

  // Load active note content when note changes
  useEffect(() => {
    if (editor && activeNote) {
      // Avoid replacing if it's already exactly the same to preserve cursor position
      if (editor.getHTML() !== activeNote.content) {
        editor.commands.setContent(activeNote.content || '');
      }
    }
  }, [activeNote, editor]);

  if (!editor || !activeNote) return null;

  const handleSaveClick = () => {
    const rawContent = editor.getHTML();
    onSave({
      ...activeNote,
      content: rawContent,
    });
  };

  const MenuBarButton = ({ onClick, isActive, children, title }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-2 rounded-xl transition-all duration-300 ${
        isActive
            ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'
      }`}
      title={title}
      type="button"
    >
      {children}
    </motion.button>
  );

  return (
    <div className="flex flex-col h-full bg-white/45 dark:bg-slate-900/45 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl">
      {/* Editor custom rich toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-slate-200 dark:border-slate-700 bg-white/65 dark:bg-slate-900/70">
        
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-1">
          <MenuBarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold Text"
          >
            <Bold size={15} />
          </MenuBarButton>
          
          <MenuBarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic Text"
          >
            <Italic size={15} />
          </MenuBarButton>

          <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          <MenuBarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={15} />
          </MenuBarButton>

          <MenuBarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={15} />
          </MenuBarButton>

          <MenuBarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={15} />
          </MenuBarButton>

          <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          <MenuBarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={15} />
          </MenuBarButton>

          <MenuBarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={15} />
          </MenuBarButton>

          <MenuBarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <Quote size={15} />
          </MenuBarButton>

          <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-800 mx-1" />

          <MenuBarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo size={15} />
          </MenuBarButton>

          <MenuBarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Redo size={15} />
          </MenuBarButton>
        </div>

        {/* Global Save / History Actions */}
        <div className="flex items-center gap-2">
          {/* History / Revision timeline trigger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onHistoryOpen}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 text-slate-500 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-300 font-semibold text-xs flex items-center gap-1.5 transition-all duration-300"
            title="View Revision Timeline"
            type="button"
          >
            <Clock size={14} />
            <span className="hidden sm:inline">Versions</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-950">
              v{activeNote.version}
            </span>
          </motion.button>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveClick}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary-500 to-cyber-violet hover:from-primary-600 hover:to-cyber-violet text-white text-xs font-bold tracking-wide shadow-md shadow-primary-500/20 flex items-center gap-1.5 transition-all"
            type="button"
          >
            <Save size={14} />
            <span>Save</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-cyber-rose dark:hover:border-cyber-rose hover:bg-cyber-rose/10 text-slate-500 dark:text-slate-200 hover:text-cyber-rose font-semibold text-xs flex items-center gap-1.5 transition-all duration-300"
            title="Close editor"
            type="button"
          >
            <X size={14} />
            <span>Close</span>
          </motion.button>
        </div>

      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto bg-white/15 dark:bg-slate-900/35 min-h-[300px]">
        <EditorContent editor={editor} />
      </div>

      {/* Editor Footer Status */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700/60 bg-white/25 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-300">
        <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-300">
          <Sparkles size={11} className="text-primary-500" /> Auto-Save Active
        </span>
        <span>
          Last updated: {new Date(activeNote.updatedAt || activeNote.createdAt || Date.now()).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default NoteEditor;
