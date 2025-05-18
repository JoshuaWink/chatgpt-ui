<script setup>
import { ref, reactive, watch, onMounted, onErrorCaptured } from 'vue'
// Import components but don't render them yet
import ChatWindow from './components/ChatWindow.vue'
import Sidebar from './components/Sidebar.vue'
import {
  folders,
  chats,
  isLoading,
  error,
  createChat,
  updateChat,
  deleteChat,
  addMessage,
  loadMessages,
  clearMessages,
  updateFolder,
  initializeData
} from './services/database';

// State
const selectedChatId = ref(null);
const showSidebar = ref(true);
const currentMessages = ref([]);
const loadingMessages = ref(false);
const localError = ref(null);

// Error handling
onErrorCaptured((err) => {
  console.error('Global error captured:', err);
  localError.value = err;
  return false; // Prevent propagation
});

// Initialize with first chat or create one if none exists
onMounted(async () => {
  try {
    // Initialize data before watching for changes
    await initializeData();
    
    console.log('Data initialized successfully');
    console.log('Folders:', folders.value);
    console.log('Chats:', chats.value);
    
    // Watch for chats to be loaded from the API
    watch(chats, (newChats) => {
      if (newChats.length > 0 && !selectedChatId.value) {
        selectedChatId.value = newChats[0].id;
        // Uncomment this to load messages for the selected chat
        loadChatMessages(selectedChatId.value);
        console.log('Selected chat ID:', selectedChatId.value);
      }
    }, { immediate: true });
  } catch (err) {
    console.error('Error during initialization:', err);
    localError.value = err;
  }
});

// Watch for chat changes
watch(selectedChatId, (newId) => {
  if (newId) {
    console.log('Selected chat ID changed to:', newId);
    // Uncomment this to load messages when chat changes
    loadChatMessages(newId);
  }
});

// Get the current chat
function getCurrentChat() {
  if (!selectedChatId.value) return null;
  return chats.value.find(chat => chat.id === selectedChatId.value);
}

// Load messages for the current chat
async function loadChatMessages(chatId) {
  try {
    loadingMessages.value = true;
    const messages = await loadMessages(chatId);
    currentMessages.value = messages.map(msg => ({
      content: msg.content,
      isUser: msg.is_user === 1,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (err) {
    console.error(`Error loading messages for chat ${chatId}:`, err);
  } finally {
    loadingMessages.value = false;
  }
}

// Create a new chat (needed for sidebar)
async function createNewChat(folderId = 1) {
  const newId = await createChat('New Chat', folderId);
  if (newId) {
    selectedChatId.value = newId;
    currentMessages.value = [];
    
    if (window.innerWidth < 768) {
      showSidebar.value = false;
    }
  }
}

// Select an existing chat (needed for sidebar)
function selectChat(chatId) {
  selectedChatId.value = chatId;
  
  if (window.innerWidth < 768) {
    showSidebar.value = false;
  }
}

// Handle folder update (needed for sidebar)
async function handleUpdateFolder(folder) {
  await updateFolder(folder);
}

// Delete a chat (needed for sidebar)
async function handleDeleteChat(chatId) {
  await deleteChat(chatId);
  
  if (selectedChatId.value === chatId) {
    // Select another chat or create a new one
    if (chats.value.length > 0) {
      selectedChatId.value = chats.value[0].id;
      // Uncomment this to load messages when selecting a different chat
      await loadChatMessages(selectedChatId.value);
    } else {
      await createNewChat();
    }
  }
}

// Toggle sidebar
function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
}

// Add a message to the current chat
async function addMessageToChat(message) {
  if (!selectedChatId.value) {
    await createNewChat();
  }
  
  // Add to UI immediately for responsive feel
  currentMessages.value.push(message);
  
  // Save to database
  await addMessage(
    selectedChatId.value,
    message.content,
    message.isUser
  );
}

// Update chat title
async function updateChatTitle(title) {
  if (selectedChatId.value) {
    await updateChat(selectedChatId.value, { title });
  }
}

// Clear chat messages
async function clearChat() {
  if (!selectedChatId.value) return;
  
  await clearMessages(selectedChatId.value);
  currentMessages.value = [];
}
</script>

<template>
  <div class="app-container">
    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="mt-3">Loading application data...</div>
    </div>
      
    <!-- Main app content -->
    <template v-else>
      <!-- Sidebar component -->
      <Sidebar 
        v-show="showSidebar" 
        :selected-chat-id="selectedChatId"
        @new-chat="createNewChat"
        @select-chat="selectChat"
        @delete-chat="handleDeleteChat"
        @update-folder="handleUpdateFolder"
        @close="showSidebar = false"
        class="sidebar-container" />
      
      <!-- Main content with ChatWindow -->
      <main class="main-content">
        <div class="sidebar-toggle d-md-none" @click="toggleSidebar">
          <i class="bi" :class="showSidebar ? 'bi-x-lg' : 'bi-list'"></i>
        </div>
        
        <div v-if="loadingMessages" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading messages...</span>
          </div>
          <div class="mt-3">Loading messages...</div>
        </div>
        
        <div v-else-if="!getCurrentChat()" class="text-center py-5">
          <h3>No chat selected</h3>
          <button class="btn btn-primary mt-3" @click="createNewChat">
            Create New Chat
          </button>
        </div>
        
        <ChatWindow 
          v-else
          :current-chat="{
            ...getCurrentChat(), 
            messages: currentMessages
          }"
          @add-message="addMessageToChat"
          @update-title="updateChatTitle"
          @clear-chat="clearChat"
          @delete-chat="handleDeleteChat"
          @toggle-sidebar="toggleSidebar" />
      </main>
     
    </template>
  </div>
</template>

<style>
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  height: 100vh;
  width: 100vw;
  color: #212529;
  display: flex;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex: 1;
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  margin: 0;
  padding: 0;
}

.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.sidebar-toggle {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 100;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  border: none;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  background-color: #e9ecef;
  transform: scale(1.05);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 2000;
}

.error-container {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

@media (max-width: 767.98px) {
  .sidebar-container {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1030;
    box-shadow: 0 0 15px rgba(0,0,0,0.15);
    width: 85%;
    max-width: 260px;
  }
  
  .main-content {
    padding-top: 60px;
  }
}
</style>
