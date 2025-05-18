# Technical Documentation

This document provides detailed technical information about the ChatGPT UI application, including its architecture, technologies, design patterns, and implementation details.

## Technology Stack

### Frontend
- **Vue.js**: JavaScript framework for building user interfaces
- **Vite**: Build tool and development server
- **Bootstrap 5**: CSS framework for responsive design
- **Bootstrap Icons**: Icon library
- **Fetch API**: For making HTTP requests to the backend

### Backend
- **Express.js**: Web application framework for Node.js
- **SQLite3**: Embedded relational database
- **CORS**: Cross-Origin Resource Sharing middleware
- **ES Modules**: Modern JavaScript module system

## Architecture

The application follows a client-server architecture:

1. **Client (Frontend)**
   - Single-page application built with Vue.js
   - Communicates with the backend via RESTful API
   - Handles UI rendering, state management, and user interactions

2. **Server (Backend)**
   - Express.js API server
   - Handles data storage and retrieval via SQLite
   - Provides RESTful endpoints for CRUD operations
   - Serves static files in production

3. **Database**
   - SQLite file-based database
   - Stores folders, chats, and messages
   - Maintains relationships between entities

## Design Patterns and Principles

### Frontend

1. **Component-Based Architecture**
   - UI is divided into reusable Vue components
   - Each component has a specific responsibility
   - Components communicate via props and events

2. **Service Layer**
   - API calls are abstracted into service modules
   - Services handle data fetching, processing, and error handling

3. **Event-Driven Communication**
   - Components emit events that bubble up to parent components
   - Parent components handle events and update state accordingly

4. **Responsive Design**
   - Bootstrap grid system for layout
   - Media queries for different screen sizes
   - Flexible components that adapt to container size

### Backend

1. **MVC-like Pattern**
   - Route handlers as controllers
   - SQLite queries as model operations
   - JSON responses as views

2. **RESTful API Design**
   - Resources are represented as URLs
   - HTTP methods represent operations (GET, POST, PUT, DELETE)
   - Consistent response structure

3. **Data Access Layer**
   - SQL queries encapsulated in API route handlers
   - Data validation and error handling

4. **Error Handling**
   - Consistent error response format
   - Appropriate HTTP status codes
   - Error logging

## Key Implementation Details

### Chat Interface

The chat interface consists of several components:
- `ChatWindow.vue`: Container for chat messages and input
- `ChatMessage.vue`: Individual message display
- `ChatInput.vue`: User input field with auto-resizing

Messages are displayed chronologically with visual distinction between user and assistant messages. The input field automatically resizes based on content.

### Sidebar and Navigation

The sidebar provides chat organization and navigation:
- `Sidebar.vue`: Main sidebar component
- Toggle functionality for mobile view
- Folder structure with expand/collapse
- Right-click context menu for actions

### Context Menu System

The application implements a custom context menu:
- `ContextMenu.vue`: Reusable context menu component
- Dynamically positioned at mouse coordinates
- Customizable menu items based on context
- Event handlers for menu actions

### Database Interactions

Database operations are handled through Express.js API routes:
- CRUD operations for folders, chats, and messages
- Cascading deletes for related records
- Default folder handling
- Timestamp management

## Code Organization

### Frontend Structure

- `src/components/`: Vue components
- `src/services/`: API and database services
- `src/assets/`: Static assets (images, stylesheets)
- `src/main.js`: Application entry point
- `src/App.vue`: Root component

### Backend Structure

- `server.js`: Express server and API endpoints
- `dev.js`: Development server setup
- `chatgpt-ui.db`: SQLite database

## Performance Considerations

- SQLite queries are optimized with appropriate indices
- Frontend uses lazy loading where appropriate
- Message rendering optimized for large chat histories
- API responses are kept minimal and focused

## Security Considerations

- Input validation on API endpoints
- SQL query parameterization to prevent injection
- No sensitive data stored in the current implementation
- CORS configured for API access control

## Future Technical Improvements

- Implement user authentication and authorization
- Add real-time updates with WebSockets
- Implement message pagination for better performance with large chats
- Add caching layer for frequently accessed data
- Enhance error handling and recovery
- Implement automated testing with Jest or Vitest 