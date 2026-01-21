const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

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

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL database');
    initializeDatabase();
  }
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Job sites table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_sites (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        job_site_id INTEGER REFERENCES job_sites(id) ON DELETE CASCADE,
        assigned_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        due_date TIMESTAMP,
        estimated_hours INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Task notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_notes (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        note_text TEXT NOT NULL,
        note_type VARCHAR(50) DEFAULT 'status_update',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User job sites assignment table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_job_sites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        job_site_id INTEGER REFERENCES job_sites(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, job_site_id)
      )
    `);

    // Create default admin user if not exists
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await pool.query(`
      INSERT INTO users (username, email, password, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', 'admin@ledstringers.com', hashedPassword, 'admin']);
    
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
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

async function notifyAllAdmins(notification) {
  try {
    const result = await pool.query('SELECT id FROM users WHERE role = $1', ['admin']);
    result.rows.forEach(admin => {
      notifyUser(admin.id, notification);
    });
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
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
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, role = 'user' } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, hashedPassword, role]
    );
    
    const userId = result.rows[0].id;
    const token = jwt.sign(
      { id: userId, username, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      token, 
      user: { id: userId, username, role, email } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

// User routes
app.get('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const result = await pool.query('SELECT id, username, email, role, created_at FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:id/job-sites', authenticateToken, async (req, res) => {
  const userId = req.params.id;
  
  try {
    const result = await pool.query(`
      SELECT js.* FROM job_sites js
      INNER JOIN user_job_sites ujs ON js.id = ujs.job_site_id
      WHERE ujs.user_id = $1
    `, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user job sites:', error);
    res.status(500).json({ error: 'Failed to fetch user job sites' });
  }
});

// Job sites routes
app.post('/api/job-sites', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, address, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO job_sites (name, address, description) VALUES ($1, $2, $3) RETURNING id',
      [name, address, description]
    );
    res.status(201).json({ id: result.rows[0].id, name, address, description });
  } catch (error) {
    console.error('Error creating job site:', error);
    res.status(500).json({ error: 'Failed to create job site' });
  }
});

app.get('/api/job-sites', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM job_sites ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching job sites:', error);
    res.status(500).json({ error: 'Failed to fetch job sites' });
  }
});

app.put('/api/job-sites/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, address, description } = req.body;
  const jobId = req.params.id;

  try {
    await pool.query(
      'UPDATE job_sites SET name = $1, address = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
      [name, address, description, jobId]
    );
    res.json({ id: jobId, name, address, description });
  } catch (error) {
    console.error('Error updating job site:', error);
    res.status(500).json({ error: 'Failed to update job site' });
  }
});

app.delete('/api/job-sites/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    await pool.query('DELETE FROM job_sites WHERE id = $1', [req.params.id]);
    res.json({ message: 'Job site deleted successfully' });
  } catch (error) {
    console.error('Error deleting job site:', error);
    res.status(500).json({ error: 'Failed to delete job site' });
  }
});

// Assign users to job sites
app.post('/api/job-sites/:siteId/assign-user', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { userId } = req.body;
  const siteId = req.params.siteId;

  try {
    await pool.query(
      'INSERT INTO user_job_sites (user_id, job_site_id) VALUES ($1, $2) ON CONFLICT (user_id, job_site_id) DO NOTHING',
      [userId, siteId]
    );
    res.json({ message: 'User assigned to job site successfully' });
  } catch (error) {
    console.error('Error assigning user:', error);
    res.status(500).json({ error: 'Failed to assign user to job site' });
  }
});

app.delete('/api/job-sites/:siteId/assign-user/:userId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    await pool.query(
      'DELETE FROM user_job_sites WHERE user_id = $1 AND job_site_id = $2',
      [req.params.userId, req.params.siteId]
    );
    res.json({ message: 'User removed from job site successfully' });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ error: 'Failed to remove user from job site' });
  }
});

// Tasks routes
app.post('/api/tasks', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { title, description, job_site_id, assigned_user_id, priority, due_date, estimated_hours } = req.body;

  if (!title || !job_site_id || !assigned_user_id) {
    return res.status(400).json({ error: 'Title, job site, and assigned user are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, job_site_id, assigned_user_id, priority, due_date, estimated_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [title, description, job_site_id, assigned_user_id, priority, due_date, estimated_hours]
    );

    const taskId = result.rows[0].id;

    // Notify the assigned user
    notifyUser(assigned_user_id, {
      type: 'new_task',
      message: `New task assigned: ${title}`,
      taskId: taskId
    });

    res.status(201).json({ 
      id: taskId, 
      title, 
      description, 
      job_site_id, 
      assigned_user_id, 
      status: 'pending',
      priority,
      due_date,
      estimated_hours
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.get('/api/tasks', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { status, job_site_id } = req.query;

  try {
    let query = `
      SELECT t.*, js.name as job_site_name, u.username as assigned_user_name
      FROM tasks t
      LEFT JOIN job_sites js ON t.job_site_id = js.id
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (userRole !== 'admin') {
      query += ` AND t.assigned_user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (job_site_id) {
      query += ` AND t.job_site_id = $${paramCount}`;
      params.push(job_site_id);
      paramCount++;
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/:id', authenticateToken, async (req, res) => {
  const taskId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT t.*, js.name as job_site_name, u.username as assigned_user_name
      FROM tasks t
      LEFT JOIN job_sites js ON t.job_site_id = js.id
      LEFT JOIN users u ON t.assigned_user_id = u.id
      WHERE t.id = $1
    `, [taskId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const taskId = req.params.id;
  const { status, title, description, priority, due_date, estimated_hours } = req.body;

  try {
    // Check if user has permission
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = taskResult.rows[0];

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.assigned_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const oldStatus = task.status;
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }
    if (title) {
      updates.push(`title = $${paramCount}`);
      params.push(title);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }
    if (priority) {
      updates.push(`priority = $${paramCount}`);
      params.push(priority);
      paramCount++;
    }
    if (due_date) {
      updates.push(`due_date = $${paramCount}`);
      params.push(due_date);
      paramCount++;
    }
    if (estimated_hours) {
      updates.push(`estimated_hours = $${paramCount}`);
      params.push(estimated_hours);
      paramCount++;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(taskId);

    await pool.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramCount}`, params);

    // Notify admins about status changes
    if (status && status !== oldStatus) {
      if (status === 'complete') {
        await notifyAllAdmins({
          type: 'task_completed',
          message: `Task "${task.title}" has been completed`,
          taskId: taskId
        });
      } else if (status === 'needs_supplies') {
        await notifyAllAdmins({
          type: 'task_needs_supplies',
          message: `Task "${task.title}" needs supplies`,
          taskId: taskId
        });
      } else if (status === 'in_progress') {
        await notifyAllAdmins({
          type: 'task_in_progress',
          message: `Task "${task.title}" is now in progress`,
          taskId: taskId
        });
      }
    }

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Task notes routes
app.post('/api/tasks/:taskId/notes', authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;
  const { note_text, note_type = 'status_update' } = req.body;

  if (!note_text) {
    return res.status(400).json({ error: 'Note text is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO task_notes (task_id, user_id, note_text, note_type) VALUES ($1, $2, $3, $4) RETURNING id',
      [taskId, req.user.id, note_text, note_type]
    );

    // Notify admins about new notes
    await notifyAllAdmins({
      type: 'new_note',
      message: `New note added to task`,
      taskId: taskId
    });

    res.status(201).json({ 
      id: result.rows[0].id, 
      task_id: taskId, 
      user_id: req.user.id, 
      note_text, 
      note_type 
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.get('/api/tasks/:taskId/notes', authenticateToken, async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const result = await pool.query(`
      SELECT tn.*, u.username as user_name 
      FROM task_notes tn
      LEFT JOIN users u ON tn.user_id = u.id
      WHERE tn.task_id = $1
      ORDER BY tn.created_at DESC
    `, [taskId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LED Stringers API is running' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`LED Stringers API server running on port ${PORT}`);
});