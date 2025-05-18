# ChatGPT UI Project Overview

## Introduction

The ChatGPT UI project is a Vue.js-based web application that replicates the interface and functionality of ChatGPT. It features a responsive design with a sidebar for navigation, chat organization capabilities, and persistent storage using SQLite.

## Project Architecture

### Frontend
- **Vue.js**: The core framework for building the user interface
- **Bootstrap 5**: For responsive layout and styling
- **Bootstrap Icons**: For icon elements throughout the interface

### Backend
- **Express.js**: API server for handling data operations
- **SQLite**: Database for persistent storage of chats, messages, and folders

## Key Features

1. **Chat Interface**
   - Message bubbles with user/assistant differentiation
   - Auto-resizing text input
   - Markdown rendering for messages

2. **Organization Features**
   - Sidebar for chat history navigation
   - Folder structure for organizing chats
   - Context menus for quick actions

3. **Responsive Design**
   - Mobile-friendly layout
   - Collapsible sidebar with hamburger menu toggle
   - Full-width interface adaptation

4. **Data Persistence**
   - SQLite database for storing conversations
   - Folder organization persistence
   - Chat history with timestamps

## Architecture Diagram

```
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│  Vue.js         │      │  Express.js     │
│  Frontend       │◄────►│  Backend        │
│                 │      │                 │
└─────────────────┘      └─────────┬───────┘
                                   │
                                   ▼
                         ┌─────────────────┐
                         │                 │
                         │  SQLite         │
                         │  Database       │
                         │                 │
                         └─────────────────┘
```

## Directory Structure

- `/src` - Vue.js frontend source code
  - `/components` - Vue components
  - `/services` - API and database services
  - `/assets` - Static assets
- `/public` - Public static files
- `/` (root) - Project configuration and server code 