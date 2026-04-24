import DOMPurify from 'dompurify';

/**
 * Sanitizes input string to prevent XSS.
 * @param {string} input - The raw input string.
 * @returns {string} The sanitized string.
 */
export const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};
