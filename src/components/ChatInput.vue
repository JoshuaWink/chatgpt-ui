<template>
  <div class="chat-input">
    <form @submit.prevent="sendMessage" class="d-flex">
      <div class="input-group">
        <textarea 
          ref="messageInput"
          v-model="message" 
          class="form-control" 
          placeholder="Type a message..." 
          rows="1"
          :disabled="isLoading"
          @keydown.enter.prevent="sendMessage"
          @input="autoResize"></textarea>
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="!message.trim() || isLoading">
          <div v-if="isLoading" class="spinner-border spinner-border-sm me-1" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <i v-else class="bi bi-send-fill me-1"></i>
          {{ isLoading ? 'Sending...' : 'Send' }}
        </button>
      </div>
    </form>
    <div v-if="modelStatus" class="model-status mt-2">
      <small class="text-muted d-flex align-items-center">
        <span class="status-indicator" :class="{ 'connected': modelConnected }"></span>
        {{ modelConnected ? 'Connected to local model' : 'Using simulation mode' }}
        <button v-if="!modelConnected" class="btn btn-sm btn-link py-0" @click="$emit('show-curl')">
          Show cURL example
        </button>
      </small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatInput',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    modelConnected: {
      type: Boolean,
      default: false
    },
    modelStatus: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      message: ''
    }
  },
  methods: {
    sendMessage() {
      if (this.message.trim() && !this.isLoading) {
        this.$emit('send', this.message.trim());
        this.message = '';
        this.$nextTick(() => {
          this.autoResize();
        });
      }
    },
    autoResize() {
      const textarea = this.$refs.messageInput;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  },
  mounted() {
    this.$refs.messageInput.focus();
  }
}
</script>

<style scoped>
.chat-input {
  flex-shrink: 0;
  width: 100%;
  background-color: #fff;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  z-index: 5;
}

.input-group {
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  border-radius: 8px;
}

textarea {
  resize: none;
  max-height: 200px;
  min-height: 38px;
  overflow-y: auto;
  border-radius: 8px 0 0 8px;
  box-shadow: none;
  border-right: none;
}

textarea:disabled {
  background-color: #f8f9fa;
}

button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  min-width: 85px;
}

.model-status {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #dc3545;
  margin-right: 5px;
  display: inline-block;
}

.status-indicator.connected {
  background-color: #198754;
}

@media (max-width: 767.98px) {
  .chat-input {
    padding: 0.75rem;
  }
}
</style> 