<template>
  <div class="chat-message" :class="{ 'user-message': isUser, 'assistant-message': !isUser }">
    <div class="message-avatar">
      <div v-if="isUser" class="avatar bg-primary text-white">U</div>
      <div v-else class="avatar bg-success text-white">A</div>
    </div>
    <div class="message-content">
      <div class="message-text" v-html="content"></div>
      <div class="message-time text-muted small">{{ formatTime(timestamp) }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatMessage',
  props: {
    content: {
      type: String,
      required: true
    },
    isUser: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: () => new Date()
    }
  },
  methods: {
    formatTime(date) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
}
</script>

<style scoped>
.chat-message {
  display: flex;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  word-break: break-word;
}

.user-message {
  background-color: rgba(13, 110, 253, 0.05);
}

.assistant-message {
  background-color: rgba(25, 135, 84, 0.05);
}

.message-avatar {
  flex-shrink: 0;
  margin-right: 0.75rem;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.message-content {
  flex: 1;
  min-width: 0; /* Ensures proper text wrapping */
}

.message-text {
  white-space: pre-wrap;
  line-height: 1.5;
}

.message-time {
  margin-top: 0.25rem;
  font-size: 0.75rem;
}
</style> 