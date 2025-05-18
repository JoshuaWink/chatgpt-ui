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
      folderName: ''
    };
  },
  computed: {
    isEdit() {
      return this.folder !== null;
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.folderName = this.folder ? this.folder.name : '';
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
        name: this.folderName.trim()
      });
      
      this.close();
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