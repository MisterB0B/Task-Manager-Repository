import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  Chip, 
  Badge, 
  useTheme,
  TextInput,
  Portal,
  Modal,
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { user } = useAuth();
  const theme = useTheme();
  const isAdmin = user?.role === 'admin';

  const [task, setTask] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('status_update');

  useEffect(() => {
    fetchTaskDetails();
    fetchTaskNotes();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks/${taskId}`);
      setTask(response.data);
    } catch (error) {
      console.error('Error fetching task details:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskNotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks/${taskId}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching task notes:', error);
    }
  };

  const updateTaskStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus });
      await fetchTaskDetails();
      Alert.alert('Success', `Task marked as ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    try {
      await axios.post(`${API_URL}/tasks/${taskId}/notes`, {
        note_text: noteText,
        note_type: noteType
      });
      await fetchTaskNotes();
      setShowNoteModal(false);
      setNoteText('');
      Alert.alert('Success', 'Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note');
    }
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

  const getNoteTypeIcon = (type) => {
    switch (type) {
      case 'status_update': return 'information';
      case 'supply_request': return 'package';
      case 'time_request': return 'clock';
      default: return 'note';
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading task...</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={[styles.errorText, { color: theme.colors.text }]}>
              Task not found
            </Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Task Header */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.taskHeader}>
              <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
                {task.title}
              </Text>
              <Badge style={{ backgroundColor: getPriorityColor(task.priority) }}>
                {task.priority.toUpperCase()}
              </Badge>
            </View>

            <View style={styles.taskMeta}>
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: theme.colors.text }]}>Status:</Text>
                <Chip 
                  mode="flat" 
                  textStyle={{ color: getStatusColor(task.status) }}
                  style={styles.statusChip}
                >
                  {task.status.replace('_', ' ').toUpperCase()}
                </Chip>
              </View>

              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: theme.colors.text }]}>Job Site:</Text>
                <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                  {task.job_site_name || 'Not assigned'}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: theme.colors.text }]}>Assigned To:</Text>
                <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                  {task.assigned_user_name || 'Not assigned'}
                </Text>
              </View>

              {task.due_date && (
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.colors.text }]}>Due Date:</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                    {new Date(task.due_date).toLocaleString()}
                  </Text>
                </View>
              )}

              {task.estimated_hours && (
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.colors.text }]}>Estimated Time:</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                    {task.estimated_hours} hours
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Description */}
        {task.description && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description</Text>
              <Text style={[styles.description, { color: theme.colors.text }]}>
                {task.description}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Status Update Actions (for regular users) */}
        {!isAdmin && task.status !== 'complete' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Update Status</Text>
              <View style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  onPress={() => updateTaskStatus('in_progress')}
                  disabled={updating || task.status === 'in_progress'}
                  icon="progress-clock"
                  style={styles.actionButton}
                >
                  In Progress
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => updateTaskStatus('needs_supplies')}
                  disabled={updating || task.status === 'needs_supplies'}
                  icon="alert-circle"
                  style={styles.actionButton}
                  buttonColor="#FFF3E0"
                >
                  Needs Supplies
                </Button>
                <Button
                  mode="contained"
                  onPress={() => updateTaskStatus('complete')}
                  disabled={updating}
                  icon="check-circle"
                  style={styles.actionButton}
                  buttonColor="#4CAF50"
                >
                  Complete
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Notes Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.notesHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Notes & Updates
              </Text>
              <Button
                mode="contained"
                onPress={() => setShowNoteModal(true)}
                icon="plus"
                compact
              >
                Add Note
              </Button>
            </View>

            {notes.length === 0 ? (
              <Text style={[styles.noNotes, { color: theme.colors.text }]}>
                No notes yet
              </Text>
            ) : (
              notes.map(note => (
                <View key={note.id} style={styles.noteItem}>
                  <View style={styles.noteHeader}>
                    <View style={styles.noteUserInfo}>
                      <Text style={[styles.noteUser, { color: theme.colors.text }]}>
                        {note.user_name}
                      </Text>
                      <Chip
                        mode="flat"
                        icon={getNoteTypeIcon(note.note_type)}
                        style={styles.noteTypeChip}
                        textStyle={{ fontSize: 10 }}
                      >
                        {note.note_type.replace('_', ' ')}
                      </Chip>
                    </View>
                    <Text style={[styles.noteTime, { color: theme.colors.text }]}>
                      {new Date(note.created_at).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={[styles.noteText, { color: theme.colors.text }]}>
                    {note.note_text}
                  </Text>
                  <Divider style={styles.noteDivider} />
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add Note Modal */}
      <Portal>
        <Modal
          visible={showNoteModal}
          onDismiss={() => {
            setShowNoteModal(false);
            setNoteText('');
          }}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Note</Text>
          
          <Text style={[styles.noteTypeLabel, { color: theme.colors.text }]}>Note Type:</Text>
          <View style={styles.noteTypeOptions}>
            <Chip
              selected={noteType === 'status_update'}
              onPress={() => setNoteType('status_update')}
              style={styles.noteTypeOption}
            >
              Status Update
            </Chip>
            <Chip
              selected={noteType === 'supply_request'}
              onPress={() => setNoteType('supply_request')}
              style={styles.noteTypeOption}
            >
              Supply Request
            </Chip>
            <Chip
              selected={noteType === 'time_request'}
              onPress={() => setNoteType('time_request')}
              style={styles.noteTypeOption}
            >
              Time Request
            </Chip>
          </View>

          <TextInput
            label="Note"
            value={noteText}
            onChangeText={setNoteText}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.noteInput}
          />

          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={() => setShowNoteModal(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={addNote}>
              Add Note
            </Button>
          </View>
        </Modal>
      </Portal>

      {updating && (
        <View style={styles.updatingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  card: {
    marginBottom: 15,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  taskMeta: {
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 100,
  },
  metaValue: {
    fontSize: 14,
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  actionButtons: {
    gap: 10,
  },
  actionButton: {
    marginBottom: 8,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  noNotes: {
    textAlign: 'center',
    padding: 20,
    opacity: 0.7,
    fontSize: 14,
  },
  noteItem: {
    marginBottom: 15,
  },
  noteHeader: {
    marginBottom: 8,
  },
  noteUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },
  noteUser: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteTypeChip: {
    height: 24,
  },
  noteTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDivider: {
    marginTop: 10,
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  noteTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  noteTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  noteTypeOption: {
    flex: 1,
    minWidth: 100,
  },
  noteInput: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  updatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    margin: 20,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
  },
});

export default TaskDetailScreen;