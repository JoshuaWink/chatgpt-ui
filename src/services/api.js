// Dynamic API URL with port detection
let API_URL = 'http://localhost:3000';
const ALTERNATIVE_PORTS = [3001, 3002, 3003];
let portIndex = 0;
let isApiUrlSet = false;

// Function to test API connection and set up correct URL
const setupApiUrl = async () => {
  if (isApiUrlSet) return;
  
  // First try the default port
  try {
    const response = await fetch(`${API_URL}/api/folders`, { 
      method: 'HEAD',
      cache: 'no-cache'
    });
    if (response.ok) {
      console.log(`API connected successfully at ${API_URL}`);
      isApiUrlSet = true;
      return;
    }
  } catch (err) {
    console.warn(`API not available at ${API_URL}, trying alternatives...`);
  }
  
  // Try alternative ports
  while (portIndex < ALTERNATIVE_PORTS.length) {
    const port = ALTERNATIVE_PORTS[portIndex++];
    const testUrl = `http://localhost:${port}`;
    
    try {
      const response = await fetch(`${testUrl}/api/folders`, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      if (response.ok) {
        API_URL = testUrl;
        console.log(`API connected successfully at ${API_URL}`);
        isApiUrlSet = true;
        return;
      }
    } catch (err) {
      console.warn(`API not available at ${testUrl}`);
    }
  }
  
  console.error('Could not connect to API on any port');
};

// Wrapper for API calls to ensure proper URL is set
const apiCall = async (url, options = {}) => {
  await setupApiUrl();
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API call failed with status ${response.status}`);
  }
  
  return response.json();
};

// Folders API
export const fetchFolders = async () => {
  return apiCall(`${API_URL}/api/folders`);
};

export const createFolder = async (name, parentId = null) => {
  return apiCall(`${API_URL}/api/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, parent_id: parentId })
  });
};

export const updateFolder = async (id, name, parentId = null) => {
  return apiCall(`${API_URL}/api/folders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, parent_id: parentId })
  });
};

export const deleteFolder = async (id) => {
  return apiCall(`${API_URL}/api/folders/${id}`, {
    method: 'DELETE'
  });
};

// Chats API
export const fetchChats = async () => {
  return apiCall(`${API_URL}/api/chats`);
};

export const fetchChatsByFolder = async (folderId) => {
  return apiCall(`${API_URL}/api/folders/${folderId}/chats`);
};

export const createChat = async (title, folderId = 1) => {
  return apiCall(`${API_URL}/api/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, folder_id: folderId })
  });
};

export const updateChat = async (id, data) => {
  return apiCall(`${API_URL}/api/chats/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

export const deleteChat = async (id) => {
  return apiCall(`${API_URL}/api/chats/${id}`, {
    method: 'DELETE'
  });
};

// Messages API
export const fetchMessages = async (chatId) => {
  return apiCall(`${API_URL}/api/chats/${chatId}/messages`);
};

export const addMessage = async (chatId, content, isUser) => {
  return apiCall(`${API_URL}/api/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, is_user: isUser })
  });
};

export const clearMessages = async (chatId) => {
  return apiCall(`${API_URL}/api/chats/${chatId}/messages`, {
    method: 'DELETE'
  });
}; 