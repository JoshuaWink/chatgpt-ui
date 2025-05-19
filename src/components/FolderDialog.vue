<template>
  <div class="modal fade" :class="{ 'show d-block': show }">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isEdit ? 'Edit Folder' : 'Create New Folder' }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="folderName" class="form-label">Folder Name</label>
            <input 
              type="text" 
              class="form-control" 
              id="folderName" 
              v-model="folderName"
              placeholder="Enter folder name"
              ref="folderNameInput"
              @keyup.enter="save">
          </div>
          <div class="mb-3">
            <label for="parentFolder" class="form-label">Parent Folder (Optional)</label>
            <select 
              class="form-select" 
              id="parentFolder" 
              v-model="parentId">
              <option :value="null">None (Root level)</option>
              <option 
                v-for="folder in availableFolders" 
                :key="folder.id" 
                :value="folder.id"
                :disabled="isEdit && folder.id === this.folder.id">
                {{ folder.name }}
              </option>
            </select>
            <div class="form-text">
              Select a parent to create a nested folder structure.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="save"
            :disabled="!folderName.trim()">
            {{ isEdit ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="show" @click="close"></div>
  </div>
</template>

<script>
import { folders } from '../services/database';

export default {
  name: 'FolderDialog',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    folder: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      folderName: '',
      parentId: null
    };
  },
  computed: {
    isEdit() {
      return this.folder !== null;
    },
    availableFolders() {
      if (this.isEdit) {
        // When editing, exclude the current folder and its descendants
        return folders.value.filter(f => 
          f.id !== this.folder.id && 
          !this.isDescendantOf(f.id, this.folder.id)
        );
      }
      // When creating, show all folders
      return folders.value;
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.folderName = this.folder ? this.folder.name : '';
        this.parentId = this.folder ? this.folder.parent_id : null;
        this.$nextTick(() => {
          this.$refs.folderNameInput.focus();
        });
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:show', false);
    },
    save() {
      if (!this.folderName.trim()) return;
      
      this.$emit('save', {
        id: this.folder ? this.folder.id : null,
        name: this.folderName.trim(),
        parent_id: this.parentId
      });
      
      this.close();
    },
    isDescendantOf(folderId, potentialAncestorId) {
      // Check if folderId is a descendant of potentialAncestorId
      const folder = folders.value.find(f => f.id === folderId);
      if (!folder || !folder.parent_id) return false;
      if (folder.parent_id === potentialAncestorId) return true;
      return this.isDescendantOf(folder.parent_id, potentialAncestorId);
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal {
  z-index: 1050;
  background-color: transparent;
}
</style> 