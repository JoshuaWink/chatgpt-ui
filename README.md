# ChatGPT UI

A simple ChatGPT-inspired UI built with Vue.js and Bootstrap 5.

## Features

- Clean, responsive design using Bootstrap 5
- Message bubbles for user and assistant messages
- Auto-resizing text input
- Simulated AI responses
- Modern UI with avatar icons
- Sidebar with chat history
- Fully responsive (mobile and desktop support)
- Multiple chat conversations
- Folder organization for chats
- SQLite database for persistent storage
- Right-click context menus for chat management

## Screenshots

Simulated chat interface:

![ChatGPT UI Interface](./screenshot.png)

## Project Setup

```sh
# Install dependencies
npm install

# For development (runs both frontend and backend)
npm run dev-full

# Or run them separately:
# Frontend development server
npm run dev

# Backend API server (in a separate terminal)
node server.js

# For production build
npm run build
node server.js
```

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Project Overview](./docs/project-overview.md) - Introduction and architecture overview
- [Development Timeline](./docs/development-timeline.md) - Project phases and milestones
- [Technical Documentation](./docs/technical-documentation.md) - Technical details and implementation
- [Component Documentation](./docs/components/README.md) - Documentation for Vue components
- [API Documentation](./docs/api-documentation.md) - Backend API endpoints and usage
- [Database Schema](./docs/database-schema.md) - SQLite database structure
- [Setup Guide](./docs/setup-guide.md) - Installation and development setup
- [Contributing Guide](./docs/contributing-guide.md) - Guidelines for contributors
- [Progress Log](./docs/progress-log.md) - Running development log with current status
- [Chat Deletion](./docs/chat-deletion.md) - Detailed information about chat deletion functionality

## Technologies Used

- Vue.js 3
- Bootstrap 5
- Bootstrap Icons
- SQLite for persistent storage
- Express.js for the backend API

## Folder Organization

This application supports organizing chats into folders:

1. Create new folders using the "+" icon in the Folders section
2. Right-click on any chat to move it to a specific folder
3. Navigate between folders in the sidebar
4. Right-click on folders to edit or delete them

## Customization

You can customize the UI by modifying the following components:

- `App.vue` - Main application layout and state management
- `ChatWindow.vue` - The main chat interface
- `ChatMessage.vue` - Individual message styling
- `ChatInput.vue` - The message input area
- `Sidebar.vue` - Chat history sidebar with folder support
- `ContextMenu.vue` - Right-click menu implementation
- `FolderDialog.vue` - Dialog for creating/editing folders

## Extending Functionality

To connect this UI to a real AI API:

1. Modify the `simulateResponse` method in `ChatWindow.vue`
2. Replace the setTimeout with a fetch/axios call to your backend
3. Process the response and add it to the messages array
4. Database storage is already implemented with SQLite

## Database Schema

The application uses a SQLite database with the following structure:

- **folders**: Store folder metadata
  - id, name, created_at
- **chats**: Store chat information
  - id, title, folder_id, created_at, updated_at
- **messages**: Store individual messages
  - id, chat_id, content, is_user, timestamp

For more detailed schema information, see the [Database Schema](./docs/database-schema.md) documentation.

## Project Status

The current development status and ongoing work is tracked in our [Progress Log](./docs/progress-log.md). Check there for the latest updates and planned features.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./docs/contributing-guide.md) for more information.

## License

MIT
