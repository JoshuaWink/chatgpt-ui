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
        <!-- Root folder tree component for each top-level folder -->
        <folder-tree
          v-for="folder in rootFolders"
          :key="folder.id"
          :folder="folder"
          :children="getChildFolders(folder.id)"
          :all-folders="folders"
          :all-chats="chats"
          :selected-folder-id="selectedFolderId"
          :current-drop-target="currentDropTarget"
          :is-dragging-over="isDraggingOver"
          :get-total-chat-count="getTotalFolderChatCount"
          @select="selectFolder"
          @context-menu="showFolderContextMenu($event.event, $event.folder)"
          @drag-over="handleDragOver($event.event, $event.folderId)"
          @drag-leave="handleDragLeave"
          @drop="handleDrop($event, $event.folderId)"
          @folder-drag-start="handleFolderDragStart"
        />
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
      
      <!-- Folder move toast -->
      <div class="toast folder-toast" :class="{ 'show': folderMoveToast }" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <i class="bi bi-folder-symlink text-primary me-2"></i>
          <strong class="me-auto">Folder Moved</strong>
          <button type="button" class="btn-close" @click="folderMoveToast = false"></button>
        </div>
        <div class="toast-body">
          Folder "{{ folderMovedName }}" moved to "{{ folderDestinationName }}"
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { chats, folders, createFolder, deleteFolder, moveChatToFolder, moveFolderToParent, updateChat, duplicateChat, exportChat } from '../services/database';
import { addError } from '../components/ErrorToast.vue';
import { safeFilter } from '../utils/errorUtils';
import ContextMenu from './ContextMenu.vue';
import FolderDialog from './FolderDialog.vue';
import FolderTree from './FolderTree.vue';

export default {
  name: 'Sidebar',
  components: {
    ContextMenu,
    FolderDialog,
    FolderTree
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
      draggedFolder: null,
      isDraggingFolder: false,
      // Toast notification
      showToast: false,
      lastMovedToFolderName: '',
      folderMoveToast: false,
      folderMovedName: '',
      folderDestinationName: ''
    };
  },
  computed: {
    filteredChats() {
      if (!this.selectedFolderId) {
        return chats.value || [];
      }
      return (chats.value || []).filter(chat => chat.folder_id === this.selectedFolderId);
    },
    rootFolders() {
      return (folders.value || []).filter(folder => !folder.parent_id);
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
      if (!folders.value) return { name: 'Unknown' };
      return folders.value.find(f => f.id === folderId) || { name: 'Unknown' };
    },
    getFolderChatCount(folderId) {
      if (!chats.value) return 0;
      return chats.value.filter(chat => chat.folder_id === folderId).length;
    },
    getTotalFolderChatCount(folderId) {
      // Get direct chats in this folder
      let count = this.getFolderChatCount(folderId);
      
      // Get chats in all subfolders recursively
      const childFolders = safeFilter(folders.value, folder => folder.parent_id === folderId);
      for (const childFolder of childFolders) {
        count += this.getTotalFolderChatCount(childFolder.id);
      }
      
      return count;
    },
    // Context Menu for Chats
    showChatContextMenu(event, chat) {
      if (!chat) return;
      
      console.log('Right-clicked on chat:', chat.title, event);
      
      this.contextMenuTop = event.clientY;
      this.contextMenuLeft = event.clientX;
      this.contextMenuTitle = chat.title;
      
      try {
        // Build menu items with move to folder submenu
        const folderSubMenu = safeFilter(folders.value, folder => folder.id !== chat.folder_id)
          .map(folder => ({
            label: folder.name,
            icon: 'bi-folder',
            action: () => {
              this.moveChatToFolderWithNotification(chat.id, folder.id);
            }
          }));
        
        // Keep this fully intact to ensure all menu items are set
        this.contextMenuItems = [
          {
            label: 'Rename Chat',
            icon: 'bi-pencil',
            action: () => {
              const newTitle = prompt('Enter new chat title:', chat.title);
              if (newTitle && newTitle.trim() !== '') {
                updateChat(chat.id, { title: newTitle.trim() })
                  .catch(err => {
                    addError({
                      title: 'Rename Error',
                      message: `Failed to rename chat: ${err.message}`
                    });
                  });
              }
            }
          },
          {
            label: 'Duplicate Chat',
            icon: 'bi-copy',
            action: () => {
              this.duplicateChatWithNotification(chat.id);
            }
          },
          {
            label: 'Move to Folder',
            icon: 'bi-folder-symlink',
            submenu: folderSubMenu
          },
          {
            label: 'Export Chat',
            icon: 'bi-download',
            action: () => {
              this.exportChatWithNotification(chat.id);
            }
          },
          {
            label: 'Delete Chat',
            icon: 'bi-trash',
            action: () => {
              if (confirm('Are you sure you want to delete this chat?')) {
                this.$emit('delete-chat', chat.id);
              }
            }
          }
        ];
        
        console.log('Showing chat context menu', {
          top: this.contextMenuTop,
          left: this.contextMenuLeft,
          title: this.contextMenuTitle,
          itemCount: this.contextMenuItems.length
        });
        
        // Set after a short delay to ensure Vue updates
        setTimeout(() => {
          this.showContextMenu = true;
        }, 1);
      } catch (err) {
        console.error('Error showing context menu:', err);
      }
    },
    // Context Menu for Folders
    showFolderContextMenu(event, folder) {
      // Don't allow operations on the Uncategorized folder
      if (!folder || folder.id === 1) return;
      
      console.log('Right-clicked on folder:', folder.name, event);
      
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
            label: 'Create Subfolder',
            icon: 'bi-folder-plus',
            action: () => {
              this.selectedFolder = { parent_id: folder.id };
              this.showFolderDialog = true;
            }
          },
          {
            label: 'Rename',
            icon: 'bi-pencil-square',
            action: () => {
              const newName = prompt('Enter new folder name:', folder.name);
              if (newName && newName.trim() !== '') {
                const updatedFolder = { ...folder, name: newName.trim() };
                this.$emit('update-folder', updatedFolder);
              }
            }
          },
          {
            label: 'Expand All',
            icon: 'bi-arrows-angle-expand',
            action: () => {
              this.expandAllFolders(folder.id);
            }
          },
          {
            label: 'Collapse All',
            icon: 'bi-arrows-angle-contract',
            action: () => {
              this.collapseAllFolders(folder.id);
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
        
        console.log('Showing folder context menu', {
          top: this.contextMenuTop,
          left: this.contextMenuLeft,
          title: this.contextMenuTitle,
          itemCount: this.contextMenuItems.length
        });
        
        // Set after a short delay to ensure Vue updates
        setTimeout(() => {
          this.showContextMenu = true;
        }, 1);
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
          existingFolder.parent_id = folder.parent_id;
          // Update folder in database
          this.$emit('update-folder', existingFolder);
        }
      } else {
        // Create new folder
        createFolder(folder.name, folder.parent_id);
      }
    },
    // Drag and Drop functionality
    handleDragStart(event, chat) {
      this.isDragging = true;
      this.draggedChat = chat;
      this.isDraggingFolder = false;
      
      event.dataTransfer.effectAllowed = 'move';
      // Use new format: "type:id"
      event.dataTransfer.setData('text/plain', `chat:${chat.id}`);
      
      // Add a dragging class to the element
      event.target.classList.add('dragging');
    },
    handleFolderDragStart(data) {
      this.isDragging = true;
      this.isDraggingFolder = true;
      this.draggedFolder = data.folder;
      
      // Add styling classes if needed
      console.log('Folder drag started:', data.folder.name);
    },
    handleDragOver(event, folderId) {
      // Don't allow dropping on itself
      if (this.isDraggingFolder && this.draggedFolder && this.draggedFolder.id === folderId) {
        return;
      }
      
      // Don't allow dropping chat/folder into its current folder
      if (
        (this.draggedChat && this.draggedChat.folder_id === folderId) ||
        (this.draggedFolder && this.draggedFolder.parent_id === folderId)
      ) {
        return;
      }
      
      // Prevent dropping a folder into its descendant
      if (this.isDraggingFolder && this.isDescendantOf(folderId, this.draggedFolder.id)) {
        return;
      }
      
      // Set drop effect
      event.dataTransfer.dropEffect = 'move';
      this.isDraggingOver = true;
      this.currentDropTarget = folderId;
    },
    handleDragLeave() {
      this.isDraggingOver = false;
      this.currentDropTarget = null;
    },
    handleDrop(event, folderId) {
      try {
        console.log('Drop event received:', event, 'Target folder:', folderId);
        
        // If we're getting the event info directly from the folder-tree component
        if (event && event.moveFolderId) {
          // Moving a folder to another folder
          this.moveFolderToParentWithNotification(event.moveFolderId, folderId);
        } else if (event && event.chatId) {
          // Moving a chat to a folder
          this.moveChatToFolderWithNotification(event.chatId, folderId);
        } else if (this.isDraggingFolder && this.draggedFolder) {
          // Using the tracked dragged folder (fallback)
          this.moveFolderToParentWithNotification(this.draggedFolder.id, folderId);
        } else if (this.draggedChat) {
          // Using the tracked dragged chat (fallback)
          this.moveChatToFolderWithNotification(this.draggedChat.id, folderId);
        } else if (event.dataTransfer && event.dataTransfer.getData) {
          // Try to parse data from the dataTransfer
          try {
            const data = event.dataTransfer.getData('text/plain');
            console.log('Drop data:', data);
            const [itemType, itemId] = data.split(':');
            
            if (itemType === 'folder') {
              this.moveFolderToParentWithNotification(parseInt(itemId), folderId);
            } else if (itemType === 'chat') {
              this.moveChatToFolderWithNotification(parseInt(itemId), folderId);
            }
          } catch (dataError) {
            console.error('Error parsing drop data:', dataError);
          }
        } else {
          console.warn('No drag data found for the drop operation');
        }
        
        // Reset drag state
        this.isDragging = false;
        this.isDraggingOver = false;
        this.isDraggingFolder = false;
        this.currentDropTarget = null;
        this.draggedChat = null;
        this.draggedFolder = null;
        
      } catch (error) {
        console.error('Error in handleDrop:', error);
        addError({
          title: 'Drop Error',
          message: 'An error occurred while moving the item.',
          details: error.message
        });
      }
    },
    // Folder hierarchy check
    isDescendantOf(folderId, ancestorId) {
      // Check if folderId is a descendant of ancestorId
      const folder = folders.value.find(f => f.id === folderId);
      if (!folder || !folder.parent_id) return false;
      if (folder.parent_id === ancestorId) return true;
      return this.isDescendantOf(folder.parent_id, ancestorId);
    },
    // Move a folder with notification
    moveFolderToParentWithNotification(folderId, parentId) {
      try {
        const folder = this.getFolderById(folderId);
        const parentFolder = this.getFolderById(parentId);
        
        if (folder && parentFolder) {
          moveFolderToParent(folderId, parentId)
            .then(() => {
              // Show notification
              this.folderMovedName = folder.name;
              this.folderDestinationName = parentFolder.name;
              this.folderMoveToast = true;
              
              // Auto-hide after 3 seconds
              setTimeout(() => {
                this.folderMoveToast = false;
              }, 3000);
            })
            .catch(err => {
              addError({
                title: 'Folder Move Error',
                message: `Failed to move "${folder.name}" to "${parentFolder.name}"`,
                details: err.message
              });
            });
        }
      } catch (error) {
        console.error('Error moving folder:', error);
        addError({
          title: 'Folder Move Error',
          message: 'An error occurred while moving the folder.',
          details: error.message
        });
      }
    },
    getChildFolders(parentId) {
      try {
        return safeFilter(folders.value, folder => folder.parent_id === parentId);
      } catch (error) {
        console.error('Error getting child folders:', error);
        addError({
          title: 'Folder Structure Error',
          message: 'An error occurred while loading folder structure',
          details: error.message
        });
        return [];
      }
    },
    // Move chat with notification
    moveChatToFolderWithNotification(chatId, folderId) {
      const targetFolder = this.getFolderById(folderId);
      if (targetFolder) {
        moveChatToFolder(chatId, folderId)
          .then(() => {
            this.lastMovedToFolderName = targetFolder.name;
            this.showToast = true;
            
            // Auto-hide toast after 3 seconds
            setTimeout(() => {
              this.showToast = false;
            }, 3000);
          })
          .catch(err => {
            addError({
              title: 'Chat Move Error',
              message: `Failed to move chat to "${targetFolder.name}"`,
              details: err.message
            });
          });
      }
    },
    // Implement duplicate chat functionality
    duplicateChatWithNotification(chatId) {
      try {
        // Show a loading indicator or disable UI if needed
        
        duplicateChat(chatId)
          .then(newChatId => {
            if (newChatId) {
              // Show success notification
              addError({
                title: 'Success',
                message: 'Chat duplicated successfully',
                type: 'success',
                duration: 3000
              });
              
              // Select the new chat
              this.$emit('select-chat', newChatId);
            } else {
              throw new Error('Failed to duplicate chat');
            }
          })
          .catch(err => {
            addError({
              title: 'Duplicate Chat Error',
              message: `Failed to duplicate chat: ${err.message}`,
              type: 'error'
            });
          });
      } catch (error) {
        addError({
          title: 'Duplicate Chat Error',
          message: `An unexpected error occurred: ${error.message}`,
          type: 'error'
        });
      }
    },
    // Implement export chat functionality
    exportChatWithNotification(chatId) {
      try {
        exportChat(chatId)
          .then(success => {
            if (success) {
              addError({
                title: 'Success',
                message: 'Chat exported successfully',
                type: 'success',
                duration: 3000
              });
            } else {
              throw new Error('Failed to export chat');
            }
          })
          .catch(err => {
            addError({
              title: 'Export Chat Error',
              message: `Failed to export chat: ${err.message}`,
              type: 'error'
            });
          });
      } catch (error) {
        addError({
          title: 'Export Chat Error',
          message: `An unexpected error occurred: ${error.message}`,
          type: 'error'
        });
      }
    },
    // Method to expand all folders starting from a given folder ID
    expandAllFolders(folderId) {
      try {
        // Find the folder tree component for the specified folder
        const folderTreeEls = document.querySelectorAll('.folder-tree');
        
        // Find the folder tree component that matches the folder ID
        for (const el of folderTreeEls) {
          // Get component using Vue's instance property
          const component = el.__vueParentComponent?.child;
          
          if (component && component.folder && component.folder.id === folderId) {
            // If we found the right component, call its expandAll method
            if (typeof component.expandAll === 'function') {
              component.expandAll();
              
              // Show notification
              addError({
                title: 'Success',
                message: 'All folders expanded',
                type: 'success',
                duration: 2000
              });
              
              return;
            }
          }
        }
        
        // If we couldn't find the folder
        throw new Error(`Couldn't find folder component for ID ${folderId}`);
      } catch (error) {
        console.error('Error expanding folders:', error);
        addError({
          title: 'Expand Error',
          message: `Failed to expand folders: ${error.message}`,
          type: 'error'
        });
      }
    },
    
    // Method to collapse all folders starting from a given folder ID
    collapseAllFolders(folderId) {
      try {
        // Find the folder tree component for the specified folder
        const folderTreeEls = document.querySelectorAll('.folder-tree');
        
        // Find the folder tree component that matches the folder ID
        for (const el of folderTreeEls) {
          // Get component using Vue's instance property
          const component = el.__vueParentComponent?.child;
          
          if (component && component.folder && component.folder.id === folderId) {
            // If we found the right component, call its collapseAll method
            if (typeof component.collapseAll === 'function') {
              component.collapseAll();
              
              // Show notification
              addError({
                title: 'Success',
                message: 'All folders collapsed',
                type: 'success',
                duration: 2000
              });
              
              return;
            }
          }
        }
        
        // If we couldn't find the folder
        throw new Error(`Couldn't find folder component for ID ${folderId}`);
      } catch (error) {
        console.error('Error collapsing folders:', error);
        addError({
          title: 'Collapse Error',
          message: `Failed to collapse folders: ${error.message}`,
          type: 'error'
        });
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