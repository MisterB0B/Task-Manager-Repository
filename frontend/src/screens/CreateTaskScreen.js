import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  useTheme,
  TextInput,
  RadioButton,
  Chip
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const CreateTaskScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jobSiteId, setJobSiteId] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [loading, setLoading] = useState(false);

  const [jobSites, setJobSites] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchJobSites();
    fetchUsers();
  }, []);

  const fetchJobSites = async () => {
    try {
      const response = await axios.get(`${API_URL}/job-sites`);
      setJobSites(response.data);
    } catch (error) {
      console.error('Error fetching job sites:', error);
      Alert.alert('Error', 'Failed to load job sites');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data.filter(u => u.role !== 'admin'));
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
    }
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!jobSiteId) {
      Alert.alert('Error', 'Please select a job site');
      return;
    }

    if (!assignedUserId) {
      Alert.alert('Error', 'Please assign a user');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/tasks`, {
        title,
        description,
        job_site_id: parseInt(jobSiteId),
        assigned_user_id: parseInt(assignedUserId),
        priority,
        due_date: dueDate || null,
        estimated_hours: estimatedHours ? parseInt(estimatedHours) : null
      });

      Alert.alert(
        'Success',
        'Task created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Task Information
            </Text>

            <TextInput
              label="Task Title *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="Enter task details..."
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Assignment
            </Text>

            <Text style={[styles.label, { color: theme.colors.text }]}>
              Job Site *
            </Text>
            {jobSites.length === 0 ? (
              <Text style={[styles.hintText, { color: theme.colors.text }]}>
                No job sites available. Please create job sites first.
              </Text>
            ) : (
              <View style={styles.chipContainer}>
                {jobSites.map(site => (
                  <Chip
                    key={site.id}
                    selected={jobSiteId === site.id.toString()}
                    onPress={() => setJobSiteId(site.id.toString())}
                    style={styles.chip}
                    mode={jobSiteId === site.id.toString() ? 'flat' : 'outlined'}
                  >
                    {site.name}
                  </Chip>
                ))}
              </View>
            )}

            <Text style={[styles.label, { color: theme.colors.text }]}>
              Assign To *
            </Text>
            {users.length === 0 ? (
              <Text style={[styles.hintText, { color: theme.colors.text }]}>
                No team members available. Please add users first.
              </Text>
            ) : (
              <View style={styles.chipContainer}>
                {users.map(userItem => (
                  <Chip
                    key={userItem.id}
                    selected={assignedUserId === userItem.id.toString()}
                    onPress={() => setAssignedUserId(userItem.id.toString())}
                    style={styles.chip}
                    mode={assignedUserId === userItem.id.toString() ? 'flat' : 'outlined'}
                  >
                    {userItem.username}
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Priority
            </Text>

            <View style={styles.priorityContainer}>
              {['low', 'medium', 'high'].map(p => (
                <Chip
                  key={p}
                  selected={priority === p}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.priorityChip,
                    { borderColor: getPriorityColor(p) }
                  ]}
                  mode={priority === p ? 'flat' : 'outlined'}
                  textStyle={{ color: priority === p ? getPriorityColor(p) : undefined }}
                >
                  {p.toUpperCase()}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Scheduling
            </Text>

            <TextInput
              label="Due Date"
              value={dueDate}
              onChangeText={setDueDate}
              mode="outlined"
              style={styles.input}
              placeholder="YYYY-MM-DD HH:MM"
            />

            <TextInput
              label="Estimated Hours"
              value={estimatedHours}
              onChangeText={setEstimatedHours}
              mode="outlined"
              style={styles.input}
              keyboardType="number-pad"
              placeholder="e.g., 4"
            />
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleCreateTask}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Create Task
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  card: {
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  input: {
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  chip: {
    flex: 1,
    minWidth: 100,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  priorityChip: {
    flex: 1,
    borderWidth: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    flex: 1,
  },
});

export default CreateTaskScreen;