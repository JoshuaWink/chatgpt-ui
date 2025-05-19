/**
 * Utility functions for error handling and testing
 */

import { addError } from '../components/ErrorToast.vue';

/**
 * Simulate an error for testing the error toast system
 * @param {string} message - Error message to display
 * @param {string} title - Optional title for the error
 * @param {string} details - Optional additional details
 */
export const simulateError = (message = 'This is a test error', title = 'Test Error', details = null) => {
  console.warn('Simulating error:', message);
  
  const error = new Error(message);
  error.title = title;
  
  addError({
    title,
    message,
    details: details || 'This error was manually triggered for testing purposes'
  });
  
  return error;
};

/**
 * Parse and format error for display
 * @param {Error|string} error - The error to format
 * @returns {Object} - Formatted error object
 */
export const formatError = (error) => {
  if (typeof error === 'string') {
    return {
      title: 'Error',
      message: error,
      details: null
    };
  }
  
  return {
    title: error.title || 'Error',
    message: error.message || 'An unknown error occurred',
    details: error.stack || error.details || null
  };
};

/**
 * Safely filter an array, handling undefined/null cases
 * @param {Array|null|undefined} array - The array to filter, or null/undefined
 * @param {Function} predicate - Filter predicate function
 * @returns {Array} - Filtered array or empty array if input was not an array
 */
export const safeFilter = (array, predicate) => {
  if (!array || !Array.isArray(array)) {
    return [];
  }
  return array.filter(predicate);
}; 