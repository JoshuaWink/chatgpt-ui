import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PRIMARY_PORT = process.env.PORT || 3000;
const ALTERNATIVE_PORTS = [3001, 3002, 3003]; // Fallback ports

// Enable verbose mode for SQLite
const sqlite = sqlite3.verbose();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],  // Allow all Vue dev server ports
  credentials: true
}));
app.use(express.json());

// Create and connect to SQLite database
const db = new sqlite.Database('./chatgpt-ui.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    
    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE SET NULL
      );
      
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        folder_id INTEGER NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
      );
      
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        is_user BOOLEAN NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
      );
    `);
    
    // Create default 'Uncategorized' folder if not exists
    db.run(`
      INSERT OR IGNORE INTO folders (id, name, parent_id) VALUES (1, 'Uncategorized', NULL)
    `);
  }
});

// Serve static files (in production)
app.use(express.static(join(__dirname, 'dist')));

// API Routes

// Get all folders
app.get('/api/folders', (req, res) => {
  db.all('SELECT * FROM folders ORDER BY parent_id NULLS FIRST, name', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a folder
app.post('/api/folders', (req, res) => {
  const { name, parent_id } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Folder name is required' });
    return;
  }
  
  db.run('INSERT INTO folders (name, parent_id) VALUES (?, ?)', [name, parent_id || null], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, parent_id: parent_id || null });
  });
});

// Update a folder
app.put('/api/folders/:id', (req, res) => {
  const { id } = req.params;
  const { name, parent_id } = req.body;
  
  // Validate input
  if (!name) {
    res.status(400).json({ error: 'Folder name is required' });
    return;
  }
  
  // Don't allow setting parent to itself or non-existent folder
  if (parent_id) {
    if (parseInt(parent_id) === parseInt(id)) {
      res.status(400).json({ error: 'Folder cannot be its own parent' });
      return;
    }
    
    // Check if parent exists
    db.get('SELECT id FROM folders WHERE id = ?', [parent_id], (err, row) => {
      if (err || !row) {
        res.status(400).json({ error: 'Parent folder does not exist' });
        return;
      }
      
      // Check for circular references
      let potentialParentId = parent_id;
      let hasCircular = false;
      
      const checkCircular = (callback) => {
        db.get('SELECT parent_id FROM folders WHERE id = ?', [potentialParentId], (err, row) => {
          if (err || !row || !row.parent_id) {
            callback(false);
            return;
          }
          
          if (parseInt(row.parent_id) === parseInt(id)) {
            callback(true);
            return;
          }
          
          potentialParentId = row.parent_id;
          checkCircular(callback);
        });
      };
      
      checkCircular((isCircular) => {
        if (isCircular) {
          res.status(400).json({ error: 'Circular folder reference detected' });
          return;
        }
        
        // Update the folder
        updateFolder();
      });
    });
  } else {
    // No parent_id, safe to update
    updateFolder();
  }
  
  function updateFolder() {
    db.run('UPDATE folders SET name = ?, parent_id = ? WHERE id = ?', [name, parent_id, id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Folder not found' });
        return;
      }
      
      res.json({ id: parseInt(id), name, parent_id });
    });
  }
});

// Delete a folder
app.delete('/api/folders/:id', (req, res) => {
  const id = req.params.id;
  
  // Don't allow deleting the Uncategorized folder
  if (id === '1') {
    res.status(400).json({ error: 'Cannot delete the Uncategorized folder' });
    return;
  }
  
  // First move all chats to Uncategorized
  db.run('UPDATE chats SET folder_id = 1 WHERE folder_id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Then delete the folder
    db.run('DELETE FROM folders WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Folder not found' });
        return;
      }
      
      res.json({ success: true, id });
    });
  });
});

// Get all chats
app.get('/api/chats', (req, res) => {
  db.all('SELECT * FROM chats ORDER BY updated_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get chats by folder
app.get('/api/folders/:id/chats', (req, res) => {
  const folderId = req.params.id;
  
  db.all('SELECT * FROM chats WHERE folder_id = ? ORDER BY updated_at DESC', [folderId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a chat
app.post('/api/chats', (req, res) => {
  const { title, folder_id = 1 } = req.body;
  
  if (!title) {
    res.status(400).json({ error: 'Chat title is required' });
    return;
  }
  
  db.run(
    'INSERT INTO chats (title, folder_id) VALUES (?, ?)',
    [title, folder_id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        id: this.lastID,
        title,
        folder_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  );
});

// Update a chat
app.put('/api/chats/:id', (req, res) => {
  const id = req.params.id;
  const { title, folder_id } = req.body;
  
  if (!title && !folder_id) {
    res.status(400).json({ error: 'Nothing to update' });
    return;
  }
  
  const params = [];
  const updateParts = [];
  
  if (title) {
    updateParts.push('title = ?');
    params.push(title);
  }
  
  if (folder_id) {
    updateParts.push('folder_id = ?');
    params.push(folder_id);
  }
  
  updateParts.push('updated_at = CURRENT_TIMESTAMP');
  
  params.push(id);
  
  db.run(
    `UPDATE chats SET ${updateParts.join(', ')} WHERE id = ?`,
    params,
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Chat not found' });
        return;
      }
      
      db.get('SELECT * FROM chats WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json(row);
      });
    }
  );
});

// Delete a chat
app.delete('/api/chats/:id', (req, res) => {
  const id = req.params.id;
  
  // First delete all messages
  db.run('DELETE FROM messages WHERE chat_id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Then delete the chat
    db.run('DELETE FROM chats WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Chat not found' });
        return;
      }
      
      res.json({ success: true, id });
    });
  });
});

// Get all messages for a chat
app.get('/api/chats/:id/messages', (req, res) => {
  const chatId = req.params.id;
  
  db.all(
    'SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp',
    [chatId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Add a message to a chat
app.post('/api/chats/:id/messages', (req, res) => {
  const chatId = req.params.id;
  const { content, is_user } = req.body;
  
  if (!content) {
    res.status(400).json({ error: 'Message content is required' });
    return;
  }
  
  if (is_user === undefined) {
    res.status(400).json({ error: 'is_user field is required' });
    return;
  }
  
  db.run(
    'INSERT INTO messages (chat_id, content, is_user) VALUES (?, ?, ?)',
    [chatId, content, is_user ? 1 : 0],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Update the chat's updated_at timestamp
      db.run(
        'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [chatId]
      );
      
      res.json({
        id: this.lastID,
        chat_id: chatId,
        content,
        is_user,
        timestamp: new Date().toISOString()
      });
    }
  );
});

// Clear all messages for a chat
app.delete('/api/chats/:id/messages', (req, res) => {
  const chatId = req.params.id;
  
  db.run('DELETE FROM messages WHERE chat_id = ?', [chatId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ success: true, chat_id: chatId });
  });
});

// SPA Fallback - Serve index.html for all other routes (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Start server with port fallback
function startServer(port) {
  const server = http.createServer(app);
  
  server.listen(port);
  
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is already in use, trying another...`);
      if (ALTERNATIVE_PORTS.length > 0) {
        const nextPort = ALTERNATIVE_PORTS.shift();
        startServer(nextPort);
      } else {
        console.error('All ports are in use. Please free up a port and try again.');
        process.exit(1);
      }
    } else {
      console.error('Server error:', e);
      process.exit(1);
    }
  });
  
  server.on('listening', () => {
    const actualPort = server.address().port;
    console.log(`Server running on port ${actualPort}`);
    
    // Update CORS settings with the actual port
    app.use(cors({
      origin: [
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://localhost:5175',
        `http://localhost:${actualPort}`
      ],
      credentials: true
    }));
  });
}

// Start the server
startServer(PRIMARY_PORT);

// Handle shutdown and close database connection
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
}); 