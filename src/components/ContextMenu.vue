<template>
  <div 
    v-if="show" 
    class="context-menu" 
    :style="{ top: top + 'px', left: left + 'px' }">
    <div class="context-menu-header mb-1" v-if="title">
      {{ title }}
    </div>
    <div 
      v-for="(item, index) in menuItems"
      :key="index"
      class="context-menu-item"
      :class="{ 'context-menu-divider': item.divider, 'context-menu-submenu': item.submenu }"
      @click="handleItemClick(item, index)">
      <template v-if="!item.divider">
        <i v-if="item.icon" :class="'bi ' + item.icon + ' me-2'"></i>
        <span>{{ item.label }}</span>
        <i v-if="item.submenu" class="bi bi-chevron-right ms-auto"></i>
        
        <!-- Submenu -->
        <div 
          v-if="item.submenu && currentSubmenu === index" 
          class="context-submenu">
          <div 
            v-for="(subItem, subIndex) in item.submenu"
            :key="subIndex"
            class="context-menu-item"
            @click.stop="handleSubItemClick(item, subItem)">
            <i v-if="subItem.icon" :class="'bi ' + subItem.icon + ' me-2'"></i>
            <span>{{ subItem.label }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContextMenu',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    top: {
      type: Number,
      default: 0
    },
    left: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: ''
    },
    menuItems: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentSubmenu: null
    };
  },
  mounted() {
    // Close context menu when clicking outside
    document.addEventListener('click', this.closeMenu);
    document.addEventListener('contextmenu', this.closeMenu);
  },
  watch: {
    show(newVal) {
      if (newVal) {
        // Only perform position adjustment when menu is shown
        this.$nextTick(() => {
          this.adjustPosition();
        });
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu);
    document.removeEventListener('contextmenu', this.closeMenu);
  },
  methods: {
    adjustPosition() {
      try {
        if (!this.$el || !this.show) return;
        
        const rect = this.$el.getBoundingClientRect();
        if (!rect) return;
        
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (rect.right > windowWidth) {
          this.$emit('update:left', this.left - (rect.right - windowWidth) - 10);
        }
        
        if (rect.bottom > windowHeight) {
          this.$emit('update:top', this.top - (rect.bottom - windowHeight) - 10);
        }
      } catch (err) {
        console.error('Error adjusting context menu position:', err);
      }
    },
    closeMenu() {
      this.$emit('update:show', false);
      this.currentSubmenu = null;
    },
    handleItemClick(item, index) {
      if (item.divider) return;
      
      if (item.submenu) {
        // Toggle submenu
        this.currentSubmenu = this.currentSubmenu === index ? null : index;
        return;
      }
      
      if (item.action) {
        item.action(item);
      }
      
      this.closeMenu();
    },
    handleSubItemClick(parentItem, subItem) {
      if (subItem.action) {
        subItem.action(subItem, parentItem);
      }
      
      this.closeMenu();
    }
  }
}
</script>

<style scoped>
.context-menu {
  position: fixed;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 0.5rem 0;
  min-width: 160px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1050;
}

.context-menu-header {
  padding: 0.25rem 1rem;
  font-weight: 500;
  color: #6c757d;
  font-size: 0.875rem;
  border-bottom: 1px solid #eee;
}

.context-menu-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
}

.context-menu-item:hover {
  background-color: #f8f9fa;
}

.context-menu-divider {
  height: 0;
  margin: 0.5rem 0;
  overflow: hidden;
  border-top: 1px solid #dee2e6;
  padding: 0;
  cursor: default;
}

.context-submenu {
  position: absolute;
  top: 0;
  left: 100%;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 0.5rem 0;
  min-width: 160px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style> 