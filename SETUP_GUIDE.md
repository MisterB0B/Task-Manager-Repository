# LED STRINGERS TASK APP - Setup Guide

## 📋 Complete Setup Instructions

This guide will walk you through setting up the LED STRINGERS TASK APP on your development machine.

## 🔧 Prerequisites Installation

### 1. Install Node.js
Download and install Node.js from https://nodejs.org/ (v14 or higher recommended)

Verify installation:
```bash
node --version
npm --version
```

### 2. Install Expo CLI
```bash
npm install -g expo-cli
```

### 3. For Android Development

#### Option A: Using Android Studio (Recommended)
1. Download Android Studio from https://developer.android.com/studio
2. Install Android Studio with Android SDK
3. Create a virtual device (AVD) through Android Studio
4. Start the emulator

#### Option B: Using Expo Go App
1. Download Expo Go app from Google Play Store
2. Make sure your phone and computer are on the same network

### 4. For iOS Development (Mac Only)
1. Install Xcode from Mac App Store
2. Install Xcode command line tools:
   ```bash
   xcode-select --install
   ```
3. Open Xcode and accept the license agreement
4. Install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

## 🚀 Step-by-Step Setup

### Step 1: Clone or Download the Project

If you have the project files:
```bash
cd led-stringers-app
```

### Step 2: Backend Setup

#### 2.1 Navigate to backend directory
```bash
cd backend
```

#### 2.2 Install dependencies
```bash
npm install
```

#### 2.3 Create environment file
Create a `.env` file in the backend directory with:
```env
PORT=3000
JWT_SECRET=led-stringers-secret-key-change-in-production
NODE_ENV=development
```

#### 2.4 Start the backend server
```bash
npm start
```

You should see:
```
LED Stringers API server running on port 3000
Connected to SQLite database
Database tables initialized
```

**Keep this terminal open!** The backend must be running for the app to work.

### Step 3: Frontend Setup

#### 3.1 Open a new terminal

#### 3.2 Navigate to frontend directory
```bash
cd frontend
```

#### 3.3 Install dependencies
```bash
npm install
```

This will install all required packages including:
- React Native
- Expo
- React Native Paper
- React Navigation
- Axios
- Socket.io Client

#### 3.4 Start the development server
```bash
npm start
```

This will start Expo DevTools and open it in your browser at `http://localhost:19002`

### Step 4: Run the App

#### Option A: Run on Android Emulator
1. Make sure your Android emulator is running
2. In the Expo DevTools, click "Run on Android device/emulator"
3. Or press `a` in the terminal where Expo is running

#### Option B: Run on iOS Simulator (Mac Only)
1. Make sure iOS Simulator is running
2. In the Expo DevTools, click "Run on iOS simulator"
3. Or press `i` in the terminal where Expo is running

#### Option C: Run on Physical Device with Expo Go
1. Install Expo Go app on your phone:
   - Android: Google Play Store
   - iOS: App Store
2. Make sure your phone and computer are on the same Wi-Fi network
3. Scan the QR code in Expo DevTools with your phone camera
4. The app will open in Expo Go

#### Option D: Run on Web Browser
1. In Expo DevTools, click "Run in web browser"
2. Or press `w` in the terminal where Expo is running

## 🔑 First Login

### Default Admin Account
- **Username**: `admin`
- **Password**: `admin123`

### Creating Team Member Accounts
1. Log in as admin
2. Go to Admin Dashboard
3. Click "User Management" or navigate to User Management screen
4. Click "Add User"
5. Fill in username, email, password, and role
6. Click "Create"

## 📱 Testing the App

### Admin Workflow
1. **Login as admin**
2. **Create Job Sites**:
   - Go to Job Sites screen
   - Click "Create Job Site"
   - Enter job site details
3. **Add Users**:
   - Go to User Management
   - Create team member accounts
4. **Assign Users to Job Sites**:
   - Go to Job Sites
   - Click "Assign" on a job site
   - Select users to assign
5. **Create Tasks**:
   - Click "Create Task" FAB
   - Fill in task details
   - Select job site and assign to user
   - Set priority and due date
6. **Monitor Progress**:
   - View tasks on dashboard
   - Check notifications
   - View task details

### User Workflow
1. **Login as team member**
2. **View Assigned Tasks**:
   - See all tasks assigned to you
   - Filter by status or job site
3. **Update Task Status**:
   - Click on a task
   - Update status (In Progress, Needs Supplies, Complete)
4. **Add Notes**:
   - Add notes to explain delays
   - Request supplies or time
5. **Receive Notifications**:
   - Check notification bell for updates

## 🎨 Customization

### Adding Your Logo
1. Place your logo file at `frontend/assets/logo.png`
2. Recommended size: 512x512 pixels
3. PNG format with transparent background

### Changing Colors
The app uses React Native Paper theming. To customize:
- Open `frontend/src/context/ThemeContext.js`
- Modify the theme colors as needed

### Updating API URL
If deploying to a different backend URL:
- Open each screen file in `frontend/src/screens/`
- Find `const API_URL = 'http://localhost:3000/api';`
- Replace with your production URL

## 🐛 Common Issues & Solutions

### Issue: Backend won't start
**Solution**:
- Check if port 3000 is already in use
- Run: `lsof -ti:3000 | xargs kill -9` (Mac/Linux)
- Restart the backend

### Issue: Frontend can't connect to backend
**Solution**:
- Make sure backend is running
- Check the API URL in frontend files
- Verify both are on localhost

### Issue: Expo won't load
**Solution**:
- Clear Expo cache: `npm start -- --clear`
- Reset cache: `npm start -- --reset-cache`
- Restart the terminal

### Issue: Android emulator not detected
**Solution**:
- Make sure emulator is running
- Check ADB connection: `adb devices`
- Restart ADB server: `adb kill-server && adb start-server`

### Issue: iOS build fails
**Solution**:
- Install pods: `cd ios && pod install`
- Clean build folder in Xcode
- Reinstall dependencies

### Issue: Socket.io notifications not working
**Solution**:
- Verify backend Socket.io is running
- Check console for connection errors
- Ensure correct WebSocket URL

## 📊 Database Management

The app uses SQLite for data persistence. The database file `database.sqlite` is created automatically in the backend directory.

### Reset Database
To start fresh:
1. Stop the backend server
2. Delete `backend/database.sqlite`
3. Restart the backend
4. Database will be recreated with default admin account

### View Database
Use a SQLite viewer like:
- DB Browser for SQLite
- SQLiteStudio
- VS Code SQLite extension

## 🔒 Security Notes for Production

Before deploying to production:

1. **Change JWT Secret**: Generate a strong, random secret key
2. **Use HTTPS**: Enable SSL/TLS for the backend
3. **Database**: Migrate from SQLite to PostgreSQL or MySQL
4. **Environment Variables**: Never commit `.env` files
5. **Rate Limiting**: Implement API rate limiting
6. **CORS**: Configure CORS for specific domains only
7. **Password Policy**: Implement strong password requirements
8. **Input Validation**: Validate all user inputs
9. **Logging**: Set up comprehensive logging
10. **Monitoring**: Implement application monitoring

## 📱 Building for Production

### Android
```bash
cd frontend
eas build --platform android
```

### iOS
```bash
cd frontend
eas build --platform ios
```

## 🆘 Getting Help

If you encounter issues:

1. Check the console logs for error messages
2. Review the README files in backend and frontend directories
3. Verify all prerequisites are installed
4. Ensure both backend and frontend are running
5. Check network connectivity

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://reactnativepaper.com/)
- [Socket.io Documentation](https://socket.io/docs/)

---

**Happy coding!** Your LED STRINGERS TASK APP is now ready to use. 🎉