# API Documentation

This document describes the RESTful API endpoints provided by the Express.js backend server for the ChatGPT UI application.

## Base URL

All API endpoints are relative to:
```
http://localhost:3000/api
```

## Folder Endpoints

### Get All Folders

Retrieves all folders.

- **URL**: `/folders`
- **Method**: `GET`
- **Response**: Array of folder objects
  ```json
  [
    {
      "id": 1,
      "name": "Uncategorized",
      "created_at": "2023-06-01T12:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Work",
      "created_at": "2023-06-02T14:30:00.000Z"
    }
  ]
  ```

### Create Folder

Creates a new folder.

- **URL**: `/folders`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "name": "Personal"
  }
  ```
- **Response**: The created folder object
  ```json
  {
    "id": 3,
    "name": "Personal"
  }
  ```

### Update Folder

Updates an existing folder.

- **URL**: `/folders/:id`
- **Method**: `PUT`
- **Parameters**: `id` - Folder ID
- **Body**: 
  ```json
  {
    "name": "Updated Name"
  }
  ```
- **Response**: The updated folder object
  ```json
  {
    "id": 2,
    "name": "Updated Name"
  }
  ```

### Delete Folder

Deletes a folder and moves its chats to the Uncategorized folder.

- **URL**: `/folders/:id`
- **Method**: `DELETE`
- **Parameters**: `id` - Folder ID
- **Response**: Success message
  ```json
  {
    "success": true,
    "id": "2"
  }
  ```
- **Note**: The Uncategorized folder (ID 1) cannot be deleted.

## Chat Endpoints

### Get All Chats

Retrieves all chats.

- **URL**: `/chats`
- **Method**: `GET`
- **Response**: Array of chat objects
  ```json
  [
    {
      "id": 1,
      "title": "First Chat",
      "folder_id": 1,
      "created_at": "2023-06-05T10:00:00.000Z",
      "updated_at": "2023-06-05T11:30:00.000Z"
    }
  ]
  ```

### Get Chats by Folder

Retrieves all chats in a specific folder.

- **URL**: `/folders/:id/chats`
- **Method**: `GET`
- **Parameters**: `id` - Folder ID
- **Response**: Array of chat objects
  ```json
  [
    {
      "id": 2,
      "title": "Work Chat",
      "folder_id": 2,
      "created_at": "2023-06-06T09:00:00.000Z",
      "updated_at": "2023-06-06T10:15:00.000Z"
    }
  ]
  ```

### Create Chat

Creates a new chat.

- **URL**: `/chats`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "title": "New Chat",
    "folder_id": 2
  }
  ```
- **Response**: The created chat object
  ```json
  {
    "id": 3,
    "title": "New Chat",
    "folder_id": 2,
    "created_at": "2023-06-07T14:00:00.000Z",
    "updated_at": "2023-06-07T14:00:00.000Z"
  }
  ```
- **Note**: If `folder_id` is not provided, the chat will be created in the Uncategorized folder (ID 1).

### Update Chat

Updates a chat's title or folder.

- **URL**: `/chats/:id`
- **Method**: `PUT`
- **Parameters**: `id` - Chat ID
- **Body**: 
  ```json
  {
    "title": "Updated Chat Title",
    "folder_id": 3
  }
  ```
- **Response**: The updated chat object
  ```json
  {
    "id": 2,
    "title": "Updated Chat Title",
    "folder_id": 3,
    "created_at": "2023-06-06T09:00:00.000Z",
    "updated_at": "2023-06-08T15:45:00.000Z"
  }
  ```

### Delete Chat

Deletes a chat and all its messages.

- **URL**: `/chats/:id`
- **Method**: `DELETE`
- **Parameters**: `id` - Chat ID
- **Response**: Success message
  ```json
  {
    "success": true,
    "id": "2"
  }
  ```

## Message Endpoints

### Get Messages for Chat

Retrieves all messages in a specific chat.

- **URL**: `/chats/:id/messages`
- **Method**: `GET`
- **Parameters**: `id` - Chat ID
- **Response**: Array of message objects
  ```json
  [
    {
      "id": 1,
      "chat_id": 1,
      "content": "Hello, how can I help you today?",
      "is_user": 0,
      "timestamp": "2023-06-05T10:05:00.000Z"
    },
    {
      "id": 2,
      "chat_id": 1,
      "content": "I need help with a coding problem.",
      "is_user": 1,
      "timestamp": "2023-06-05T10:06:00.000Z"
    }
  ]
  ```

### Add Message to Chat

Adds a new message to a chat.

- **URL**: `/chats/:id/messages`
- **Method**: `POST`
- **Parameters**: `id` - Chat ID
- **Body**: 
  ```json
  {
    "content": "This is a new message",
    "is_user": true
  }
  ```
- **Response**: The created message object
  ```json
  {
    "id": 3,
    "chat_id": 1,
    "content": "This is a new message",
    "is_user": true,
    "timestamp": "2023-06-05T11:30:00.000Z"
  }
  ```
- **Note**: This also updates the chat's `updated_at` timestamp.

### Clear Chat Messages

Deletes all messages in a chat.

- **URL**: `/chats/:id/messages`
- **Method**: `DELETE`
- **Parameters**: `id` - Chat ID
- **Response**: Success message
  ```json
  {
    "success": true,
    "chat_id": "1"
  }
  ```

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses include a descriptive message:

```json
{
  "error": "Folder not found"
}
```

## Authentication

The current API implementation does not include authentication. All endpoints are publicly accessible. 