<template>
  <div class="folder-tree">
    <div class="folder-node" 
      :class="{ 
        'active': selectedFolderId === folder.id,
        'folder-drop-target': isDraggingOver && currentDropTarget === folder.id 
      }"
      @click="toggleExpanded"
      @contextmenu.prevent="onContextMenu"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
      draggable="true"
      @dragstart="handleFolderDragStart">
      
      <div class="folder-content">
        <button class="folder-toggle" @click.stop="toggleExpanded">
          <i class="bi" :class="expanded ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
        </button>
        
        <div class="folder-details" @click.stop="selectFolder">
          <i class="bi bi-folder-fill me-2 folder-icon"></i>
          <div class="folder-name text-truncate">{{ folder.name }}</div>
        </div>
        
        <span class="ms-auto folder-count" v-if="totalChatCount > 0" :title="`${chatCount} direct, ${totalChatCount} total`">
          {{ totalChatCount }}
        </span>
      </div>
    </div>
    
    <div class="folder-children" v-if="hasChildren && expanded">
      <folder-tree
        v-for="child in children"
        :key="child.id"
        :folder="child"
        :children="getChildFolders(child.id)"
        :all-folders="allFolders"
        :all-chats="allChats"
        :selected-folder-id="selectedFolderId"
        :current-drop-target="currentDropTarget"
        :is-dragging-over="isDraggingOver"
        :indent="indent + 1"
        :get-total-chat-count="getTotalChatCount"
        @select="$emit('select', $event)"
        @context-menu="$emit('context-menu', $event)"
        @drag-over="$emit('drag-over', $event)"
        @drag-leave="$emit('drag-leave')"
        @drop="$emit('drop', $event)"
        @folder-drag-start="$emit('folder-drag-start', $event)"
      />
    </div>
  </div>
</template>

<script>
import { safeFilter } from '../utils/errorUtils';

export default {
  name: 'FolderTree',
  props: {
    folder: {
      type: Object,
      required: true
    },
    children: {
      type: Array,
      default: () => []
    },
    allFolders: {
      type: Array,
      required: true
    },
    allChats: {
      type: Array,
      required: true
    },
    selectedFolderId: {
      type: Number,
      default: null
    },
    currentDropTarget: {
      type: Number,
      default: null
    },
    isDraggingOver: {
      type: Boolean,
      default: false
    },
    indent: {
      type: Number,
      default: 0
    },
    parentId: {
      type: Number,
      default: null
    },
    getTotalChatCount: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      expanded: true // Start expanded by default
    };
  },
  computed: {
    hasChildren() {
      return this.children && this.children.length > 0;
    },
    chatCount() {
      return safeFilter(this.allChats, chat => chat.folder_id === this.folder.id).length;
    },
    totalChatCount() {
      // If parent provides a function to get total count, use it
      if (this.getTotalChatCount) {
        return this.getTotalChatCount(this.folder.id);
      }
      
      // Otherwise just show direct chats
      return this.chatCount;
    }
  },
  methods: {
    toggleExpanded(event) {
      this.expanded = !this.expanded;
      if (event) event.stopPropagation(); // Prevent bubbling
    },
    selectFolder() {
      this.$emit('select', this.folder.id);
    },
    onContextMenu(event) {
      event.preventDefault();
      event.stopPropagation();
      
      console.log('Right-clicked on folder:', this.folder.name);
      
      this.$emit('context-menu', { 
        event, 
        folder: this.folder
      });
    },
    // Method to expand this folder and all its children
    expandAll() {
      // Set this folder to expanded
      this.expanded = true;
      
      // Wait for children to be rendered
      this.$nextTick(() => {
        // Find all child FolderTree components and call expandAll on them
        const childComponents = this.$el.querySelectorAll('.folder-children .folder-tree');
        
        childComponents.forEach(el => {
          // Get the Vue component instance
          const childComponent = el.__vueParentComponent?.child;
          if (childComponent && typeof childComponent.expandAll === 'function') {
            childComponent.expandAll();
          }
        });
      });
    },
    // Method to collapse this folder and all its children
    collapseAll() {
      // First collapse all children recursively
      this.$nextTick(() => {
        // Find all child FolderTree components and call collapseAll on them
        const childComponents = this.$el.querySelectorAll('.folder-children .folder-tree');
        
        childComponents.forEach(el => {
          // Get the Vue component instance
          const childComponent = el.__vueParentComponent?.child;
          if (childComponent && typeof childComponent.collapseAll === 'function') {
            childComponent.collapseAll();
          }
        });
        
        // Then collapse this folder
        this.expanded = false;
      });
    },
    handleDragOver(event) {
      // Accept both chats and folders
      event.dataTransfer.dropEffect = 'move';
      this.$emit('drag-over', { event, folderId: this.folder.id });
    },
    handleDragLeave() {
      this.$emit('drag-leave');
    },
    handleDrop(event) {
      try {
        // Check if dataTransfer exists before using it
        if (event && event.dataTransfer && event.dataTransfer.getData) {
          const data = event.dataTransfer.getData('text/plain');
          console.log('Drop data received in FolderTree:', data);
          
          if (data.includes(':')) {
            const [itemType, itemId] = data.split(':');
            
            if (itemType === 'chat') {
              // Chat is being dropped
              this.$emit('drop', { 
                chatId: parseInt(itemId), 
                folderId: this.folder.id 
              });
            } else if (itemType === 'folder') {
              // Folder is being dropped
              this.$emit('drop', { 
                moveFolderId: parseInt(itemId), 
                folderId: this.folder.id 
              });
            }
          } else {
            // Legacy format - assume it's a chat ID
            const chatId = parseInt(data);
            if (!isNaN(chatId)) {
              this.$emit('drop', { 
                chatId: chatId, 
                folderId: this.folder.id 
              });
            }
          }
        } else {
          // No valid dataTransfer, emit event with just the folder ID
          this.$emit('drop', { folderId: this.folder.id });
        }
      } catch (error) {
        console.error('Error in FolderTree handleDrop:', error);
        // Still emit the event with the error
        this.$emit('drop', { 
          folderId: this.folder.id, 
          error: error.message
        });
      }
    },
    handleFolderDragStart(event) {
      // Set data for drag operation - identify this as a folder, not a chat
      event.dataTransfer.setData('text/plain', `folder:${this.folder.id}`);
      event.dataTransfer.effectAllowed = 'move';
      
      // Emit event for parent components
      this.$emit('folder-drag-start', { 
        event, 
        folderId: this.folder.id, 
        folder: this.folder 
      });
      
      // Add styling
      event.target.classList.add('dragging');
    },
    getChildFolders(parentId) {
      return safeFilter(this.allFolders, f => f.parent_id === parentId);
    }
  }
};
</script>

<style scoped>
.folder-tree {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.folder-node {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  margin-bottom: 2px;
  --indent-level: v-bind(indent);
  position: relative;
}

.folder-node:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.folder-node.active {
  background-color: rgba(13, 110, 253, 0.15);
}

.folder-node.folder-drop-target {
  background-color: rgba(13, 110, 253, 0.1);
  border: 1px dashed #0d6efd;
}

.folder-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding-left: calc(var(--indent-level) * 16px);
}

.folder-details {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 4px;
}

.folder-details:hover {
  background-color: rgba(13, 110, 253, 0.08);
}

.folder-toggle {
  background: none;
  border: none;
  padding: 0 4px;
  margin-right: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 20px;
  color: #6c757d;
}

.folder-toggle:hover {
  color: #000;
}

.folder-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-children {
  margin-left: 12px;
  border-left: 1px dashed #dee2e6;
  padding-left: 8px;
}

.folder-icon {
  color: #ffc107;
}

.folder-count {
  font-size: 0.75rem;
  color: #6c757d;
  opacity: 0.8;
  min-width: 1.2rem;
  text-align: center;
  font-weight: normal;
}

/* Drag styles */
.folder-node.dragging {
  opacity: 0.5;
}

/* Animation for expand/collapse */
.folder-children-enter-active,
.folder-children-leave-active {
  transition: all 0.3s;
  max-height: 500px;
  overflow: hidden;
}

.folder-children-enter-from,
.folder-children-leave-to {
  max-height: 0;
  opacity: 0;
}
</style> 