import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadCustomTerms,
  saveCustomTerms,
  addGlossaryTerm,
  removeGlossaryTerm,
  getAllGlossaryTerms,
  highlightGlossary,
  searchGlossaryTerms,
  exportGlossary
} from '../glossary';

describe('Glossary Utility', () => {
  const mockTerm = 'test-term';
  const mockDefinition = 'This is a test definition';
  const mockCustomTerms = {
    [mockTerm]: mockDefinition
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadCustomTerms', () => {
    it('should load custom terms from localStorage', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify(mockCustomTerms));
      const terms = loadCustomTerms();
      expect(terms).toEqual(mockCustomTerms);
      expect(localStorage.getItem).toHaveBeenCalledWith('glossaryTerms');
    });

    it('should return empty object if no terms exist', () => {
      localStorage.getItem.mockReturnValue(null);
      const terms = loadCustomTerms();
      expect(terms).toEqual({});
    });

    it('should handle invalid JSON', () => {
      localStorage.getItem.mockReturnValue('invalid-json');
      const terms = loadCustomTerms();
      expect(terms).toEqual({});
    });
  });

  describe('saveCustomTerms', () => {
    it('should save custom terms to localStorage', () => {
      saveCustomTerms(mockCustomTerms);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'glossaryTerms',
        JSON.stringify(mockCustomTerms)
      );
    });

    it('should handle empty terms object', () => {
      saveCustomTerms({});
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'glossaryTerms',
        '{}'
      );
    });
  });

  describe('addGlossaryTerm', () => {
    it('should add a new term successfully', () => {
      localStorage.getItem.mockReturnValue('{}');
      addGlossaryTerm(mockTerm, mockDefinition);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'glossaryTerms',
        JSON.stringify(mockCustomTerms)
      );
    });

    it('should throw error for empty term', () => {
      expect(() => addGlossaryTerm('', mockDefinition)).toThrow('Term and definition are required');
    });

    it('should throw error for empty definition', () => {
      expect(() => addGlossaryTerm(mockTerm, '')).toThrow('Term and definition are required');
    });
  });

  describe('removeGlossaryTerm', () => {
    it('should remove a term successfully', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify(mockCustomTerms));
      removeGlossaryTerm(mockTerm);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'glossaryTerms',
        '{}'
      );
    });

    it('should throw error if term does not exist', () => {
      localStorage.getItem.mockReturnValue('{}');
      expect(() => removeGlossaryTerm('non-existent')).toThrow('Term not found');
    });
  });

  describe('getAllGlossaryTerms', () => {
    it('should return combined default and custom terms', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify(mockCustomTerms));
      const terms = getAllGlossaryTerms();
      expect(terms).toHaveProperty(mockTerm, mockDefinition);
      // Check for some default terms
      expect(Object.keys(terms).length).toBeGreaterThan(1);
    });
  });

  describe('highlightGlossary', () => {
    it('should highlight terms in text', () => {
      const text = `This is a ${mockTerm} in the text`;
      const result = highlightGlossary(text);
      expect(result).toContain(`<span class="glossary-term" title="${mockDefinition}">${mockTerm}</span>`);
    });

    it('should handle text without glossary terms', () => {
      const text = 'This is a text without any glossary terms';
      const result = highlightGlossary(text);
      expect(result).toBe(text);
    });

    it('should handle overlapping terms', () => {
      const terms = {
        'test': 'definition1',
        'test term': 'definition2'
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(terms));
      const text = 'This is a test term';
      const result = highlightGlossary(text);
      expect(result).toContain('test term'); // Longer term should be matched first
    });
  });

  describe('searchGlossaryTerms', () => {
    it('should find matching terms', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify(mockCustomTerms));
      const results = searchGlossaryTerms('test');
      expect(results).toHaveProperty(mockTerm, mockDefinition);
    });

    it('should return empty object for no matches', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify(mockCustomTerms));
      const results = searchGlossaryTerms('non-existent');
      expect(results).toEqual({});
    });

    it('should handle case-insensitive search', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify(mockCustomTerms));
      const results = searchGlossaryTerms('TEST');
      expect(results).toHaveProperty(mockTerm, mockDefinition);
    });
  });

  describe('exportGlossary', () => {
    it('should export terms in JSON format', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify(mockCustomTerms));
      const jsonExport = exportGlossary('json');
      expect(jsonExport).toBe(JSON.stringify(mockCustomTerms, null, 2));
    });

    it('should export terms in text format', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify(mockCustomTerms));
      const textExport = exportGlossary('text');
      expect(textExport).toContain(mockTerm);
      expect(textExport).toContain(mockDefinition);
    });

    it('should throw error for invalid format', () => {
      expect(() => exportGlossary('invalid')).toThrow('Invalid export format');
    });
  });
}); 