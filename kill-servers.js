#!/usr/bin/env node

import { exec } from 'child_process';
import { platform } from 'os';
import { promisify } from 'util';

const execPromise = promisify(exec);
const PORTS = [3000, 3001, 3002, 3003, 5173, 5174, 5175];
const isWindows = platform() === 'win32';

// Track how many processes we have to kill
let pendingKills = 0;
let completedKills = 0;

function checkCompletion() {
  if (pendingKills === 0 || completedKills === pendingKills) {
    console.log('\nPort check complete. You can now start your development servers.');
    process.exit(0);
  }
}

// Timeout to make sure we don't hang forever
setTimeout(() => {
  console.log('\nTimeout reached. Some processes may still be running.');
  console.log('Port check complete. You can now start your development servers.');
  process.exit(0);
}, 5000);

async function findAndKillProcesses() {
  console.log('Looking for processes using our development ports...');
  
  for (const port of PORTS) {
    let command;
    
    if (isWindows) {
      // Windows command to find and kill process by port
      command = `netstat -ano | findstr :${port} | findstr LISTENING`;
    } else {
      // macOS/Linux command
      command = `lsof -i :${port} -t`;
    }
    
    try {
      const { stdout } = await execPromise(command);
      const pids = stdout.trim().split('\n').filter(pid => pid);
      
      if (pids.length === 0) {
        console.log(`✓ Port ${port} is free`);
        continue;
      }
      
      pendingKills += pids.length;
      
      // Extract PID and kill it
      for (let pidLine of pids) {
        let pid;
        
        if (isWindows) {
          // Extract PID from netstat output
          const match = pidLine.match(/LISTENING\s+(\d+)/);
          if (match && match[1]) {
            pid = match[1];
          }
        } else {
          // On macOS/Linux, lsof -t already gives us the PID
          pid = pidLine;
        }
        
        if (pid) {
          const killCommand = isWindows ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
          
          try {
            await execPromise(killCommand);
            console.log(`✓ Killed process ${pid} on port ${port}`);
            completedKills++;
            checkCompletion();
          } catch (killError) {
            console.error(`✗ Failed to kill process ${pid} on port ${port}: ${killError.message}`);
            completedKills++;
            checkCompletion();
          }
        }
      }
    } catch (err) {
      // No process found on this port, which is good
      console.log(`✓ Port ${port} is free`);
    }
  }
  
  // If we didn't find any processes to kill
  if (pendingKills === 0) {
    console.log('\nAll ports are already free.');
    checkCompletion();
  }
}

// Run the function
findAndKillProcesses(); 