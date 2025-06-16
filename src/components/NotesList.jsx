import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import useStore from '../store/useStore';

function decodeHTMLEntities(text) {
  const txt = document.createElement('textarea');
  txt.innerHTML = text;
  return txt.value;
}

const NotesList = () => {
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    deleteNote,
    togglePinNote
  } = useStore();

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
    return new Date(b.lastEdited) - new Date(a.lastEdited);
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      <AnimatePresence>
        {sortedNotes.map(note => (
          <motion.div
            key={note.id}
            variants={item}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className={`
              p-4 mb-2 rounded-xl cursor-pointer transition-all duration-200 bg-white/90 dark:bg-gray-900/90 border border-transparent
              ${note.id === activeNoteId
                ? 'ring-2 ring-blue-400 dark:ring-blue-600 scale-100'
                : 'hover:bg-blue-50 dark:hover:bg-blue-800 hover:scale-[1.01]'
              }
              ${note.pinned ? 'border-l-4 border-blue-400' : ''}
            `}
            onClick={() => setActiveNoteId(note.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold truncate text-gray-900 dark:text-white flex items-center gap-2">
                  {note.title || 'Untitled Note'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                  {decodeHTMLEntities(note.content.replace(/<[^>]+>/g, ''))}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                  {format(new Date(note.lastEdited), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2 ml-2">
                {note.pinned && (
                  <span className="text-blue-400" title="Pinned">📌</span>
                )}
                {note.encrypted && (
                  <span className="text-gray-400" title="Encrypted">🔒</span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this note?')) {
                      deleteNote(note.id);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-400 transition-all"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 dark:bg-blue-900 text-blue-500 dark:text-blue-200 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {notes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500 dark:text-gray-400"
        >
          No notes yet. Create your first note!
        </motion.div>
      )}
    </motion.div>
  );
};

export default NotesList;
