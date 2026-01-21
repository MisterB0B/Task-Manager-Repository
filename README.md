# LED STRINGERS TASK APP

A comprehensive cross-platform mobile task management application for LED stringing teams with real-time notifications and role-based access control.

## 🌟 Features

### Admin Capabilities
- ✅ Create and manage multiple job sites
- ✅ Assign team members to specific job sites (single, multiple, or all)
- ✅ Create and assign tasks to team members
- ✅ Monitor task progress in real-time
- ✅ Receive notifications when tasks are completed
- ✅ Receive notifications when tasks need supplies or more time
- ✅ View and respond to task notes
- ✅ Manage team members and their permissions
- ✅ View comprehensive task statistics and analytics
- ✅ Dark/Light mode toggle

### User Capabilities
- ✅ View assigned tasks with filtering options
- ✅ Update task status (In Progress, Needs Supplies, Complete)
- ✅ Add detailed notes to tasks explaining delays or needs
- ✅ Filter tasks by status and job site
- ✅ Receive real-time task assignments and notifications
- ✅ Dark/Light mode toggle
- ✅ View task details and history

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **UI Library**: React Native Paper
- **Navigation**: React Navigation
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Storage**: AsyncStorage

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (production-ready with PostgreSQL/MySQL upgrade path)
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## 📱 Prerequisites

### For Development
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Git

### For Android Development
- Android Studio
- Android SDK
- Android Emulator or physical device

### For iOS Development
- Xcode (macOS only)
- iOS Simulator or physical device

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd led-stringers-app
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Start the backend server:
```bash
npm start
```

The backend will start on `http://localhost:3000`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm start
```

This will open Expo DevTools in your browser.

### 4. Run on Device/Emulator

**For Android:**
- Make sure you have an Android emulator running or device connected
- Press `a` in the terminal or click "Run on Android device/emulator" in Expo DevTools

**For iOS:**
- Make sure you have Xcode installed and iOS simulator running
- Press `i` in the terminal or click "Run on iOS simulator" in Expo DevTools

**For Web:**
- Press `w` in the terminal or click "Run in web browser" in Expo DevTools

## 🔐 Default Credentials

A default admin account is automatically created on first run:

- **Username**: `admin`
- **Password**: `admin123`

**Important**: Change this password in production!

## 📁 Project Structure

```
led-stringers-app/
├── backend/
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   ├── database.sqlite        # SQLite database (auto-created)
│   └── README.md              # Backend documentation
├── frontend/
│   ├── App.js                 # Main React Native app
│   ├── package.json           # Frontend dependencies
│   ├── app.json               # Expo configuration
│   ├── babel.config.js        # Babel configuration
│   ├── src/
│   │   ├── context/           # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   ├── ThemeContext.js
│   │   │   ├── NotificationContext.js
│   │   │   └── SocketContext.js
│   │   └── screens/           # App screens
│   │       ├── LoginScreen.js
│   │       ├── RegisterScreen.js
│   │       ├── AdminDashboard.js
│   │       ├── UserDashboard.js
│   │       ├── TaskDetailScreen.js
│   │       ├── JobSitesScreen.js
│   │       ├── CreateTaskScreen.js
│   │       └── UserManagementScreen.js
│   └── assets/                # Images and icons
├── docs/
│   └── requirements.md        # Detailed requirements
└── README.md                  # This file
```

## 🎨 Customization

### Branding
Replace the placeholder logo and icon files in `frontend/assets/`:
- `logo.png` - Main app logo
- `icon.png` - App icon
- `splash.png` - Splash screen
- `adaptive-icon.png` - Android adaptive icon

### Colors
The app uses React Native Paper theming. Customize colors by modifying the theme configuration in `src/context/ThemeContext.js`.

### API Configuration
Update the API URL in all service files from `http://localhost:3000` to your production backend URL.

## 🔧 Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### Frontend Configuration
Update `frontend/app.json` for app metadata:
- App name
- Bundle identifiers
- Version numbers

## 📊 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id/job-sites` - Get user's assigned job sites

### Job Sites
- `POST /api/job-sites` - Create job site (admin only)
- `GET /api/job-sites` - Get all job sites
- `PUT /api/job-sites/:id` - Update job site (admin only)
- `DELETE /api/job-sites/:id` - Delete job site (admin only)
- `POST /api/job-sites/:siteId/assign-user` - Assign user to job site
- `DELETE /api/job-sites/:siteId/assign-user/:userId` - Remove user assignment

### Tasks
- `POST /api/tasks` - Create task (admin only)
- `GET /api/tasks` - Get tasks (filtered by user role)
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (admin only)

### Task Notes
- `POST /api/tasks/:taskId/notes` - Add note to task
- `GET /api/tasks/:taskId/notes` - Get task notes

See `backend/README.md` for detailed API documentation.

## 🔔 Real-time Features

The app uses Socket.io for real-time notifications:
- New task assignments
- Task completion alerts
- Supply request notifications
- Task status updates
- New note additions

## 🌙 Dark/Light Mode

Both admin and user interfaces support dark/light mode toggle. The setting persists across sessions using AsyncStorage.

## 🧪 Testing

### Backend Testing
Test API endpoints using Postman, curl, or similar tools.

### Frontend Testing
Test the app on:
- Android emulator/device
- iOS simulator/device
- Web browser

## 🚢 Deployment

### Backend Deployment
1. Set production environment variables
2. Migrate to PostgreSQL or MySQL
3. Deploy to a cloud provider (AWS, Heroku, DigitalOcean)
4. Set up HTTPS
5. Configure CORS for production domain

### Frontend Deployment
1. Update API URLs to production backend
2. Build the app:
   ```bash
   # Android
   eas build --platform android
   
   # iOS
   eas build --platform ios
   ```
3. Submit to app stores:
   - Google Play Store (Android)
   - Apple App Store (iOS)

See individual README files for detailed deployment instructions.

## 🔒 Security

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- CORS protection
- Input validation
- SQL injection protection (parameterized queries)

## 📈 Scaling

For large-scale deployments:
1. Migrate from SQLite to PostgreSQL/MySQL
2. Use Redis for Socket.io session storage
3. Implement load balancing
4. Add caching layer (Redis)
5. Use CDN for static assets
6. Set up monitoring and logging

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 3000 is available
- Verify dependencies are installed
- Check `.env` file exists

**Frontend can't connect to backend:**
- Ensure backend is running
- Check API URL configuration
- Verify network connection

**Metro bundler issues:**
```bash
npm start -- --clear
```

**Socket.io connection issues:**
- Verify backend Socket.io is running
- Check firewall settings
- Ensure correct URL configuration

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support and questions, please contact the development team.

## 🔄 Updates

Check the `docs/requirements.md` file for the latest feature requirements and specifications.

---

**LED Stringers Task App** - Streamlining task management for LED stringing teams.