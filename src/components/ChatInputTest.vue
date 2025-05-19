<template>
  <div class="chat-input-test">
    <h2>ChatInput Component Test</h2>
    <div class="test-container">
      <ChatInput @send="handleSend" />
    </div>
    <div class="message-display" v-if="messages.length > 0">
      <h3>Sent Messages:</h3>
      <ul class="message-list">
        <li v-for="(message, index) in messages" :key="index">
          {{ message }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ChatInput from './ChatInput.vue';

export default {
  name: 'ChatInputTest',
  components: {
    ChatInput
  },
  data() {
    return {
      messages: []
    };
  },
  methods: {
    handleSend(message) {
      this.messages.push(message);
    }
  }
};
</script>

<style scoped>
.chat-input-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.test-container {
  border: 1px solid var(--skin-border);
  border-radius: var(--skin-radius-60);
  margin-bottom: 20px;
}

.message-display {
  padding: 15px;
  background-color: var(--skin-background-subtle);
  border-radius: var(--skin-radius-60);
}

.message-list {
  list-style-type: none;
  padding: 0;
}

.message-list li {
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: var(--skin-background-default);
  border-radius: var(--skin-radius-40);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h2, h3 {
  margin-bottom: 15px;
}
</style> 