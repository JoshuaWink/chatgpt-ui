# Database Schema Documentation

The ChatGPT UI application uses SQLite for data persistence. This document outlines the database structure, tables, relationships, and key fields.

## Database Overview

The database (`chatgpt-ui.db`) is a SQLite file-based database located in the root directory of the project. It contains three main tables:

1. `folders` - For organizing chats into categories
2. `chats` - For storing individual chat sessions
3. `messages` - For storing the messages within each chat

## Table Definitions

### Folders Table

Stores categories for organizing chats.

```sql
CREATE TABLE IF NOT EXISTS folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-incrementing |
| name | TEXT | Name of the folder |
| created_at | DATETIME | When the folder was created |

**Notes:**
- A default "Uncategorized" folder (id=1) is automatically created when the database is initialized.
- This folder cannot be deleted and serves as the default location for chats.

### Chats Table

Stores chat sessions and their metadata.

```sql
CREATE TABLE IF NOT EXISTS chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  folder_id INTEGER NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);
```

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-incrementing |
| title | TEXT | Title of the chat |
| folder_id | INTEGER | Foreign key to folders table (nullable) |
| created_at | DATETIME | When the chat was created |
| updated_at | DATETIME | When the chat was last updated |

**Notes:**
- If a folder is deleted, the chat's `folder_id` is set to NULL, then reassigned to the "Uncategorized" folder (id=1).
- `updated_at` is updated whenever a new message is added to the chat.

### Messages Table

Stores individual messages within chats.

```sql
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);
```

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-incrementing |
| chat_id | INTEGER | Foreign key to chats table |
| content | TEXT | The message content |
| is_user | BOOLEAN | Whether the message is from the user (true) or assistant (false) |
| timestamp | DATETIME | When the message was created |

**Notes:**
- When a chat is deleted, all associated messages are also deleted (CASCADE).
- `is_user` is stored as 1 (true) or 0 (false) in SQLite.

## Entity Relationship Diagram

```
┌───────────┐     ┌──────────┐     ┌────────────┐
│           │     │          │     │            │
│  folders  │◄────┤  chats   │◄────┤  messages  │
│           │  1:n│          │  1:n│            │
└───────────┘     └──────────┘     └────────────┘
```

## Database Initialization

The database is initialized in `server.js` when the Express server starts. If the database file doesn't exist, it's created automatically. The tables are created if they don't already exist, and a default "Uncategorized" folder is created.

## Data Operations

All database operations are handled through the Express.js API, which provides endpoints for:

- Creating, reading, updating, and deleting folders
- Creating, reading, updating, and deleting chats
- Adding, retrieving, and clearing messages within chats

For detailed implementation of these operations, refer to the API documentation. 