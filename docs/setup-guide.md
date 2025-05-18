# Setup Guide

This guide provides instructions for setting up the ChatGPT UI application for development and production use.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chatgpt-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development Environment

The application consists of two parts:
1. Vue.js frontend
2. Express.js backend API

For development, both the frontend and backend servers need to be running simultaneously.

### Using the Combined Dev Script

The easiest way to run both servers is with the provided development script:

```bash
npm run dev-full
```

This script:
- Starts the Vue.js development server on port 5173
- Starts the Express.js API server on port 3000
- Watches for changes in both frontend and backend files
- Restarts servers as needed

### Running Servers Separately

Alternatively, you can run the servers in separate terminals:

**Frontend (Vue.js)**:
```bash
npm run dev
```
This starts the Vue.js development server at http://localhost:5173.

**Backend (Express.js)**:
```bash
node server.js
```
This starts the Express.js API server at http://localhost:3000.

## Project Structure

- `/src` - Vue.js frontend source code
  - `/components` - Vue components
  - `/services` - API and database services
  - `/assets` - Static assets
- `/public` - Public static files
- `server.js` - Express.js API server
- `dev.js` - Combined development script
- `chatgpt-ui.db` - SQLite database file (created on first run)

## Configuration

### Frontend Configuration

Frontend configuration is in `vite.config.js`. You can configure:
- Development server settings
- Build output options
- Plugins and extensions

### Backend Configuration

Backend configuration is in `server.js`. You can configure:
- API port (default: 3000)
- CORS settings
- Database connection

The port can also be set using the `PORT` environment variable:
```bash
PORT=4000 node server.js
```

## Database

The application uses SQLite for data storage. The database file (`chatgpt-ui.db`) is automatically created in the project root directory when the server starts.

No additional database setup is required. To reset the database, simply delete the `chatgpt-ui.db` file and restart the server.

## Building for Production

To build the application for production:

1. Build the Vue.js frontend:
   ```bash
   npm run build
   ```
   This creates a `dist` directory with optimized production files.

2. Start the production server:
   ```bash
   node server.js
   ```
   The Express.js server will serve both the API and the static frontend files from the `dist` directory.

## Deployment

For deployment to a production environment:

1. Copy all project files to your server
2. Install production dependencies:
   ```bash
   npm install --production
   ```
3. Build the frontend:
   ```bash
   npm run build
   ```
4. Start the server:
   ```bash
   node server.js
   ```

For a more robust production setup, consider using:
- PM2 for process management
- NGINX as a reverse proxy
- SSL certificates for HTTPS
- Environment variables for configuration

## Troubleshooting

### Common Issues

**"require is not defined" error**:
- This is due to ES modules vs CommonJS modules. The project uses ES modules.
- Make sure "type": "module" is in your package.json.
- Use import/export syntax instead of require/module.exports.

**SQLite errors**:
- Ensure you have appropriate permissions for creating/writing to the database file.
- Check for syntax errors in SQL queries.

**CORS errors**:
- The API server has CORS configured, but you may need to adjust settings for specific deployment environments.
- Check CORS configuration in server.js if you're experiencing cross-origin issues. 