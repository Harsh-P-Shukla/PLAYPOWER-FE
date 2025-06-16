import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useStore from '../store/useStore';
import { formatDate } from '../utils/helpers';

const Toolbar = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const activeNote = useStore(state => state.getActiveNote());
  const {
    updateNote,
    encryptNote,
    decryptNote,
    deleteNote,
    togglePinNote,
    settings,
    setSettings
  } = useStore();

  const handleExport = (format) => {
    if (!activeNote) return;
    
    const content = activeNote.content;
    const blob = new Blob([content], { 
      type: format === 'pdf' ? 'application/pdf' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `note-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Note exported as ${format.toUpperCase()}`);
  };

  const handleEncrypt = () => {
    if (!password) {
      toast.error('Please enter a password');
      return;
    }
    encryptNote(activeNote.id, password);
    setShowPasswordModal(false);
    setPassword('');
    toast.success('Note encrypted successfully');
  };

  const handleDecrypt = () => {
    if (!password) {
      toast.error('Please enter a password');
      return;
    }
    decryptNote(activeNote.id, password);
    setShowPasswordModal(false);
    setPassword('');
    toast.success('Note decrypted successfully');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(activeNote.id);
      toast.success('Note deleted successfully');
    }
  };

  if (!activeNote) return null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={activeNote.title}
            onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
            className="text-xl font-semibold bg-transparent border-none focus:ring-0"
            placeholder="Untitled Note"
          />
          
          <button
            onClick={() => togglePinNote(activeNote.id)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              activeNote.pinned ? 'text-yellow-500' : 'text-gray-400'
            }`}
          >
            📌
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={settings.fontSize}
            onChange={(e) => setSettings({ fontSize: e.target.value })}
            className="input py-1"
          >
            <option value="14px">Small</option>
            <option value="16px">Medium</option>
            <option value="18px">Large</option>
          </select>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-secondary"
          >
            {activeNote.encrypted ? '🔓 Decrypt' : '🔒 Encrypt'}
          </button>

          <button
            onClick={() => handleExport('txt')}
            className="btn btn-primary"
          >
            📥 Export
          </button>

          <button
            onClick={handleDelete}
            className="btn bg-red-500 hover:bg-red-600 text-white"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
              <h3 className="text-lg font-semibold mb-4">
                {activeNote.encrypted ? 'Decrypt Note' : 'Encrypt Note'}
              </h3>
              
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input mb-4"
              />
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="btn bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={activeNote.encrypted ? handleDecrypt : handleEncrypt}
                  className="btn btn-primary"
                >
                  {activeNote.encrypted ? 'Decrypt' : 'Encrypt'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Toolbar;
