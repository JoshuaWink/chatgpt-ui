// Simple test script to verify API connectivity
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';

async function testApiConnection() {
  try {
    console.log('Testing API connection...');
    
    // Test folders endpoint
    console.log('Testing /api/folders endpoint...');
    const foldersResponse = await fetch(`${API_URL}/api/folders`);
    if (!foldersResponse.ok) {
      throw new Error(`Folders API request failed with status ${foldersResponse.status}`);
    }
    const folders = await foldersResponse.json();
    console.log('Folders API Response:', folders);
    
    // Test chats endpoint
    console.log('\nTesting /api/chats endpoint...');
    const chatsResponse = await fetch(`${API_URL}/api/chats`);
    if (!chatsResponse.ok) {
      throw new Error(`Chats API request failed with status ${chatsResponse.status}`);
    }
    const chats = await chatsResponse.json();
    console.log('Chats API Response:', chats);
    
    console.log('\nAPI connection test completed successfully!');
  } catch (error) {
    console.error('API connection test failed:', error.message);
  }
}

testApiConnection(); 