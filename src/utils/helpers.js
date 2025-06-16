/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param {Function} func The function to debounce
 * @param {number} wait The number of milliseconds to delay
 * @returns {Function} The debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generates a unique ID
 * @returns {string} A unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Formats a date to a readable string
 * @param {Date} date The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Truncates text to a specified length
 * @param {string} text The text to truncate
 * @param {number} length Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.substr(0, length) + '...';
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} html The HTML to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = (html) => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}; 