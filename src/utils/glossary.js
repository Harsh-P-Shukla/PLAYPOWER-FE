// Default glossary terms
const DEFAULT_TERMS = {
  'API': 'Application Programming Interface - A set of rules that allows programs to talk to each other',
  'React': 'A JavaScript library for building user interfaces',
  'Vite': 'A modern frontend build tool that provides a faster and leaner development experience',
  'JavaScript': 'A programming language that enables interactive web pages',
  'HTML': 'HyperText Markup Language - The standard language for creating web pages',
  'CSS': 'Cascading Style Sheets - A style sheet language used for describing the presentation of a document',
  'npm': 'Node Package Manager - A package manager for JavaScript',
  'Git': 'A distributed version control system for tracking changes in source code',
  'TypeScript': 'A typed superset of JavaScript that compiles to plain JavaScript',
  'DOM': 'Document Object Model - A programming interface for web documents'
};

let customTerms = {};

/**
 * Load custom glossary terms from localStorage
 */
const loadCustomTerms = () => {
  try {
    const savedTerms = localStorage.getItem('glossary_terms');
    if (savedTerms) {
      customTerms = JSON.parse(savedTerms);
    }
  } catch (error) {
    console.error('Failed to load custom glossary terms:', error);
  }
};

/**
 * Save custom glossary terms to localStorage
 */
const saveCustomTerms = () => {
  try {
    localStorage.setItem('glossary_terms', JSON.stringify(customTerms));
  } catch (error) {
    console.error('Failed to save custom glossary terms:', error);
  }
};

// Load custom terms on initialization
loadCustomTerms();

/**
 * Add a new term to the glossary
 * @param {string} term The term to add
 * @param {string} definition The definition of the term
 * @returns {boolean} Success status
 */
export const addGlossaryTerm = (term, definition) => {
  try {
    if (!term || !definition) {
      throw new Error('Term and definition are required');
    }

    customTerms[term] = definition;
    saveCustomTerms();
    return true;
  } catch (error) {
    console.error('Failed to add glossary term:', error);
    return false;
  }
};

/**
 * Remove a term from the glossary
 * @param {string} term The term to remove
 * @returns {boolean} Success status
 */
export const removeGlossaryTerm = (term) => {
  try {
    if (!term) {
      throw new Error('Term is required');
    }

    delete customTerms[term];
    saveCustomTerms();
    return true;
  } catch (error) {
    console.error('Failed to remove glossary term:', error);
    return false;
  }
};

/**
 * Get all glossary terms
 * @returns {Object} Object containing all terms and definitions
 */
export const getAllGlossaryTerms = () => {
  return {
    ...DEFAULT_TERMS,
    ...customTerms
  };
};

/**
 * Highlight glossary terms in text
 * @param {string} text Text to highlight
 * @returns {string} Text with highlighted terms
 */
export const highlightGlossary = (text) => {
  try {
    if (!text) return '';

    // Combine default and custom terms
    const allTerms = getAllGlossaryTerms();
    
    // Sort terms by length (longest first) to handle overlapping terms
    const sortedTerms = Object.keys(allTerms).sort((a, b) => b.length - a.length);
    
    // Create a map of terms to their definitions
    const termMap = new Map(sortedTerms.map(term => [term, allTerms[term]]));
    
    // Replace terms with highlighted spans
    let highlightedText = text;
    termMap.forEach((definition, term) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, match => 
        `<span class="glossary-term" title="${definition}">${match}</span>`
      );
    });

    return highlightedText;
  } catch (error) {
    console.error('Failed to highlight glossary terms:', error);
    return text;
  }
};

/**
 * Search glossary terms
 * @param {string} query Search query
 * @returns {Array} Array of matching terms and definitions
 */
export const searchGlossaryTerms = (query) => {
  try {
    if (!query) return [];

    const allTerms = getAllGlossaryTerms();
    const searchResults = [];

    Object.entries(allTerms).forEach(([term, definition]) => {
      if (term.toLowerCase().includes(query.toLowerCase()) ||
          definition.toLowerCase().includes(query.toLowerCase())) {
        searchResults.push({ term, definition });
      }
    });

    return searchResults;
  } catch (error) {
    console.error('Failed to search glossary terms:', error);
    return [];
  }
};

/**
 * Export glossary terms
 * @param {string} format Export format ('json' or 'txt')
 * @returns {boolean} Success status
 */
export const exportGlossary = (format = 'json') => {
  try {
    const allTerms = getAllGlossaryTerms();
    let content, type, extension;

    if (format === 'json') {
      content = JSON.stringify(allTerms, null, 2);
      type = 'application/json';
      extension = 'json';
    } else {
      content = Object.entries(allTerms)
        .map(([term, definition]) => `${term}: ${definition}`)
        .join('\n\n');
      type = 'text/plain';
      extension = 'txt';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glossary.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to export glossary:', error);
    return false;
  }
};
