import React, { useCallback, useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';
import useStore from '../store/useStore';

// Custom styles for the editor
const editorStyles = {
  '.ql-container': {
    fontSize: 'inherit',
    fontFamily: 'inherit',
    backgroundColor: 'transparent',
    border: 'none',
  },
  '.ql-editor': {
    padding: '1rem',
    minHeight: '200px',
    color: 'var(--text-color)',
    backgroundColor: 'transparent',
  },
  '.ql-toolbar': {
    border: 'none',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'transparent',
  },
  '.ql-toolbar button': {
    color: 'inherit',
  },
  '.ql-toolbar button:hover': {
    color: 'var(--primary-color)',
  },
  '.ql-toolbar button.ql-active': {
    color: 'var(--primary-color)',
  },
  '.ql-picker': {
    color: 'inherit',
  },
  '.ql-picker-options': {
    backgroundColor: 'var(--bg-color)',
    borderColor: 'var(--border-color)',
  },
  '.ql-picker-item': {
    color: 'inherit',
  },
  '.ql-picker-item.ql-selected': {
    color: 'var(--primary-color)',
  },
};

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image', 'code-block'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'color', 'background',
  'link', 'image', 'code-block'
];

const RichTextEditor = () => {
  const activeNote = useStore(state => state.getActiveNote());
  const updateNote = useStore(state => state.updateNote);
  const settings = useStore(state => state.settings);
  const checkGrammar = useStore(state => state.checkGrammar);
  const grammarAlerts = useStore(state => state.grammarAlerts);
  const isLoading = useStore(state => state.isLoading);
  const theme = useStore(state => state.theme);

  // Memoize the editor configuration
  const editorConfig = useMemo(() => ({
    theme: 'snow',
    modules,
    formats,
    style: { 
      height: 'calc(100% - 42px)',
      fontSize: settings.fontSize
    },
    className: 'h-full'
  }), [settings.fontSize]);

  // Debounced content update
  const debouncedUpdate = useCallback(
    debounce((id, content) => {
      updateNote(id, { content });
    }, 500),
    [updateNote]
  );

  // Debounced grammar check
  const debouncedGrammarCheck = useCallback(
    debounce((content) => {
      if (settings.enableGrammar) {
        checkGrammar(content);
      }
    }, 1000),
    [checkGrammar, settings.enableGrammar]
  );

  // Only update note content if it actually changes (prevent unwanted auto-typing)
  const handleChange = useCallback((content, delta, source) => {
    if (!activeNote) return;
    if (source !== 'user') return; // Only update on user input
    debouncedUpdate(activeNote.id, content);
    debouncedGrammarCheck(content);
  }, [activeNote, debouncedUpdate, debouncedGrammarCheck]);

  // Cleanup debounced functions
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
      debouncedGrammarCheck.cancel();
    };
  }, [debouncedUpdate, debouncedGrammarCheck]);

  // Apply custom styles based on theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--bg-color', '#1f2937');
      root.style.setProperty('--text-color', '#f3f4f6');
      root.style.setProperty('--border-color', '#374151');
      root.style.setProperty('--primary-color', '#60a5fa');
    } else {
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#1f2937');
      root.style.setProperty('--border-color', '#e5e7eb');
      root.style.setProperty('--primary-color', '#3b82f6');
    }
  }, [theme]);

  if (!activeNote) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">
          Select a note or create a new one to start editing
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="h-full flex flex-col bg-white/95 dark:bg-gray-900/95 rounded-2xl p-0 shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden"
    >
      <style>
        {Object.entries(editorStyles).map(([selector, styles]) => `
          ${selector} {
            ${Object.entries(styles).map(([property, value]) => `${property}: ${value};`).join('\n')}
          }
        `).join('\n')}
      </style>
      <div className="flex-1 overflow-auto z-10 p-6">
        <ReactQuill
          {...editorConfig}
          value={activeNote.content}
          onChange={handleChange}
          readOnly={activeNote.encrypted}
          preserveWhitespace={true}
          className="font-sans text-lg leading-relaxed min-h-[300px] border-none bg-transparent"
        />
      </div>
      {activeNote.encrypted && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
          This note is encrypted. Enter the password to decrypt it.
        </div>
      )}
      {settings.enableGrammar && grammarAlerts.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          <h4 className="font-semibold mb-2">Grammar Suggestions:</h4>
          <ul className="space-y-1">
            {grammarAlerts.map((alert, index) => (
              <li key={index} className="text-sm">
                <span className="text-red-500 dark:text-red-400">{alert.message}</span>
                {alert.replacements && alert.replacements.length > 0 && (
                  <span className="text-green-500 dark:text-green-400 ml-2">
                    → {alert.replacements[0].value}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {isLoading && (
        <div className="absolute top-4 right-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(RichTextEditor); 