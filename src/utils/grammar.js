const LANGUAGE_TOOL_API = 'https://api.languagetool.org/v2/check';
const RATE_LIMIT = {
  maxRequests: 5,
  timeWindow: 60000, // 1 minute
};

let requestQueue = [];
let lastRequestTime = 0;

/**
 * Check grammar using LanguageTool API with rate limiting
 * @param {string} text Text to check
 * @returns {Promise<Array>} Array of grammar suggestions
 * @throws {Error} If API request fails
 */
export const getGrammarSuggestions = async (text) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Rate limiting
  const now = Date.now();
  if (requestQueue.length >= RATE_LIMIT.maxRequests) {
    const oldestRequest = requestQueue[0];
    if (now - oldestRequest < RATE_LIMIT.timeWindow) {
      throw new Error('Rate limit exceeded. Please try again in a minute.');
    }
    requestQueue.shift();
  }

  // Add current request to queue
  requestQueue.push(now);
  lastRequestTime = now;

  try {
    const response = await fetch(LANGUAGE_TOOL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text,
        language: 'en-US',
        enabledOnly: 'false',
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.matches) {
      return [];
    }

    return data.matches.map(match => ({
      message: match.message,
      replacement: match.replacements[0]?.value || '',
      offset: match.offset,
      length: match.length,
      context: match.context,
      type: match.rule.category.id
    }));
  } catch (error) {
    console.error('Grammar check failed:', error);
    throw new Error('Failed to check grammar. Please try again later.');
  }
};

/**
 * Apply grammar suggestion to text
 * @param {string} text Original text
 * @param {Object} suggestion Grammar suggestion
 * @returns {string} Text with suggestion applied
 */
export const applyGrammarSuggestion = (text, suggestion) => {
  if (!text || !suggestion) return text;
  
  const before = text.slice(0, suggestion.offset);
  const after = text.slice(suggestion.offset + suggestion.length);
  return before + suggestion.replacement + after;
};

/**
 * Get grammar statistics
 * @param {Array} suggestions Array of grammar suggestions
 * @returns {Object} Statistics about the suggestions
 */
export const getGrammarStats = (suggestions) => {
  if (!suggestions || !suggestions.length) {
    return {
      total: 0,
      byType: {},
      severity: {
        high: 0,
        medium: 0,
        low: 0
      }
    };
  }

  const stats = {
    total: suggestions.length,
    byType: {},
    severity: {
      high: 0,
      medium: 0,
      low: 0
    }
  };

  suggestions.forEach(suggestion => {
    // Count by type
    stats.byType[suggestion.type] = (stats.byType[suggestion.type] || 0) + 1;

    // Count by severity (example categorization)
    if (suggestion.type === 'TYPOS' || suggestion.type === 'GRAMMAR') {
      stats.severity.high++;
    } else if (suggestion.type === 'STYLE') {
      stats.severity.medium++;
    } else {
      stats.severity.low++;
    }
  });

  return stats;
};
