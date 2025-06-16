import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import useStore from './store/useStore';
import RichTextEditor from './components/RichTextEditor';
import AIAssistant from './components/AIAssistant';
import NotesList from './components/NotesList';
import Toolbar from './components/Toolbar';

function App() {
  const {
    theme,
    setTheme,
    searchQuery,
    setSearchQuery,
    settings,
    setSettings,
    createNote,
    getFilteredNotes,
    getActiveNote
  } = useStore();

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} font-sans`}>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 transition-all duration-500">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          className="w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl m-4 flex flex-col shadow-none border-none"
        >
          <div className="p-6 flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">📝 PlayPower Notes</h1>
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                title="Toggle theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input bg-white/80 dark:bg-gray-900/80 border-none shadow-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={createNote}
              className="btn btn-primary w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 text-base font-semibold transition"
            >
              <span className="mr-2">➕</span> New Note
            </button>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <NotesList notes={getFilteredNotes()} />
            </div>
          </div>
        </motion.aside>
        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.1 }}
          className="flex-1 flex flex-col bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-3xl m-4 transition-all duration-500 shadow-none"
        >
          <Toolbar />
          <div className="flex-1 overflow-hidden p-6">
            <RichTextEditor />
          </div>
        </motion.main>
      </div>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
          },
        }}
      />
    </div>
  );
}

export default App;
