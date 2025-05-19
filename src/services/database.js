import { ref } from 'vue';
import * as api from './api';

// Reactive references for our app state
const folders = ref([]);
const chats = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Initial data loading function (replacing onMounted)
const initializeData = async () => {
  try {
    isLoading.value = true;
    
    // Load folders first
    const folderData = await api.fetchFolders();
    folders.value = folderData;
    
    // Then load chats
    const chatData = await api.fetchChats();
    chats.value = chatData;
    
    error.value = null;
  } catch (err) {
    console.error('Failed to load initial data:', err);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

// Load all folders
const loadFolders = async () => {
  try {
    const data = await api.fetchFolders();
    folders.value = data;
    return folders.value;
  } catch (err) {
    console.error('Failed to load folders:', err);
    error.value = err.message;
    return [];
  }
};

// Load all chats
const loadChats = async () => {
  try {
    const data = await api.fetchChats();
    chats.value = data;
    return chats.value;
  } catch (err) {
    console.error('Failed to load chats:', err);
    error.value = err.message;
    return [];
  }
};

// Load chats for a specific folder
const loadChatsByFolder = async (folderId) => {
  try {
    return await api.fetchChatsByFolder(folderId);
  } catch (err) {
    console.error(`Failed to load chats for folder ${folderId}:`, err);
    error.value = err.message;
    return [];
  }
};

// Create a new folder
const createFolder = async (name, parentId = null) => {
  try {
    const newFolder = await api.createFolder(name, parentId);
    await loadFolders();
    return newFolder.id;
  } catch (err) {
    console.error('Failed to create folder:', err);
    error.value = err.message;
    return null;
  }
};

// Update a folder
const updateFolder = async (folder) => {
  try {
    await api.updateFolder(folder.id, folder.name, folder.parent_id);
    await loadFolders();
    return true;
  } catch (err) {
    console.error(`Failed to update folder ${folder.id}:`, err);
    error.value = err.message;
    return false;
  }
};

// Delete a folder
const deleteFolder = async (id) => {
  try {
    await api.deleteFolder(id);
    await loadFolders();
    await loadChats(); // Reload chats as they may have moved to Uncategorized
    return true;
  } catch (err) {
    console.error(`Failed to delete folder ${id}:`, err);
    error.value = err.message;
    return false;
  }
};

// Create a new chat
const createChat = async (title, folderId = 1) => {
  try {
    const newChat = await api.createChat(title, folderId);
    await loadChats();
    return newChat.id;
  } catch (err) {
    console.error('Failed to create chat:', err);
    error.value = err.message;
    return null;
  }
};

// Update a chat
const updateChat = async (id, data) => {
  try {
    await api.updateChat(id, data);
    await loadChats();
    return true;
  } catch (err) {
    console.error(`Failed to update chat ${id}:`, err);
    error.value = err.message;
    return false;
  }
};

// Move a chat to a folder
const moveChatToFolder = async (chatId, folderId) => {
  try {
    await api.updateChat(chatId, { folder_id: folderId });
    
    // Update the local state
    const chatIndex = chats.value.findIndex(chat => chat.id === chatId);
    if (chatIndex >= 0) {
      chats.value[chatIndex].folder_id = folderId;
    }
    
    console.log(`Chat ${chatId} moved to folder ${folderId} successfully`);
    return true;
  } catch (err) {
    console.error(`Failed to move chat ${chatId} to folder ${folderId}:`, err);
    error.value = err.message;
    return Promise.reject(err);
  }
};

// Delete a chat
const deleteChat = async (id) => {
  try {
    await api.deleteChat(id);
    await loadChats();
    return true;
  } catch (err) {
    console.error(`Failed to delete chat ${id}:`, err);
    error.value = err.message;
    return false;
  }
};

// Add a message to a chat
const addMessage = async (chatId, content, isUser) => {
  try {
    const newMessage = await api.addMessage(chatId, content, isUser);
    await loadChats(); // Reload chats to update timestamps
    return newMessage.id;
  } catch (err) {
    console.error(`Failed to add message to chat ${chatId}:`, err);
    error.value = err.message;
    return null;
  }
};

// Load messages for a chat
const loadMessages = async (chatId) => {
  try {
    return await api.fetchMessages(chatId);
  } catch (err) {
    console.error(`Failed to load messages for chat ${chatId}:`, err);
    error.value = err.message;
    return [];
  }
};

// Clear all messages in a chat
const clearMessages = async (chatId) => {
  try {
    await api.clearMessages(chatId);
    await loadChats(); // Reload chats to update timestamps
    return true;
  } catch (err) {
    console.error(`Failed to clear messages for chat ${chatId}:`, err);
    error.value = err.message;
    return false;
  }
};

// Duplicate a chat including all its messages
const duplicateChat = async (chatId) => {
  try {
    // Get the original chat info
    const originalChat = chats.value.find(chat => chat.id === chatId);
    if (!originalChat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    
    // Create a new chat with the same title (add "Copy" suffix)
    const newTitle = `${originalChat.title} (Copy)`;
    const newChatId = await createChat(newTitle, originalChat.folder_id);
    
    if (!newChatId) {
      throw new Error('Failed to create new chat during duplication');
    }
    
    // Load messages from the original chat
    const messages = await loadMessages(chatId);
    
    // Copy messages to the new chat
    for (const message of messages) {
      await addMessage(newChatId, message.content, message.is_user);
    }
    
    await loadChats(); // Refresh the chat list
    return newChatId;
  } catch (err) {
    console.error(`Failed to duplicate chat ${chatId}:`, err);
    error.value = err.message;
    return null;
  }
};

// Export a chat to a JSON file
const exportChat = async (chatId) => {
  try {
    // Get the chat details
    const chat = chats.value.find(c => c.id === chatId);
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    
    // Get the messages
    const messages = await loadMessages(chatId);
    
    // Create export data
    const exportData = {
      chat: {
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
      },
      messages: messages
    };
    
    // Convert to a JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob and download it
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and click it to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    return true;
  } catch (err) {
    console.error(`Failed to export chat ${chatId}:`, err);
    error.value = err.message;
    return false;
  }
};

// Move a folder to another folder
const moveFolderToParent = async (folderId, parentId) => {
  try {
    // Don't allow moving to itself
    if (folderId === parentId) {
      throw new Error('Cannot move a folder into itself');
    }
    
    // Don't allow moving the Uncategorized folder
    if (folderId === 1) {
      throw new Error('Cannot move the Uncategorized folder');
    }
    
    // Get the folder to update its parent_id
    const folder = folders.value.find(f => f.id === folderId);
    if (!folder) {
      throw new Error(`Folder with ID ${folderId} not found`);
    }
    
    // Update the folder's parent_id
    await api.updateFolder(folderId, folder.name, parentId);
    
    // Reload folders to update the UI
    await loadFolders();
    return true;
  } catch (err) {
    console.error(`Failed to move folder ${folderId} to parent ${parentId}:`, err);
    throw err;
  }
};

export {
  folders,
  chats,
  isLoading,
  error,
  initializeData,
  loadFolders,
  loadChats,
  loadChatsByFolder,
  createFolder,
  updateFolder,
  deleteFolder,
  createChat,
  updateChat,
  moveChatToFolder,
  deleteChat,
  addMessage,
  loadMessages,
  clearMessages,
  moveFolderToParent,
  duplicateChat,
  exportChat
}; 