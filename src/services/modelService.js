// Local Model API Service
// A service to communicate with a local model server that uses OpenAI-compatible API

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

// Default headers for all requests
const defaultHeaders = {
  'Content-Type': 'application/json'
};

/**
 * Send a chat completion request to the local model
 * @param {array} messages - Array of message objects {role, content}
 * @param {object} options - Optional parameters
 * @returns {Promise<object>} - The model's response
 */
export const generateChatCompletion = async (messages, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        model: options.model || 'local-model',
        messages: messages,
        max_tokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 1,
        n: options.n || 1,
        stream: options.stream || false,
        ...options
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Server returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw error;
  }
};

/**
 * Estimate the number of tokens in a string for a specific model
 * @param {string} text - The text to analyze
 * @param {string} model - The model to use for token estimation
 * @returns {Promise<number>} - The estimated number of tokens
 */
export const estimateTokens = async (text, model = 'local-model') => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/tokens`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        model: model,
        input: text
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Server returned ${response.status}`);
    }

    const result = await response.json();
    return result.token_count || result.tokens || 0;
  } catch (error) {
    console.error('Error estimating tokens:', error);
    throw error;
  }
};

/**
 * Send a direct curl command to the model server
 * @param {string} endpoint - API endpoint (e.g., '/v1/chat/completions')
 * @param {object} data - Request data
 * @returns {Promise<string>} - The curl command as a string
 */
export const generateCurlCommand = (endpoint, data = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const jsonData = JSON.stringify(data);
  
  return `curl -X POST ${url} \\
  -H "Content-Type: application/json" \\
  -d '${jsonData}'`;
};

/**
 * Test connection to the model server
 * @returns {Promise<boolean>} - Whether the connection was successful
 */
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/models`, {
      method: 'GET',
      headers: defaultHeaders
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error testing connection to model server:', error);
    return false;
  }
};

export default {
  generateChatCompletion,
  generateCurlCommand,
  testConnection,
  estimateTokens
}; 