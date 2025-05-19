<template>
  <div class="code-block">
    <div class="code-header">
      <span class="code-title">{{ title }}</span>
      <button class="copy-button" @click="copyCode" title="Copy to clipboard">
        <i class="bi" :class="copied ? 'bi-check' : 'bi-clipboard'"></i>
      </button>
    </div>
    <pre class="code-content"><code>{{ code }}</code></pre>
  </div>
</template>

<script>
export default {
  name: 'CodeBlock',
  props: {
    code: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: 'Code'
    }
  },
  data() {
    return {
      copied: false
    };
  },
  methods: {
    copyCode() {
      try {
        // Modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(this.code)
            .then(() => {
              this.showCopiedIndicator();
            })
            .catch(err => {
              console.error('Failed to copy text: ', err);
              this.fallbackCopy();
            });
        } else {
          this.fallbackCopy();
        }
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        alert('Failed to copy to clipboard. Please copy the code manually.');
      }
    },
    fallbackCopy() {
      const el = document.createElement('textarea');
      el.value = this.code;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.showCopiedIndicator();
    },
    showCopiedIndicator() {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 1500);
    }
  }
};
</script>

<style scoped>
.code-block {
  border-radius: 6px;
  margin: 1rem 0;
  overflow: hidden;
  border: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.code-header {
  padding: 0.5rem 1rem;
  background-color: #e9ecef;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
}

.copy-button {
  background: none;
  border: none;
  color: #495057;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.copy-button:hover {
  background-color: #dee2e6;
}

.code-content {
  margin: 0;
  padding: 1rem;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-x: auto;
}
</style> 