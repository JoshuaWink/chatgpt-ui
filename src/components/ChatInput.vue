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
          @keydown.enter.prevent="sendMessage"
          @input="autoResize"></textarea>
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="!message.trim()">
          <i class="bi bi-send-fill me-1"></i>
          Send
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ChatInput',
  data() {
    return {
      message: ''
    }
  },
  methods: {
    sendMessage() {
      if (this.message.trim()) {
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

button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

@media (max-width: 767.98px) {
  .chat-input {
    padding: 0.75rem;
  }
}
</style> 