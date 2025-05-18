# Components Documentation

This directory contains documentation for the Vue.js components used in the ChatGPT UI application.

## Core Components

### ChatWindow.vue

The main container for displaying the chat interface, including messages and input field.

- **Props**:
  - `activeChat`: The currently active chat object
  - `messages`: Array of messages to display
  
- **Events**:
  - `send-message`: Emitted when a message is sent
  
- **Features**:
  - Scrollable message container
  - Auto-scroll to bottom on new messages
  - Empty state display
  - Message grouping by sender

### ChatMessage.vue

Displays an individual chat message with appropriate styling based on whether it's from the user or assistant.

- **Props**:
  - `message`: The message object to display
  - `isUser`: Boolean indicating if the message is from the user
  
- **Features**:
  - Different styling for user vs. assistant messages
  - Timestamp display
  - Support for markdown content (future enhancement)

### ChatInput.vue

Provides a text input field for entering messages.

- **Props**:
  - `disabled`: Boolean to disable the input
  
- **Events**:
  - `send`: Emitted when the user submits a message
  
- **Features**:
  - Auto-resizing text area
  - Submit on Enter key (Shift+Enter for new line)
  - Character limit display
  - Empty input validation

## Navigation Components

### Sidebar.vue

Displays the folder structure and chat history for navigation.

- **Props**:
  - `folders`: Array of folder objects
  - `chats`: Array of chat objects
  - `activeChat`: The currently active chat
  
- **Events**:
  - `folder-selected`: Emitted when a folder is selected
  - `chat-selected`: Emitted when a chat is selected
  - `create-chat`: Emitted when a new chat is created
  
- **Features**:
  - Collapsible folder structure
  - Visual indication of active chat
  - Toggle for mobile view
  - Context menu for chat and folder actions

## UI Components

### ContextMenu.vue

A reusable right-click context menu component.

- **Props**:
  - `show`: Boolean to control visibility
  - `x`: X-coordinate for positioning
  - `y`: Y-coordinate for positioning
  - `items`: Array of menu items to display
  
- **Events**:
  - `select`: Emitted when a menu item is selected
  - `close`: Emitted when the menu is closed
  
- **Features**:
  - Dynamic positioning
  - Customizable menu items
  - Auto-close on outside click
  - Keyboard navigation

### FolderDialog.vue

Modal dialog for creating or editing folders.

- **Props**:
  - `show`: Boolean to control visibility
  - `folder`: Folder object for editing (optional)
  
- **Events**:
  - `save`: Emitted when a folder is saved
  - `cancel`: Emitted when the dialog is canceled
  
- **Features**:
  - Create new folders
  - Edit existing folders
  - Input validation
  - Keyboard shortcuts

## Icons

The `icons/` directory contains custom icon components used throughout the application.

- **AddIcon.vue**: Plus icon for adding new items
- **EditIcon.vue**: Pencil icon for editing
- **DeleteIcon.vue**: Trash icon for deletion
- **FolderIcon.vue**: Folder icon for navigation
- **ChatIcon.vue**: Chat bubble icon for conversations

## Component Interactions

The components interact through a hierarchical structure:

1. **App.vue** (Root)
   - Contains the main application layout
   - Manages global state (active chat, folders, etc.)
   - Handles API communication through services

2. **Sidebar.vue** (Navigation)
   - Displays folders and chats
   - Emits events to App.vue for selection changes
   - Opens context menu for actions

3. **ChatWindow.vue** (Content)
   - Displays messages for the active chat
   - Contains ChatInput for new messages
   - Handles message submission

This structure allows for clean separation of concerns while maintaining efficient communication between components. 