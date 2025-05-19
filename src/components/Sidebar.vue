<template>
  <div class="sidebar">
    <div class="p-3 border-bottom">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">New Chat</h5>
        <button class="btn-close d-md-none" @click="closeSidebar"></button>
      </div>
      <button class="btn btn-primary w-100" @click="createNewChat">
        <i class="bi bi-plus-lg me-2"></i>New Chat
      </button>
    </div>

    <div class="p-2 border-bottom">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="px-2 mb-0 text-muted small text-uppercase">Folders</h6>
        <button class="btn btn-sm btn-link p-0 text-decoration-none" @click="showFolderDialog = true">
          <i class="bi bi-folder-plus"></i>
        </button>
      </div>
      <div class="folder-list">
        <div 
          v-for="folder in folders" 
          :key="folder.id"
          class="folder-item p-2 rounded"
          :class="{ 
            'active': selectedFolderId === folder.id,
            'folder-drop-target': isDraggingOver && currentDropTarget === folder.id 
          }"
          @click="selectFolder(folder.id)"
          @contextmenu.prevent="showFolderContextMenu($event, folder)"
          @dragover.prevent="handleDragOver($event, folder.id)"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop($event, folder.id)">
          <div class="d-flex align-items-center">
            <i class="bi bi-folder me-2"></i>
            <div class="folder-name text-truncate">{{ folder.name }}</div>
            <span class="ms-auto badge bg-secondary rounded-pill" v-if="getFolderChatCount(folder.id) > 0">
              {{ getFolderChatCount(folder.id) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-2">
      <h6 class="px-2 text-muted small text-uppercase">
        {{ selectedFolderId ? getFolderById(selectedFolderId).name : 'All Chats' }}
      </h6>
      <div class="chat-list">
        <div 
          v-for="(chat, index) in filteredChats" 
          :key="chat.id"
          class="chat-item p-2 rounded"
          :class="{ 'active': selectedChatId === chat.id }"
          draggable="true"
          @click="selectChat(chat.id)"
          @contextmenu.prevent="showChatContextMenu($event, chat)"
          @dragstart="handleDragStart($event, chat)">
          <div class="d-flex align-items-center">
            <i class="bi bi-chat-left-text me-2"></i>
            <div class="chat-title text-truncate">{{ chat.title }}</div>
            <div class="ms-auto d-flex align-items-center">
              <small class="text-muted folder-indicator" v-if="!selectedFolderId">
                <i class="bi bi-folder-fill me-1 small"></i>
                {{ getFolderById(chat.folder_id).name }}
              </small>
            </div>
          </div>
          <small class="text-muted">{{ formatDate(chat.updated_at) }}</small>
        </div>
      </div>
    </div>
    
    <!-- Context Menus -->
    <context-menu
      v-model:show="showContextMenu"
      :top="contextMenuTop"
      :left="contextMenuLeft"
      :title="contextMenuTitle"
      :menu-items="contextMenuItems"
    />
    
    <!-- Folder Dialog -->
    <folder-dialog
      v-model:show="showFolderDialog"
      :folder="selectedFolder"
      @save="saveFolder"
    />
    
    <!-- Toast notification for chat movement -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div class="toast" :class="{ 'show': showToast }" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <i class="bi bi-check-circle-fill text-success me-2"></i>
          <strong class="me-auto">Chat Moved</strong>
          <button type="button" class="btn-close" @click="showToast = false"></button>
        </div>
        <div class="toast-body">
          Chat moved to "{{ lastMovedToFolderName }}"
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ContextMenu from './ContextMenu.vue';
import FolderDialog from './FolderDialog.vue';
import { folders, chats, createFolder, updateChat, moveChatToFolder, deleteFolder } from '../services/database';

export default {
  name: 'Sidebar',
  components: {
    ContextMenu,
    FolderDialog
  },
  props: {
    selectedChatId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      selectedFolderId: null,
      // Context menu
      showContextMenu: false,
      contextMenuTop: 0,
      contextMenuLeft: 0,
      contextMenuTitle: '',
      contextMenuItems: [],
      // Folder dialog
      showFolderDialog: false,
      selectedFolder: null,
      // Drag and drop
      isDragging: false,
      isDraggingOver: false,
      currentDropTarget: null,
      draggedChat: null,
      // Toast notification
      showToast: false,
      lastMovedToFolderName: ''
    };
  },
  computed: {
    filteredChats() {
      if (!this.selectedFolderId) {
        return chats.value;
      }
      return chats.value.filter(chat => chat.folder_id === this.selectedFolderId);
    }
  },
  methods: {
    createNewChat() {
      this.$emit('new-chat', this.selectedFolderId || 1);
    },
    selectChat(chatId) {
      this.$emit('select-chat', chatId);
    },
    selectFolder(folderId) {
      this.selectedFolderId = this.selectedFolderId === folderId ? null : folderId;
    },
    formatDate(dateStr) {
      const now = new Date();
      const chatDate = new Date(dateStr);
      
      if (now.toDateString() === chatDate.toDateString()) {
        return chatDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return chatDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    },
    closeSidebar() {
      this.$emit('close');
    },
    getFolderById(folderId) {
      return folders.value.find(f => f.id === folderId) || { name: 'Unknown' };
    },
    getFolderChatCount(folderId) {
      return chats.value.filter(chat => chat.folder_id === folderId).length;
    },
    // Context Menu for Chats
    showChatContextMenu(event, chat) {
      if (!chat) return;
      
      this.contextMenuTop = event.clientY;
      this.contextMenuLeft = event.clientX;
      this.contextMenuTitle = chat.title;
      
      try {
        // Build menu items with move to folder submenu
        const folderSubMenu = folders.value
          .filter(folder => folder.id !== chat.folder_id)
          .map(folder => ({
            label: folder.name,
            icon: 'bi-folder',
            action: () => {
              this.moveChatToFolderWithNotification(chat.id, folder.id);
            }
          }));
        
        this.contextMenuItems = [
          {
            label: 'Delete Chat',
            icon: 'bi-trash',
            action: () => {
              if (confirm('Are you sure you want to delete this chat?')) {
                this.$emit('delete-chat', chat.id);
              }
            }
          },
          { divider: true },
          {
            label: 'Move to Folder',
            icon: 'bi-folder-symlink',
            submenu: folderSubMenu
          }
        ];
        
        this.showContextMenu = true;
      } catch (err) {
        console.error('Error showing context menu:', err);
      }
    },
    // Context Menu for Folders
    showFolderContextMenu(event, folder) {
      // Don't allow operations on the Uncategorized folder
      if (!folder || folder.id === 1) return;
      
      this.contextMenuTop = event.clientY;
      this.contextMenuLeft = event.clientX;
      this.contextMenuTitle = folder.name;
      
      try {
        this.contextMenuItems = [
          {
            label: 'Edit Folder',
            icon: 'bi-pencil',
            action: () => {
              this.selectedFolder = folder;
              this.showFolderDialog = true;
            }
          },
          {
            label: 'Delete Folder',
            icon: 'bi-trash',
            action: () => {
              if (confirm(`Are you sure you want to delete "${folder.name}"? Chats will be moved to Uncategorized.`)) {
                deleteFolder(folder.id);
                if (this.selectedFolderId === folder.id) {
                  this.selectedFolderId = null;
                }
              }
            }
          }
        ];
        
        this.showContextMenu = true;
      } catch (err) {
        console.error('Error showing folder context menu:', err);
      }
    },
    // Folder Dialog
    saveFolder(folder) {
      if (folder.id) {
        // Edit existing folder
        const existingFolder = folders.value.find(f => f.id === folder.id);
        if (existingFolder) {
          existingFolder.name = folder.name;
          // Update folder in database
          this.$emit('update-folder', existingFolder);
        }
      } else {
        // Create new folder
        createFolder(folder.name);
      }
    },
    // Drag and Drop functionality
    handleDragStart(event, chat) {
      this.isDragging = true;
      this.draggedChat = chat;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', chat.id);
      
      // Add a dragging class to the element
      event.target.classList.add('dragging');
    },
    handleDragOver(event, folderId) {
      // Only allow dropping if this is a different folder than the chat's current folder
      if (this.draggedChat && this.draggedChat.folder_id !== folderId) {
        event.dataTransfer.dropEffect = 'move';
        this.isDraggingOver = true;
        this.currentDropTarget = folderId;
      }
    },
    handleDragLeave() {
      this.isDraggingOver = false;
      this.currentDropTarget = null;
    },
    handleDrop(event, folderId) {
      const chatId = parseInt(event.dataTransfer.getData('text/plain'));
      
      // Reset drag state
      this.isDragging = false;
      this.isDraggingOver = false;
      this.currentDropTarget = null;
      
      // Move the chat to the new folder
      if (chatId && this.draggedChat && this.draggedChat.folder_id !== folderId) {
        this.moveChatToFolderWithNotification(chatId, folderId);
      }
      
      this.draggedChat = null;
    },
    // Move chat with notification
    moveChatToFolderWithNotification(chatId, folderId) {
      const targetFolder = this.getFolderById(folderId);
      if (targetFolder) {
        moveChatToFolder(chatId, folderId);
        this.lastMovedToFolderName = targetFolder.name;
        this.showToast = true;
        
        // Auto-hide toast after 3 seconds
        setTimeout(() => {
          this.showToast = false;
        }, 3000);
      }
    }
  }
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 260px;
  min-width: 260px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  overflow: hidden;
}

.p-3 {
  flex-shrink: 0;
}

.p-2 {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.p-2:last-child {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.folder-list,
.chat-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  padding-right: 5px;
}

.folder-list {
  max-height: 30vh;
}

.chat-list {
  flex: 1;
  min-height: 0;
}

.folder-item,
.chat-item {
  user-select: none;
  cursor: pointer;
  transition: all 0.2s;
}

.folder-item:hover,
.chat-item:hover {
  background-color: rgba(13, 110, 253, 0.1);
}

.folder-item.active,
.chat-item.active {
  background-color: rgba(13, 110, 253, 0.2);
}

.chat-item {
  display: flex;
  flex-direction: column;
}

.chat-title {
  font-weight: 500;
}

.btn-sm {
  font-size: 0.75rem;
}

.folder-drop-target {
  background-color: rgba(25, 135, 84, 0.15);
  border: 2px dashed #198754;
}

.chat-item.dragging {
  opacity: 0.6;
}

.folder-indicator {
  font-size: 0.7rem;
  padding: 0.1rem 0.3rem;
  background-color: rgba(108, 117, 125, 0.1);
  border-radius: 0.25rem;
}

/* Toast styling */
.toast-container {
  z-index: 1100;
}

.toast {
  background-color: white;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.3s;
}

.toast.show {
  opacity: 1;
}
</style> 