const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Job sites table
  db.run(`CREATE TABLE IF NOT EXISTS job_sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tasks table
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    job_site_id INTEGER,
    assigned_user_id INTEGER,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    due_date DATETIME,
    estimated_hours INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_site_id) REFERENCES job_sites(id),
    FOREIGN KEY (assigned_user_id) REFERENCES users(id)
  )`);

  // Task notes table
  db.run(`CREATE TABLE IF NOT EXISTS task_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    user_id INTEGER,
    note_text TEXT NOT NULL,
    note_type TEXT DEFAULT 'status_update',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // User job sites assignment table
  db.run(`CREATE TABLE IF NOT EXISTS user_job_sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    job_site_id INTEGER,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_site_id) REFERENCES job_sites(id)
  )`);

  // Create default admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, email, password, role) 
    VALUES (?, ?, ?, ?)`, ['admin', 'admin@ledstringers.com', hashedPassword, 'admin']);
  
  console.log('Database tables initialized');
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function to emit notifications
function notifyUser(userId, notification) {
  io.to(`user_${userId}`).emit('notification', notification);
}

function notifyAllAdmins(notification) {
  db.all('SELECT id FROM users WHERE role = ?', ['admin'], (err, admins) => {
    if (!err && admins) {
      admins.forEach(admin => {
        notifyUser(admin.id, notification);
      });
    }
  });
}

// Middleware for JWT authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      res.json({ token, user: { id: user.id, username: user.username, role: user.role, email: user.email } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password, role = 'user' } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, role],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'User already exists or invalid data' });
      }
      
      const token = jwt.sign(
        { id: this.lastID, username, role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.status(201).json({ 
        token, 
        user: { id: this.lastID, username, role, email } 
      });
    }
  );
});

// User routes
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all('SELECT id, username, email, role, created_at FROM users', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(users);
  });
});

app.get('/api/users/:id/job-sites', authenticateToken, (req, res) => {
  const userId = req.params.id;
  
  db.all(`SELECT js.* FROM job_sites js
    INNER JOIN user_job_sites ujs ON js.id = ujs.job_site_id
    WHERE ujs.user_id = ?`, [userId], (err, jobSites) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch user job sites' });
    }
    res.json(jobSites);
  });
});

// Job sites routes
app.post('/api/job-sites', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, address, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.run('INSERT INTO job_sites (name, address, description) VALUES (?, ?, ?)',
    [name, address, description],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create job site' });
      }
      res.status(201).json({ id: this.lastID, name, address, description });
    }
  );
});

app.get('/api/job-sites', authenticateToken, (req, res) => {
  db.all('SELECT * FROM job_sites ORDER BY created_at DESC', (err, jobSites) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch job sites' });
    }
    res.json(jobSites);
  });
});

app.put('/api/job-sites/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, address, description } = req.body;
  const jobId = req.params.id;

  db.run('UPDATE job_sites SET name = ?, address = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, address, description, jobId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update job site' });
      }
      res.json({ id: jobId, name, address, description });
    }
  );
});

app.delete('/api/job-sites/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.run('DELETE FROM job_sites WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete job site' });
    }
    res.json({ message: 'Job site deleted successfully' });
  });
});

// Assign users to job sites
app.post('/api/job-sites/:siteId/assign-user', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { userId } = req.body;
  const siteId = req.params.siteId;

  db.run('INSERT OR IGNORE INTO user_job_sites (user_id, job_site_id) VALUES (?, ?)',
    [userId, siteId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to assign user to job site' });
      }
      res.json({ message: 'User assigned to job site successfully' });
    }
  );
});

app.delete('/api/job-sites/:siteId/assign-user/:userId', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.run('DELETE FROM user_job_sites WHERE user_id = ? AND job_site_id = ?',
    [req.params.userId, req.params.siteId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to remove user from job site' });
      }
      res.json({ message: 'User removed from job site successfully' });
    }
  );
});

// Tasks routes
app.post('/api/tasks', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { title, description, job_site_id, assigned_user_id, priority, due_date, estimated_hours } = req.body;

  if (!title || !job_site_id || !assigned_user_id) {
    return res.status(400).json({ error: 'Title, job site, and assigned user are required' });
  }

  db.run(`INSERT INTO tasks (title, description, job_site_id, assigned_user_id, priority, due_date, estimated_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, job_site_id, assigned_user_id, priority, due_date, estimated_hours],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create task' });
      }

      // Notify the assigned user
      notifyUser(assigned_user_id, {
        type: 'new_task',
        message: `New task assigned: ${title}`,
        taskId: this.lastID
      });

      res.status(201).json({ 
        id: this.lastID, 
        title, 
        description, 
        job_site_id, 
        assigned_user_id, 
        status: 'pending',
        priority,
        due_date,
        estimated_hours
      });
    }
  );
});

app.get('/api/tasks', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { status, job_site_id } = req.query;

  let query = `
    SELECT t.*, js.name as job_site_name, u.username as assigned_user_name
    FROM tasks t
    LEFT JOIN job_sites js ON t.job_site_id = js.id
    LEFT JOIN users u ON t.assigned_user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (userRole !== 'admin') {
    query += ` AND t.assigned_user_id = ?`;
    params.push(userId);
  }

  if (status) {
    query += ` AND t.status = ?`;
    params.push(status);
  }

  if (job_site_id) {
    query += ` AND t.job_site_id = ?`;
    params.push(job_site_id);
  }

  query += ` ORDER BY t.created_at DESC`;

  db.all(query, params, (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(tasks);
  });
});

app.get('/api/tasks/:id', authenticateToken, (req, res) => {
  const taskId = req.params.id;

  db.get(`SELECT t.*, js.name as job_site_name, u.username as assigned_user_name
    FROM tasks t
    LEFT JOIN job_sites js ON t.job_site_id = js.id
    LEFT JOIN users u ON t.assigned_user_id = u.id
    WHERE t.id = ?`, [taskId], (err, task) => {
    if (err || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  });
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const taskId = req.params.id;
  const { status, title, description, priority, due_date, estimated_hours } = req.body;

  // Check if user has permission to update this task
  db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
    if (err || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.assigned_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const oldStatus = task.status;
    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (priority) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (due_date) {
      updates.push('due_date = ?');
      params.push(due_date);
    }
    if (estimated_hours) {
      updates.push('estimated_hours = ?');
      params.push(estimated_hours);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(taskId);

    db.run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update task' });
      }

      // Notify admins about status changes
      if (status && status !== oldStatus) {
        if (status === 'complete') {
          notifyAllAdmins({
            type: 'task_completed',
            message: `Task "${task.title}" has been completed`,
            taskId: taskId
          });
        } else if (status === 'needs_supplies') {
          notifyAllAdmins({
            type: 'task_needs_supplies',
            message: `Task "${task.title}" needs supplies`,
            taskId: taskId
          });
        } else if (status === 'in_progress') {
          notifyAllAdmins({
            type: 'task_in_progress',
            message: `Task "${task.title}" is now in progress`,
            taskId: taskId
          });
        }
      }

      res.json({ message: 'Task updated successfully' });
    });
  });
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete task' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

// Task notes routes
app.post('/api/tasks/:taskId/notes', authenticateToken, (req, res) => {
  const taskId = req.params.taskId;
  const { note_text, note_type = 'status_update' } = req.body;

  if (!note_text) {
    return res.status(400).json({ error: 'Note text is required' });
  }

  db.run('INSERT INTO task_notes (task_id, user_id, note_text, note_type) VALUES (?, ?, ?, ?)',
    [taskId, req.user.id, note_text, note_type],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create note' });
      }

      // Notify admins about new notes
      notifyAllAdmins({
        type: 'new_note',
        message: `New note added to task`,
        taskId: taskId
      });

      res.status(201).json({ 
        id: this.lastID, 
        task_id: taskId, 
        user_id: req.user.id, 
        note_text, 
        note_type 
      });
    }
  );
});

app.get('/api/tasks/:taskId/notes', authenticateToken, (req, res) => {
  const taskId = req.params.taskId;

  db.all(`SELECT tn.*, u.username as user_name 
    FROM task_notes tn
    LEFT JOIN users u ON tn.user_id = u.id
    WHERE tn.task_id = ?
    ORDER BY tn.created_at DESC`, [taskId], (err, notes) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
    res.json(notes);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LED Stringers API is running' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`LED Stringers API server running on port ${PORT}`);
});