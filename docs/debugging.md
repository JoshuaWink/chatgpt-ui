# Debugging Guide: Blank Page Issue

This document outlines steps to debug the blank page issue when loading the ChatGPT UI application.

## Issue Description

When navigating to the application in the browser, a blank page is displayed with no visible content. This suggests that either:
1. The JavaScript is failing to execute properly
2. The initial API calls are failing and preventing the UI from rendering
3. There's a configuration issue affecting the build process

## Common Issues and Solutions

### 1. Vue Lifecycle Hook Misuse

**Symptom**: Console warning like `[Vue warn]: onMounted is called when there is no active component instance to be associated with.`

**Problem**: Vue lifecycle hooks like `onMounted` are being used outside of component setup functions, such as in service modules.

**Solution**: 
1. Remove `onMounted` from service modules
2. Replace with regular functions that can be called during component mounting:

```diff
- import { ref, onMounted } from 'vue';
+ import { ref } from 'vue';

- onMounted(async () => {
+ const initializeData = async () => {
    // initialization code
- });
+ };

+ export { initializeData };
```

Then call this function from a component's setup/onMounted:

```javascript
onMounted(async () => {
  await initializeData();
});
```

### 2. Express.js Dependency Issues

**Symptom**: Server errors with `path-to-regexp` like: `TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError`

**Problem**: Using Express.js v5 (alpha) which may have dependency issues.

**Solution**: Downgrade to Express.js v4.18.2:
```bash
npm install express@4.18.2
```

### 3. API Connection Issues

**Problem**: Frontend can't connect to backend API.

**Solution**: See below in the original debugging steps.

## Original Debugging Steps

### 1. Check Browser Console

First, open your browser's developer tools (F12 or Right-click > Inspect) and look at the Console tab for any error messages. Common errors might include:

- JavaScript syntax errors
- Network connection errors to the API
- Missing dependencies
- CORS issues

### 2. Verify Both Servers Are Running

Ensure both the frontend and backend servers are running:
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
node server.js
```

Confirm the backend is accessible by opening http://localhost:3000/api/folders in your browser. You should see a JSON response.

### 3. Check API Connection

Look for network errors in the developer tools' Network tab:
1. Reload the page with the Network tab open
2. Look for failed API requests (in red)
3. Check if requests to `/api/folders` and `/api/chats` are failing

### 4. Examine CORS Configuration

If there are CORS errors, verify the CORS settings in `server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
```

The CORS configuration should allow requests from the frontend domain.

### 5. Verify SQLite Database

Make sure the SQLite database is properly initialized:
1. Check if `chatgpt-ui.db` exists in the project root
2. If not, the server should create it, but verify there are no permission issues

### 6. Test with Dev-Full Script

Try running both servers together with the dev-full script:
```bash
npm run dev-full
```

### 7. Modify API URL Configuration

Check the API URL configuration in `src/services/api.js`:
```javascript
const API_URL = 'http://localhost:3000';
```

### 8. Try Disabling Initial API Calls

Temporarily modify `App.vue` or `database.js` to return static data instead of making API calls, to see if the UI renders without API dependency.

## Next Steps After Fixing

After resolving the issue:
1. Document the root cause and solution in `progress-log.md`
2. Add any necessary updates to the project documentation
3. Consider adding error boundaries to prevent similar issues in the future 