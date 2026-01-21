import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import TaskDetail from './pages/TaskDetail';
import JobSites from './pages/JobSites';
import CreateTask from './pages/CreateTask';
import UserManagement from './pages/UserManagement';

function App() {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          background: {
            default: mode === 'dark' ? '#121212' : '#f5f5f5',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
        typography: {
          fontFamily: 'Roboto, Arial, sans-serif',
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <Router>
              <AppRoutes toggleTheme={toggleTheme} mode={mode} />
            </Router>
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppRoutes({ toggleTheme, mode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : user.role === 'admin' ? (
        <>
          <Route 
            path="/admin/dashboard" 
            element={<AdminDashboard toggleTheme={toggleTheme} mode={mode} />} 
          />
          <Route 
            path="/admin/job-sites" 
            element={<JobSites toggleTheme={toggleTheme} mode={mode} />} 
          />
          <Route 
            path="/admin/create-task" 
            element={<CreateTask toggleTheme={toggleTheme} mode={mode} />} 
          />
          <Route 
            path="/admin/users" 
            element={<UserManagement toggleTheme={toggleTheme} mode={mode} />} 
          />
          <Route 
            path="/admin/task/:taskId" 
            element={<TaskDetail toggleTheme={toggleTheme} mode={mode} />} 
          />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </>
      ) : (
        <>
          <Route 
            path="/user/dashboard" 
            element={<UserDashboard toggleTheme={toggleTheme} mode={mode} />} 
          />
          <Route 
            path="/user/task/:taskId" 
            element={<TaskDetail toggleTheme={toggleTheme} mode={mode} />} 
          />
          <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;