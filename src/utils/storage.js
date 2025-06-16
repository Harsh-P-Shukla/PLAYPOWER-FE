const STORAGE_KEY = 'notes_app_data';

/**
 * Save notes to localStorage with error handling
 * @param {Array} notes Array of note objects
 * @returns {boolean} Success status
 */
export const saveNotes = (notes) => {
  try {
    const data = JSON.stringify(notes);
    localStorage.setItem(STORAGE_KEY, data);
    return true;
  } catch (error) {
    console.error('Failed to save notes:', error);
    // Try to save with reduced data if storage is full
    try {
      const reducedNotes = notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        pinned: note.pinned,
        encrypted: note.encrypted,
        lastEdited: note.lastEdited,
        tags: note.tags
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedNotes));
      return true;
    } catch (retryError) {
      console.error('Failed to save reduced notes:', retryError);
      return false;
    }
  }
};

/**
 * Load notes from localStorage with error handling
 * @returns {Array} Array of note objects
 */
export const loadNotes = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const notes = JSON.parse(data);
    // Validate and clean loaded data
    return notes.map(note => ({
      id: note.id || Date.now().toString(),
      title: note.title || 'Untitled Note',
      content: note.content || '',
      pinned: Boolean(note.pinned),
      encrypted: Boolean(note.encrypted),
      lastEdited: note.lastEdited || new Date().toISOString(),
      tags: Array.isArray(note.tags) ? note.tags : []
    }));
  } catch (error) {
    console.error('Failed to load notes:', error);
    return [];
  }
};

/**
 * Clear all notes from storage
 * @returns {boolean} Success status
 */
export const clearNotes = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear notes:', error);
    return false;
  }
};

/**
 * Export notes as a file
 * @param {Array} notes Array of note objects
 * @param {string} format Export format ('json' or 'txt')
 * @returns {boolean} Success status
 */
export const exportNotes = (notes, format = 'json') => {
  try {
    let content, type, extension;
    
    if (format === 'json') {
      content = JSON.stringify(notes, null, 2);
      type = 'application/json';
      extension = 'json';
    } else {
      content = notes.map(note => 
        `Title: ${note.title}\nContent: ${note.content}\nTags: ${note.tags.join(', ')}\nLast Edited: ${note.lastEdited}\n\n`
      ).join('---\n');
      type = 'text/plain';
      extension = 'txt';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-export.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to export notes:', error);
    return false;
  }
};
