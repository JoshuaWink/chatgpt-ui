<template>
  <teleport to="body">
    <div 
      v-if="show" 
      class="context-menu" 
      :style="{ top: top + 'px', left: left + 'px' }">
      <div class="context-menu-header mb-1" v-if="title">
        {{ title }}
      </div>
      <div class="context-menu-grid">
        <template v-for="(item, index) in menuItems" :key="index">
          <!-- Skip dividers in grid view -->
          <div 
            v-if="!item.divider"
            class="context-menu-icon-item"
            :class="{ 'has-submenu': item.submenu }"
            :title="item.label"
            @click="handleItemClick(item, index)">
            <i v-if="item.icon" :class="'bi ' + item.icon"></i>
            <i v-else class="bi bi-three-dots"></i>
            
            <!-- Submenu indicator -->
            <div v-if="item.submenu" class="submenu-indicator">
              <i class="bi bi-chevron-down"></i>
            </div>
            
            <!-- Submenu -->
            <div 
              v-if="item.submenu && currentSubmenu === index" 
              class="context-submenu grid-submenu">
              <div 
                v-for="(subItem, subIndex) in item.submenu"
                :key="subIndex"
                class="context-menu-icon-item"
                :title="subItem.label"
                @click.stop="handleSubItemClick(item, subItem)">
                <i v-if="subItem.icon" :class="'bi ' + subItem.icon"></i>
                <i v-else class="bi bi-three-dots"></i>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </teleport>
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
  emits: ['update:show', 'update:left', 'update:top'],
  data() {
    return {
      currentSubmenu: null
    };
  },
  mounted() {
    // Close context menu when clicking outside
    document.addEventListener('mousedown', this.closeMenu);
    
    // Prevent right-click menu from appearing when showing our custom menu
    if (this.show) {
      document.addEventListener('contextmenu', this.preventDefaultContextMenu);
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        // Only perform position adjustment when menu is shown
        this.$nextTick(() => {
          this.adjustPosition();
        });
        document.addEventListener('contextmenu', this.preventDefaultContextMenu);
      } else {
        document.removeEventListener('contextmenu', this.preventDefaultContextMenu);
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('mousedown', this.closeMenu);
    document.removeEventListener('contextmenu', this.preventDefaultContextMenu);
  },
  methods: {
    preventDefaultContextMenu(e) {
      e.preventDefault();
    },
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
    closeMenu(event) {
      // Don't close if clicking within the menu
      if (event && this.$el && this.$el.contains(event.target)) {
        return;
      }
      
      // If this was triggered by a contextmenu event, don't close immediately
      if (event && event.type === 'contextmenu') {
        return;
      }
      
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
  border-radius: 0.5rem;
  padding: 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1050;
  max-width: 220px;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.context-menu-header {
  padding: 0.25rem 0.5rem;
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
  border-bottom: 1px solid #eee;
  text-align: center;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.context-menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.context-menu-icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 0.4rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  background-color: #f8f9fa;
  border: 1px solid transparent;
}

.context-menu-icon-item:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.context-menu-icon-item:active {
  transform: translateY(0);
  box-shadow: none;
}

.context-menu-icon-item i {
  font-size: 1.1rem;
  color: #495057;
}

.context-menu-icon-item:hover i {
  color: #212529;
}

/* Submenu indicator */
.submenu-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 0.5rem;
  color: #6c757d;
}

.has-submenu {
  position: relative;
}

.grid-submenu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 0.75rem;
  z-index: 1060;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.2s ease-out;
}

/* Add tooltip functionality */
.context-menu-icon-item::after {
  content: attr(title);
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 1070;
  max-width: 150px;
  text-align: center;
}

.context-menu-icon-item:hover::after {
  opacity: 1;
}
</style> 