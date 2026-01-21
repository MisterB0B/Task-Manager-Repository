import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DarkTheme, DefaultTheme } from 'react-native-paper';
import { StatusBar } from 'react-native';
import { ThemeContext } from './src/context/ThemeContext';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { SocketProvider } from './src/context/SocketContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import UserDashboard from './src/screens/UserDashboard';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import JobSitesScreen from './src/screens/JobSitesScreen';
import CreateTaskScreen from './src/screens/CreateTaskScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';

const Stack = createStackNavigator();

const App = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <NavigationContainer>
              <StatusBar 
                barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
                backgroundColor={theme.colors.background} 
              />
              <AuthStack />
            </NavigationContainer>
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </PaperProvider>
  );
};

const AuthStack = () => {
  const { userToken, user } = useContext(AuthContext);

  if (!userToken) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      }}
    >
      {user?.role === 'admin' ? (
        <>
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboard}
            options={{ title: 'Admin Dashboard' }}
          />
          <Stack.Screen 
            name="JobSites" 
            component={JobSitesScreen}
            options={{ title: 'Job Sites' }}
          />
          <Stack.Screen 
            name="CreateTask" 
            component={CreateTaskScreen}
            options={{ title: 'Create Task' }}
          />
          <Stack.Screen 
            name="UserManagement" 
            component={UserManagementScreen}
            options={{ title: 'User Management' }}
          />
          <Stack.Screen 
            name="AdminTaskDetail" 
            component={TaskDetailScreen}
            options={{ title: 'Task Details' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="UserDashboard" 
            component={UserDashboard}
            options={{ title: 'My Tasks' }}
          />
          <Stack.Screen 
            name="UserTaskDetail" 
            component={TaskDetailScreen}
            options={{ title: 'Task Details' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default App;