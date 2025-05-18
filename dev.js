import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the Vue.js dev server
const vueProcess = spawn('npm', ['run', 'dev'], {
  shell: true,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: 5173
  }
});

// Start the Express API server
const expressProcess = spawn('node', ['server.js'], {
  shell: true,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: 3000
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down development servers...');
  vueProcess.kill('SIGINT');
  expressProcess.kill('SIGINT');
  process.exit(0);
});

// Handle child process errors
vueProcess.on('error', (error) => {
  console.error('Vue dev server error:', error);
});

expressProcess.on('error', (error) => {
  console.error('Express server error:', error);
});

console.log('Development servers started:');
console.log('- Vue.js dev server: http://localhost:5173');
console.log('- Express API server: http://localhost:3000');
console.log('Press Ctrl+C to stop both servers.'); 