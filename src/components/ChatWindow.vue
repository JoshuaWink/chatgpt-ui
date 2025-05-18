<template>
  <div class="chat-window card">
    <div class="card-header bg-light">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <button class="btn btn-sm btn-icon d-md-none me-2" @click="toggleSidebar">
            <i class="bi bi-list"></i>
          </button>
          <div class="avatar bg-success text-white me-2">A</div>
          <h5 class="mb-0">{{ currentChat.title || 'New Chat' }}</h5>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-secondary me-2" @click="deleteChat">
            <i class="bi bi-trash me-1"></i>Delete
          </button>
          <button class="btn btn-sm btn-outline-secondary" @click="clearChat">
            <i class="bi bi-eraser me-1"></i>Clear
          </button>
        </div>
      </div>
    </div>
    <div class="card-body chat-messages" ref="messagesContainer">
      <div v-if="currentChat.messages.length === 0" class="text-center text-muted py-5">
        <h3>Welcome to ChatGPT</h3>
        <p>Send a message to start a conversation!</p>
      </div>
      <chat-message 
        v-for="(message, index) in currentChat.messages" 
        :key="index" 
        :content="message.content" 
        :is-user="message.isUser" 
        :timestamp="message.timestamp" />
    </div>
    <div class="card-footer p-0 border-0">
      <chat-input @send="sendMessage" />
    </div>
  </div>
</template>

<script>
import ChatMessage from './ChatMessage.vue';
import ChatInput from './ChatInput.vue';

export default {
  name: 'ChatWindow',
  components: {
    ChatMessage,
    ChatInput
  },
  props: {
    currentChat: {
      type: Object,
      required: true
    }
  },
  methods: {
    sendMessage(content) {
      // Add user message
      this.addMessage(content, true);
      
      // Generate a title for the chat if it's the first message
      if (this.currentChat.messages.length === 1 && this.currentChat.title === 'New Chat') {
        this.$emit('update-title', content.substring(0, 30) + (content.length > 30 ? '...' : ''));
      }
      
      // Simulate bot response (in a real app, this would be an API call)
      setTimeout(() => {
        this.simulateResponse(content);
      }, 1000);
    },
    addMessage(content, isUser = false) {
      this.$emit('add-message', {
        content,
        isUser,
        timestamp: new Date()
      });
      
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    simulateResponse(userMessage) {
      let response = "I'm an AI assistant simulation. Your message was: " + userMessage;
      
      // Add some variety to responses
      if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        response = "Hello! How can I assist you today?";
      } else if (userMessage.toLowerCase().includes('help')) {
        response = "I'd be happy to help. What do you need assistance with?";
      } else if (userMessage.toLowerCase().includes('thank')) {
        response = "You're welcome! Is there anything else you'd like to know?";
      }
      
      this.addMessage(response, false);
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    clearChat() {
      this.$emit('clear-chat');
    },
    deleteChat() {
      if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
        this.$emit('delete-chat', this.currentChat.id);
      }
    },
    toggleSidebar() {
      this.$emit('toggle-sidebar');
    }
  },
  mounted() {
    this.scrollToBottom();
  },
  updated() {
    this.scrollToBottom();
  }
}
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  border-radius: 0;
  border: none;
  background-color: #fff;
  overflow: hidden;
}

.card-header {
  flex-shrink: 0;
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f8f9fa;
  min-height: 0; /* Critical for nested flex containers */
}

.card-footer {
  flex-shrink: 0;
  padding: 0;
  border: none;
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

@media (max-width: 767.98px) {
  .chat-messages {
    padding: 0.75rem;
  }
  
  .card-header {
    padding: 0.75rem;
  }
}
</style> 