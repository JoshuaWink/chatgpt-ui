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
          :class="{ 'active': selectedFolderId === folder.id }"
          @click="selectFolder(folder.id)"
          @contextmenu.prevent="showFolderContextMenu($event, folder)">
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
          @click="selectChat(chat.id)"
          @contextmenu.prevent="showChatContextMenu($event, chat)">
          <div class="d-flex align-items-center">
            <i class="bi bi-chat-left-text me-2"></i>
            <div class="chat-title text-truncate">{{ chat.title }}</div>
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
      selectedFolder: null
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
      this.contextMenuTop = event.clientY;
      this.contextMenuLeft = event.clientX;
      this.contextMenuTitle = chat.title;
      
      // Build menu items with move to folder submenu
      const folderSubMenu = folders.value
        .filter(folder => folder.id !== chat.folder_id)
        .map(folder => ({
          label: folder.name,
          icon: 'bi-folder',
          action: () => {
            moveChatToFolder(chat.id, folder.id);
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
    },
    // Context Menu for Folders
    showFolderContextMenu(event, folder) {
      // Don't allow operations on the Uncategorized folder
      if (folder.id === 1) return;
      
      this.contextMenuTop = event.clientY;
      this.contextMenuLeft = event.clientX;
      this.contextMenuTitle = folder.name;
      
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
  overflow-y: auto;
}

.folder-item,
.chat-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.folder-item:hover,
.chat-item:hover {
  background-color: #e9ecef;
}

.folder-item.active,
.chat-item.active {
  background-color: #e9ecef;
  border-left: 3px solid #0d6efd;
}

.folder-name,
.chat-title {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Custom scrollbar for better UX */
.folder-list::-webkit-scrollbar,
.chat-list::-webkit-scrollbar {
  width: 4px;
}

.folder-list::-webkit-scrollbar-track,
.chat-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.folder-list::-webkit-scrollbar-thumb,
.chat-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.folder-list::-webkit-scrollbar-thumb:hover,
.chat-list::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}
</style> 