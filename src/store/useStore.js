import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { encrypt, decrypt } from '../utils/encryption';
import { generateId, formatDate, sanitizeHTML } from '../utils/helpers';

// Create a custom storage that uses IndexedDB for better performance
const storage = createJSONStorage(() => ({
  getItem: async (name) => {
    const db = await openDB();
    const tx = db.transaction('store', 'readonly');
    const store = tx.objectStore('store');
    const result = await store.get(name);
    return result?.value;
  },
  setItem: async (name, value) => {
    const db = await openDB();
    const tx = db.transaction('store', 'readwrite');
    const store = tx.objectStore('store');
    await store.put({ key: name, value });
  },
  removeItem: async (name) => {
    const db = await openDB();
    const tx = db.transaction('store', 'readwrite');
    const store = tx.objectStore('store');
    await store.delete(name);
  },
}));

// Initialize IndexedDB
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('notes-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('store')) {
        db.createObjectStore('store');
      }
    };
  });
};

const useStore = create(
  persist(
    (set, get) => ({
      // State
      notes: [],
      activeNoteId: null,
      theme: localStorage.getItem('theme') || 'light',
      searchQuery: '',
      settings: {
        fontSize: localStorage.getItem('fontSize') || '16px',
        enableGlossary: localStorage.getItem('enableGlossary') !== 'false',
        enableGrammar: localStorage.getItem('enableGrammar') !== 'false',
        enableAI: localStorage.getItem('enableAI') !== 'false',
      },
      grammarAlerts: [],
      aiInsights: [],
      isLoading: false,
      error: null,

      // Actions
      setNotes: (notes) => set({ notes }),
      setActiveNoteId: (id) => set({ activeNoteId: id }),
      setTheme: (theme) => {
        document.body.className = theme;
        set({ theme });
      },
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSettings: (settings) => set((state) => ({ 
        settings: { ...state.settings, ...settings } 
      })),
      setGrammarAlerts: (alerts) => set({ grammarAlerts: alerts }),
      setAIInsights: (insights) => set({ aiInsights: insights }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Note Actions
      createNote: () => {
        const newNote = {
          id: generateId(),
          title: 'Untitled Note',
          content: '',
          pinned: false,
          encrypted: false,
          tags: [],
          lastEdited: new Date().toISOString()
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
          activeNoteId: newNote.id
        }));
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map(note =>
            note.id === id
              ? { 
                  ...note, 
                  ...updates,
                  content: updates.content !== undefined ? updates.content : note.content,
                  lastEdited: new Date().toISOString()
                }
              : note
          )
        }));
      },

      deleteNote: (id) => {
        set((state) => {
          const newNotes = state.notes.filter(note => note.id !== id);
          return {
            notes: newNotes,
            activeNoteId: state.activeNoteId === id
              ? (newNotes.length ? newNotes[0].id : null)
              : state.activeNoteId
          };
        });
      },

      togglePinNote: (id) => {
        set((state) => ({
          notes: state.notes.map(note =>
            note.id === id ? { ...note, pinned: !note.pinned } : note
          )
        }));
      },

      encryptNote: (id, password) => {
        if (!password) return;
        set((state) => {
          const note = state.notes.find(n => n.id === id);
          if (!note || note.encrypted) return state;

          const encryptedContent = encrypt(note.content, password);
          return {
            notes: state.notes.map(n =>
              n.id === id
                ? { ...n, content: encryptedContent, encrypted: true }
                : n
            )
          };
        });
      },

      decryptNote: (id, password) => {
        if (!password) return;
        set((state) => {
          const note = state.notes.find(n => n.id === id);
          if (!note || !note.encrypted) return state;

          const decrypted = decrypt(note.content, password);
          if (!decrypted) return state;

          return {
            notes: state.notes.map(n =>
              n.id === id
                ? { ...n, content: decrypted, encrypted: false }
                : n
            )
          };
        });
      },

      // Grammar Check
      checkGrammar: async (content) => {
        if (!content) return;
        
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('https://api.languagetool.org/v2/check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              text: content,
              language: 'en-US',
            }),
          });

          if (!response.ok) throw new Error('Grammar check failed');

          const data = await response.json();
          set({ grammarAlerts: data.matches });
        } catch (error) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      // Getters
      getActiveNote: () => {
        const state = get();
        return state.notes.find(note => note.id === state.activeNoteId);
      },

      getFilteredNotes: () => {
        const state = get();
        if (!state.searchQuery) return state.notes;
        
        const query = state.searchQuery.toLowerCase();
        return state.notes.filter(note =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
        );
      }
    }),
    {
      name: 'notes-storage',
      storage,
      partialize: (state) => ({ 
        notes: state.notes,
        theme: state.theme,
        settings: state.settings
      })
    }
  )
);

export default useStore; 