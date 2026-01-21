# LED Stringers Task App - Backend

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SQLite3 (comes bundled)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Configuration

The server uses environment variables. Create a `.env` file in the backend directory:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### Default Admin Account

The server automatically creates a default admin account on first run:
- Username: `admin`
- Password: `admin123`

**Important:** Change this password in production!

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

#### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id/job-sites` - Get user's assigned job sites

#### Job Sites
- `POST /api/job-sites` - Create job site (admin only)
- `GET /api/job-sites` - Get all job sites
- `PUT /api/job-sites/:id` - Update job site (admin only)
- `DELETE /api/job-sites/:id` - Delete job site (admin only)
- `POST /api/job-sites/:siteId/assign-user` - Assign user to job site (admin only)
- `DELETE /api/job-sites/:siteId/assign-user/:userId` - Remove user from job site (admin only)

#### Tasks
- `POST /api/tasks` - Create task (admin only)
- `GET /api/tasks` - Get tasks (filtered by user role)
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (admin only)

#### Task Notes
- `POST /api/tasks/:taskId/notes` - Add note to task
- `GET /api/tasks/:taskId/notes` - Get task notes

#### Health
- `GET /api/health` - Health check

### Database

The app uses SQLite for data persistence. The database file (`database.sqlite`) is created automatically on first run.

#### Database Schema

**Users Table**
- id (Primary Key)
- username
- email
- password (hashed)
- role (admin/user)
- created_at
- updated_at

**JobSites Table**
- id (Primary Key)
- name
- address
- description
- created_at
- updated_at

**Tasks Table**
- id (Primary Key)
- title
- description
- job_site_id (Foreign Key)
- assigned_user_id (Foreign Key)
- status (pending/in_progress/needs_supplies/complete)
- priority (low/medium/high)
- due_date
- estimated_hours
- created_at
- updated_at

**TaskNotes Table**
- id (Primary Key)
- task_id (Foreign Key)
- user_id (Foreign Key)
- note_text
- note_type (status_update/supply_request/time_request)
- created_at

**UserJobSites Table**
- id (Primary Key)
- user_id (Foreign Key)
- job_site_id (Foreign Key)
- assigned_at

### Real-time Features

The server uses Socket.io for real-time notifications:

- New task assignments
- Task completion notifications
- Supply request alerts
- Task in progress updates
- New note additions

### Authentication

All protected routes require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Security Considerations

1. **JWT Secret**: Change the JWT_SECRET in production
2. **Password Hashing**: All passwords are hashed using bcryptjs
3. **Role-Based Access**: Admin-only routes are protected
4. **CORS**: Configure CORS for production domains
5. **HTTPS**: Use HTTPS in production
6. **Rate Limiting**: Consider adding rate limiting for API endpoints

### Development Tips

1. Use nodemon for auto-reload during development
2. Check the console for database initialization messages
3. Test API endpoints using Postman or similar tools
4. Monitor Socket.io connections in the console
5. Validate data before database operations

### Troubleshooting

**Database locked error:**
- Close any database viewers
- Restart the server

**Port already in use:**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Socket.io connection issues:**
- Check that the frontend is pointing to the correct URL
- Verify firewall settings
- Check browser console for connection errors

### Testing

You can test the API using curl or Postman:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Create task (replace TOKEN with your JWT token)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "title": "Test Task",
    "description": "Test description",
    "job_site_id": 1,
    "assigned_user_id": 2,
    "priority": "medium"
  }'
```

### Production Deployment

1. Set environment variables for production
2. Change JWT_SECRET to a strong, random value
3. Use a production-grade database (PostgreSQL, MySQL)
4. Enable HTTPS
5. Set up proper CORS configuration
6. Implement rate limiting
7. Set up logging and monitoring
8. Use a process manager (PM2, systemd)

### Scaling Considerations

For large-scale deployments:

1. **Database**: Migrate from SQLite to PostgreSQL or MySQL
2. **Session Storage**: Use Redis for Socket.io sessions
3. **Load Balancing**: Set up multiple server instances
4. **Caching**: Implement Redis caching for frequently accessed data
5. **CDN**: Serve static assets through a CDN
6. **Monitoring**: Set up application performance monitoring