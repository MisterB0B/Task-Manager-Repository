import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  Chip, 
  Badge, 
  useTheme,
  Portal,
  Modal,
  SegmentedButtons
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const UserDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const theme = useTheme();

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobSiteFilter, setJobSiteFilter] = useState('all');
  const [jobSites, setJobSites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchJobSites();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, statusFilter, jobSiteFilter]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchJobSites = async () => {
    try {
      const response = await axios.get(`${API_URL}/job-sites`);
      setJobSites(response.data);
    } catch (error) {
      console.error('Error fetching job sites:', error);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (jobSiteFilter !== 'all') {
      filtered = filtered.filter(task => task.job_site_id === parseInt(jobSiteFilter));
    }

    setFilteredTasks(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    await fetchJobSites();
    setRefreshing(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleTaskPress = (taskId) => {
    navigation.navigate('UserTaskDetail', { taskId });
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
        
        <Text style={[styles.taskDescription, { color: theme.colors.text }]} numberOfLines={2}>
          {task.description || 'No description'}
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
              My Tasks
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

        {/* Filters */}
        <View style={styles.filters}>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
              Status:
            </Text>
            <SegmentedButtons
              value={statusFilter}
              onValueChange={setStatusFilter}
              buttons={[
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'complete', label: 'Complete' },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          {jobSites.length > 0 && (
            <View style={styles.filterRow}>
              <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
                Job Site:
              </Text>
              <SegmentedButtons
                value={jobSiteFilter}
                onValueChange={setJobSiteFilter}
                buttons={[
                  { value: 'all', label: 'All Sites' },
                  ...jobSites.map(site => ({
                    value: site.id.toString(),
                    label: site.name.length > 10 ? site.name.substring(0, 10) + '...' : site.name
                  }))
                ]}
                style={styles.segmentedButtons}
              />
            </View>
          )}
        </View>
      </View>

      {/* Task List */}
      <ScrollView
        style={styles.tasksList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTasks.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                {statusFilter === 'all' && jobSiteFilter === 'all' 
                  ? 'No tasks assigned to you yet.'
                  : 'No tasks match your filters.'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </ScrollView>

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
    marginBottom: 20,
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
  filters: {
    gap: 15,
  },
  filterRow: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
  },
  tasksList: {
    flex: 1,
    padding: 15,
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
  taskDescription: {
    fontSize: 14,
    opacity: 0.8,
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

export default UserDashboard;