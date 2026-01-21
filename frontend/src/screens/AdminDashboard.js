import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  FAB, 
  Chip, 
  Badge, 
  useTheme,
  Portal,
  Modal,
  Divider
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const AdminDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const theme = useTheme();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    needsSupplies: 0,
    complete: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      const tasksData = response.data;
      setTasks(tasksData);
      
      // Calculate statistics
      setStats({
        total: tasksData.length,
        pending: tasksData.filter(t => t.status === 'pending').length,
        inProgress: tasksData.filter(t => t.status === 'in_progress').length,
        needsSupplies: tasksData.filter(t => t.status === 'needs_supplies').length,
        complete: tasksData.filter(t => t.status === 'complete').length
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleTaskPress = (taskId) => {
    navigation.navigate('AdminTaskDetail', { taskId });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return theme.colors.primary;
      case 'in_progress': return theme.colors.tertiary;
      case 'needs_supplies': return theme.colors.error;
      case 'complete': return theme.colors.success || '#4CAF50';
      default: return theme.colors.primary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const StatCard = ({ title, value, color, icon }) => (
    <Card style={[styles.statCard, { borderLeftColor: color }]}>
      <Card.Content>
        <Text style={[styles.statTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </Card.Content>
    </Card>
  );

  const TaskCard = ({ task }) => (
    <Card 
      style={styles.taskCard} 
      onPress={() => handleTaskPress(task.id)}
    >
      <Card.Content>
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {task.title}
          </Text>
          <Badge style={{ backgroundColor: getPriorityColor(task.priority) }}>
            {task.priority}
          </Badge>
        </View>
        
        <Text style={[styles.taskSite, { color: theme.colors.text }]}>
          📍 {task.job_site_name || 'Unassigned'}
        </Text>
        
        <Text style={[styles.taskUser, { color: theme.colors.text }]}>
          👤 {task.assigned_user_name || 'Unassigned'}
        </Text>

        <View style={styles.taskFooter}>
          <Chip 
            mode="flat" 
            textStyle={{ color: getStatusColor(task.status) }}
            style={styles.statusChip}
          >
            {task.status.replace('_', ' ').toUpperCase()}
          </Chip>
          
          {task.due_date && (
            <Text style={[styles.taskDue, { color: theme.colors.text }]}>
              Due: {new Date(task.due_date).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>
              Welcome, {user?.username}!
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              Admin Dashboard
            </Text>
          </View>
          
          <View style={styles.headerButtons}>
            <Button 
              mode="outlined" 
              onPress={toggleTheme}
              icon={isDarkMode ? 'white-balance-sunny' : 'weather-night'}
              style={styles.themeButton}
              compact
            />
            
            <View style={styles.notificationContainer}>
              <Button 
                mode="outlined" 
                onPress={() => {
                  setShowNotifications(true);
                  markAllAsRead();
                }}
                icon="bell"
                style={styles.notificationButton}
                compact
              />
              {unreadCount > 0 && (
                <Badge style={styles.notificationBadge}>{unreadCount}</Badge>
              )}
            </View>
            
            <Button 
              mode="outlined" 
              onPress={handleLogout}
              icon="logout"
              style={styles.logoutButton}
              compact
            />
          </View>
        </View>
      </View>

      {/* Statistics */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
        contentContainerStyle={styles.statsContent}
      >
        <StatCard title="Total Tasks" value={stats.total} color={theme.colors.primary} icon="clipboard-list" />
        <StatCard title="Pending" value={stats.pending} color="#9E9E9E" icon="clock-outline" />
        <StatCard title="In Progress" value={stats.inProgress} color={theme.colors.tertiary} icon="progress-clock" />
        <StatCard title="Needs Supplies" value={stats.needsSupplies} color="#F44336" icon="alert-circle" />
        <StatCard title="Complete" value={stats.complete} color="#4CAF50" icon="check-circle" />
      </ScrollView>

      {/* Task List */}
      <ScrollView
        style={styles.tasksList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            All Tasks
          </Text>
          <Button mode="text" onPress={() => navigation.navigate('JobSites')}>
            Manage Job Sites
          </Button>
        </View>

        {tasks.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No tasks yet. Create your first task!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask')}
        label="Create Task"
      />

      {/* Notifications Modal */}
      <Portal>
        <Modal
          visible={showNotifications}
          onDismiss={() => setShowNotifications(false)}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Notifications</Text>
            <Button onPress={() => setShowNotifications(false)}>Close</Button>
          </View>
          <ScrollView style={styles.notificationsList}>
            {notifications.length === 0 ? (
              <Text style={[styles.noNotifications, { color: theme.colors.text }]}>
                No notifications
              </Text>
            ) : (
              notifications.map(notification => (
                <Card key={notification.id} style={styles.notificationCard}>
                  <Card.Content>
                    <Text style={[styles.notificationText, { color: theme.colors.text }]}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: theme.colors.text }]}>
                      {new Date(notification.timestamp).toLocaleString()}
                    </Text>
                  </Card.Content>
                </Card>
              ))
            )}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeButton: {
    borderColor: 'transparent',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationButton: {
    borderColor: 'transparent',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  logoutButton: {
    borderColor: 'transparent',
  },
  statsScroll: {
    maxHeight: 120,
  },
  statsContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  statCard: {
    width: 140,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  tasksList: {
    flex: 1,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskCard: {
    marginBottom: 10,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  taskSite: {
    fontSize: 14,
    marginBottom: 4,
  },
  taskUser: {
    fontSize: 14,
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusChip: {
    height: 28,
  },
  taskDue: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyCard: {
    padding: 30,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    margin: 20,
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationsList: {
    maxHeight: 400,
  },
  notificationCard: {
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  noNotifications: {
    textAlign: 'center',
    padding: 20,
    opacity: 0.7,
  },
});

export default AdminDashboard;