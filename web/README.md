# LED Stringers Task Manager - Web Interface

A modern, responsive web interface for the LED Stringers Task Management system built with React, Material-UI, and Vite.

## 🌟 Features

### Admin Features
- ✅ Comprehensive dashboard with real-time statistics
- ✅ Create and manage job sites
- ✅ Assign team members to job sites
- ✅ Create and assign tasks
- ✅ Monitor task progress
- ✅ Receive real-time notifications
- ✅ Manage team members
- ✅ Dark/Light mode toggle

### User Features
- ✅ View assigned tasks
- ✅ Filter tasks by status and job site
- ✅ Update task status
- ✅ Add notes to tasks
- ✅ Receive real-time notifications
- ✅ Dark/Light mode toggle

### Technical Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Real-time WebSocket notifications
- ✅ JWT authentication
- ✅ Material Design UI
- ✅ Fast development with Vite
- ✅ Modern React with Hooks

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on http://localhost:3000

### Installation

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:3001`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
web/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with navigation
│   ├── context/
│   │   ├── AuthContext.jsx     # Authentication state
│   │   ├── NotificationContext.jsx  # Notifications
│   │   └── SocketContext.jsx   # WebSocket connection
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Registration page
│   │   ├── AdminDashboard.jsx  # Admin dashboard
│   │   ├── UserDashboard.jsx   # User dashboard
│   │   ├── TaskDetail.jsx      # Task details
│   │   ├── JobSites.jsx        # Job sites management
│   │   ├── CreateTask.jsx      # Create task form
│   │   └── UserManagement.jsx  # User management
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html                 # HTML template
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies

```

## 🎨 Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **UI Library:** Material-UI (MUI) v5
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client
- **Icons:** Material Icons

## 🔧 Configuration

### API URL

The API URL is configured in each page component. To change it, update the `API_URL` constant:

```javascript
const API_URL = 'http://localhost:3000/api';
```

For production, update this to your production backend URL.

### Socket.io URL

Update the Socket.io connection URL in `src/context/SocketContext.jsx`:

```javascript
const newSocket = io('http://localhost:3000', {
  transports: ['websocket'],
  reconnection: true,
});
```

## 🎯 Default Credentials

- **Username:** admin
- **Password:** admin123

## 📱 Responsive Design

The web interface is fully responsive and works on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1920px+)

## 🌙 Dark Mode

The app supports dark/light mode toggle:
- Click the theme icon in the top navigation
- Preference is saved in localStorage
- Applies to all pages and components

## 🔔 Real-time Notifications

The app uses Socket.io for real-time notifications:
- New task assignments
- Task status updates
- Supply requests
- Task completions

Notifications appear in the notification bell icon in the top navigation.

## 🔐 Authentication

The app uses JWT token authentication:
- Tokens are stored in localStorage
- Automatic token refresh on page reload
- Protected routes based on user role
- Automatic redirect to login if not authenticated

## 🎨 Customization

### Colors

Update the theme in `src/App.jsx`:

```javascript
const theme = createTheme({
  palette: {
    mode,
    primary: {
      main: '#1976d2', // Change primary color
    },
    secondary: {
      main: '#dc004e', // Change secondary color
    },
  },
});
```

### Logo

Replace the logo in the navigation by updating `src/components/Layout.jsx`.

## 🚢 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify.

### Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

## 🐛 Troubleshooting

### Port already in use

Change the port in `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 3002, // Change to any available port
  }
})
```

### Backend connection issues

1. Ensure backend is running on http://localhost:3000
2. Check CORS settings in backend
3. Verify API_URL in all page components

### Build errors

1. Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Clear Vite cache:
```bash
rm -rf node_modules/.vite
```

## 📊 Performance

The web interface is optimized for performance:
- Code splitting with React Router
- Lazy loading of components
- Optimized bundle size with Vite
- Fast refresh during development
- Production builds with minification

## 🔄 Updates

To update dependencies:

```bash
npm update
```

To check for outdated packages:

```bash
npm outdated
```

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support and questions, please contact the development team.

---

**LED Stringers Task Manager Web Interface** - Professional task management for LED installation teams.