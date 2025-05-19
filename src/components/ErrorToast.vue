<template>
  <div class="error-toast-container" v-if="errors.length > 0">
    <div 
      v-for="(error, index) in errors" 
      :key="index"
      class="error-toast">
      <div class="error-toast-header">
        <i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>
        <strong class="me-auto">Error</strong>
        <button type="button" class="btn-close" @click="dismissError(index)"></button>
      </div>
      <div class="error-toast-body">
        <p class="mb-1"><strong>{{ error.title || 'An error occurred' }}</strong></p>
        <p class="mb-0">{{ error.message }}</p>
        <small v-if="error.details" class="text-muted">
          Details: {{ error.details }}
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

// Create a global reactive array to store errors
const errors = ref([]);

// Helper function to add an error
const addError = (error) => {
  // Format the error properly
  const errorObj = typeof error === 'string' 
    ? { message: error } 
    : error;
    
  // Add timestamp
  errorObj.timestamp = new Date();
  
  // Add to errors array
  errors.value.push(errorObj);
  
  // Return the index for potential programmatic dismissal
  return errors.value.length - 1;
};

// Helper function to dismiss an error by index
const dismissError = (index) => {
  if (index >= 0 && index < errors.value.length) {
    errors.value.splice(index, 1);
  }
};

// Helper function to clear all errors
const clearAllErrors = () => {
  errors.value = [];
};

export default {
  name: 'ErrorToast',
  setup() {
    return {
      errors,
      dismissError
    };
  }
};

// Export the helper functions
export { addError, dismissError, clearAllErrors };
</script>

<style scoped>
.error-toast-container {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1100;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-toast {
  background-color: white;
  border-left: 4px solid #dc3545;
  border-radius: 4px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slide-in 0.3s ease-out;
}

.error-toast-header {
  padding: 0.5rem 1rem;
  background-color: rgba(220, 53, 69, 0.1);
  display: flex;
  align-items: center;
}

.error-toast-body {
  padding: 1rem;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style> 