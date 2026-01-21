# LED Stringers Task App - Frontend

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your preferred platform:

**For Android:**
- Make sure you have an Android emulator running or a physical device connected
- Run: `npm run android`

**For iOS:**
- Make sure you have Xcode installed
- Run: `npm run ios`

**For Web:**
- Run: `npm run web`

### Important Notes

1. **Backend Connection**: The app is configured to connect to the backend at `http://localhost:3000`. Make sure the backend server is running before starting the frontend.

2. **Default Admin Account**:
   - Username: `admin`
   - Password: `admin123`

3. **Asset Files**: The app expects the following asset files in the `assets` folder:
   - `logo.png` - Main app logo
   - `icon.png` - App icon
   - `splash.png` - Splash screen image
   - `adaptive-icon.png` - Android adaptive icon
   - `favicon.png` - Web favicon

   You'll need to add these files or update the image imports in the code.

4. **Environment Configuration**: The API URL is hardcoded in the files. For production, consider using environment variables.

### Features

#### Admin Features:
- Create and manage job sites
- Assign users to job sites
- Create and assign tasks
- Monitor task progress
- Receive notifications for task updates
- Manage team members
- View task statistics

#### User Features:
- View assigned tasks
- Update task status (In Progress, Needs Supplies, Complete)
- Add notes to tasks
- Filter tasks by status and job site
- Receive task notifications
- Dark/Light mode toggle

### Troubleshooting

**Metro bundler issues:**
```bash
npm start -- --clear
```

**Reset cache:**
```bash
npm start -- --reset-cache
```

**Port already in use:**
```bash
npx expo start --port 8081
```

### Building for Production

**Android:**
```bash
expo build:android
```

**iOS:**
```bash
expo build:ios
```

**Using EAS Build:**
```bash
eas build --platform android
eas build --platform ios
```

### Development Tips

1. Use Expo DevTools for debugging
2. Check console logs for errors
3. Use React Native Debugger for advanced debugging
4. Test on both Android and iOS devices
5. Test dark/light mode functionality

### API Integration

All API calls use Axios and include JWT authentication. The base URL is set to `http://localhost:3000/api` in all service files.

### Socket.io Integration

Real-time notifications are implemented using Socket.io. The socket connects to `http://localhost:3000` and handles:
- New task assignments
- Task status updates
- New notes
- Supply requests