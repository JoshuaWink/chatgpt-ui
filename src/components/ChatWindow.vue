<template>
  <div class="chat-window card">
    <div class="card-header bg-light">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <button class="btn btn-sm btn-icon d-md-none me-2" @click="toggleSidebar">
            <i class="bi bi-list"></i>
          </button>
          <div class="avatar bg-success text-white me-2">A</div>
          <div>
            <h5 class="mb-0">{{ currentChat.title || 'New Chat' }}</h5>
            <small class="text-muted">
              <i class="bi bi-folder-fill me-1"></i>{{ currentFolderName }}
              <span v-if="folderChanged" class="folder-updated-badge ms-2">
                Moved
              </span>
            </small>
          </div>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-secondary me-2" @click="showMoveToFolder">
            <i class="bi bi-folder-symlink me-1"></i>Move
          </button>
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
        
        <div v-if="!modelConnected" class="alert alert-info mt-4 mx-auto" style="max-width: 500px;">
          <h5><i class="bi bi-info-circle me-2"></i>Local Model Connection</h5>
          <p>The application is currently in simulation mode because it couldn't connect to a local model server.</p>
          <p class="mb-0">If you want to use a local model, make sure it's running at <code>http://localhost:8080</code> with OpenAI-compatible API.</p>
          <hr>
          <p class="mb-0">Example cURL command:</p>
          <code-block :code="getCurlCommand()" title="cURL for Chat Completions" />
        </div>
      </div>
      <chat-message 
        v-for="(message, index) in currentChat.messages" 
        :key="index" 
        :content="message.content" 
        :is-user="message.isUser" 
        :timestamp="message.timestamp" />
    </div>
    <div class="card-footer p-0 border-0">
      <chat-input 
        @send="sendMessage" 
        :is-loading="isLoadingResponse"
        :model-connected="modelConnected"
        @show-curl="showCurlExample = true" />
    </div>
    
    <!-- Folder Selection Dialog -->
    <div class="modal fade" :class="{ 'show d-block': showFolderSelect }">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Move to Folder</h5>
            <button type="button" class="btn-close" @click="showFolderSelect = false"></button>
          </div>
          <div class="modal-body">
            <div class="list-group">
              <button 
                v-for="folder in allFolders" 
                :key="folder.id"
                class="list-group-item list-group-item-action d-flex align-items-center"
                :class="{ 
                  'active': currentChat.folder_id === folder.id,
                  'text-muted': currentChat.folder_id === folder.id,
                  'folder-item-selectable': currentChat.folder_id !== folder.id
                }"
                :disabled="currentChat.folder_id === folder.id"
                @click="moveToFolder(folder.id)">
                <i class="bi bi-folder me-2"></i>
                {{ folder.name }}
                <span v-if="currentChat.folder_id === folder.id" class="ms-2 small">(Current)</span>
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showFolderSelect = false">Cancel</button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" @click="showFolderSelect = false"></div>
    </div>
    
    <!-- cURL Command Modal -->
    <div class="modal fade" :class="{ 'show d-block': showCurlExample }">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">cURL Command for Local Model</h5>
            <button type="button" class="btn-close" @click="showCurlExample = false"></button>
          </div>
          <div class="modal-body">
            <p>Use the following cURL command to interact with your local model directly:</p>
            <code-block 
              :code="curlCommand || getCurlCommand()" 
              title="cURL for Chat Completions API" />
            <p class="text-muted small mt-3">
              This command sends the current conversation to your local model server at http://localhost:5145 
              following the OpenAI API format.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showCurlExample = false">Close</button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" @click="showCurlExample = false"></div>
    </div>
  </div>
</template>

<script>
import ChatMessage from './ChatMessage.vue';
import ChatInput from './ChatInput.vue';
import CodeBlock from './CodeBlock.vue';
import { folders, moveChatToFolder } from '../services/database';
import modelService from '../services/modelService';

export default {
  name: 'ChatWindow',
  components: {
    ChatMessage,
    ChatInput,
    CodeBlock
  },
  props: {
    currentChat: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showFolderSelect: false,
      folderChanged: false,
      previousFolderId: null,
      isLoadingResponse: false,
      modelConnected: false,
      curlCommand: '',
      showCurlExample: false
    };
  },
  computed: {
    availableFolders() {
      return folders.value.filter(folder => folder.id !== this.currentChat.folder_id);
    },
    allFolders() {
      return folders.value;
    },
    currentFolderName() {
      const folder = folders.value.find(f => f.id === this.currentChat.folder_id);
      return folder ? folder.name : 'Uncategorized';
    }
  },
  watch: {
    'currentChat.folder_id': {
      handler(newFolderId, oldFolderId) {
        if (oldFolderId && newFolderId !== oldFolderId) {
          this.showFolderChanged();
        }
      }
    }
  },
  async mounted() {
    this.scrollToBottom();
    
    // Test connection to model server
    try {
      this.modelConnected = await modelService.testConnection();
      console.log('Model server connection:', this.modelConnected ? 'connected' : 'disconnected');
    } catch (err) {
      console.error('Error connecting to model server:', err);
      this.modelConnected = false;
    }
  },
  updated() {
    this.scrollToBottom();
  },
  methods: {
    async sendMessage(content) {
      // Add user message
      this.addMessage(content, true);
      
      // Generate a title for the chat if it's the first message
      if (this.currentChat.messages.length === 1 && this.currentChat.title === 'New Chat') {
        this.$emit('update-title', content.substring(0, 30) + (content.length > 30 ? '...' : ''));
      }
      
      if (this.modelConnected) {
        await this.getModelResponse(content);
      } else {
        // Fall back to simulation if model is not connected
        setTimeout(() => {
          this.simulateResponse(content);
        }, 1000);
      }
    },
    async getModelResponse(userMessage) {
      try {
        this.isLoadingResponse = true;
        
        // Prepare the message history for the API call
        const messages = this.currentChat.messages.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.content
        }));
        
        // Generate the cURL command for reference
        this.curlCommand = modelService.generateCurlCommand('/v1/chat/completions', {
          model: 'local-model',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        });
        
        console.log('Generated cURL command:', this.curlCommand);
        
        // Call the model service
        const response = await modelService.generateChatCompletion(messages);
        
        // Check if we have a valid response
        if (response && response.choices && response.choices.length > 0) {
          const responseText = response.choices[0].message.content;
          this.addMessage(responseText, false);
        } else {
          throw new Error('Invalid response from model');
        }
      } catch (error) {
        console.error('Error getting model response:', error);
        // Fall back to simulation on error
        this.addMessage("I'm sorry, I couldn't connect to the model server. Here's a simulated response instead.", false);
        this.simulateResponse(userMessage);
      } finally {
        this.isLoadingResponse = false;
      }
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
      } else if (userMessage.toLowerCase().includes('curl')) {
        response = `Here's a cURL command to access the local model:\n\n\`\`\`\n${this.curlCommand}\n\`\`\``;
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
    },
    showMoveToFolder() {
      this.previousFolderId = this.currentChat.folder_id;
      this.showFolderSelect = true;
    },
    moveToFolder(folderId) {
      if (folderId === this.currentChat.folder_id) {
        this.showFolderSelect = false;
        return;
      }
      
      console.log(`Moving chat ${this.currentChat.id} to folder ${folderId}`);
      moveChatToFolder(this.currentChat.id, folderId)
        .then(() => {
          console.log('Chat moved successfully');
          this.$emit('moved-to-folder', folderId);
          this.showFolderChanged();
        })
        .catch(err => {
          console.error('Error moving chat:', err);
          alert('Failed to move chat. Please try again.');
        })
        .finally(() => {
          this.showFolderSelect = false;
        });
    },
    showFolderChanged() {
      this.folderChanged = true;
      setTimeout(() => {
        this.folderChanged = false;
      }, 3000);
    },
    getCurlCommand() {
      // Generate and return a cURL command for the current conversation
      const messages = this.currentChat.messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));
      
      return modelService.generateCurlCommand('/v1/chat/completions', {
        model: 'local-model',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      });
    },
    copyToClipboard(text) {
      try {
        // Modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text)
            .then(() => {
              alert('cURL command copied to clipboard!');
            })
            .catch(err => {
              console.error('Failed to copy text: ', err);
              this.fallbackCopyToClipboard(text);
            });
        } else {
          this.fallbackCopyToClipboard(text);
        }
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        alert('Failed to copy to clipboard. Please copy the command manually.');
      }
    },
    fallbackCopyToClipboard(text) {
      // Fallback to older execCommand method
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      alert('cURL command copied to clipboard!');
    }
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

/* Modal styling */
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

.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

@media (max-width: 767.98px) {
  .chat-messages {
    padding: 0.75rem;
  }
  
  .card-header {
    padding: 0.75rem;
  }
}

.folder-updated-badge {
  display: inline-block;
  background-color: #198754;
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 1rem;
  animation: fade-in-out 3s forwards;
}

@keyframes fade-in-out {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

.list-group-item:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.folder-item-selectable {
  position: relative;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.folder-item-selectable:hover {
  background-color: rgba(13, 110, 253, 0.1);
  border-left: 3px solid #0d6efd;
  transform: translateX(2px);
}

/* Add a subtle indicator to show clickable items */
.folder-item-selectable::after {
  content: '\F132';
  font-family: "bootstrap-icons";
  position: absolute;
  right: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}

.folder-item-selectable:hover::after {
  opacity: 0.7;
}

/* Style the modal more clearly */
.modal-content {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.modal-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}
</style> 