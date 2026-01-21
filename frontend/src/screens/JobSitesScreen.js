import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  FAB, 
  useTheme,
  Portal,
  Modal,
  TextInput,
  Divider
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'https://led-stringers-api.onrender.com/api';

const JobSitesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();

  const [jobSites, setJobSites] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedJobSite, setSelectedJobSite] = useState(null);
  const [users, setUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  
  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

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
    }
  };

  const createJobSite = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a job site name');
      return;
    }

    try {
      await axios.post(`${API_URL}/job-sites`, {
        name,
        address,
        description
      });
      await fetchJobSites();
      setShowCreateModal(false);
      resetForm();
      Alert.alert('Success', 'Job site created successfully');
    } catch (error) {
      console.error('Error creating job site:', error);
      Alert.alert('Error', 'Failed to create job site');
    }
  };

  const updateJobSite = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a job site name');
      return;
    }

    try {
      await axios.put(`${API_URL}/job-sites/${selectedJobSite.id}`, {
        name,
        address,
        description
      });
      await fetchJobSites();
      setShowEditModal(false);
      resetForm();
      setSelectedJobSite(null);
      Alert.alert('Success', 'Job site updated successfully');
    } catch (error) {
      console.error('Error updating job site:', error);
      Alert.alert('Error', 'Failed to update job site');
    }
  };

  const deleteJobSite = async (jobSiteId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this job site? This will also unassign all users from this site.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/job-sites/${jobSiteId}`);
              await fetchJobSites();
              Alert.alert('Success', 'Job site deleted successfully');
            } catch (error) {
              console.error('Error deleting job site:', error);
              Alert.alert('Error', 'Failed to delete job site');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (jobSite) => {
    setSelectedJobSite(jobSite);
    setName(jobSite.name);
    setAddress(jobSite.address || '');
    setDescription(jobSite.description || '');
    setShowEditModal(true);
  };

  const openAssignModal = async (jobSite) => {
    setSelectedJobSite(jobSite);
    try {
      const response = await axios.get(`${API_URL}/users/${user.id}/job-sites`);
      // Get all assigned users for this job site
      const allAssignments = await Promise.all(
        users.map(async (u) => {
          try {
            const userSites = await axios.get(`${API_URL}/users/${u.id}/job-sites`);
            return {
              userId: u.id,
              isAssigned: userSites.data.some(s => s.id === jobSite.id)
            };
          } catch {
            return { userId: u.id, isAssigned: false };
          }
        })
      );
      setAssignedUsers(allAssignments);
      setShowAssignModal(true);
    } catch (error) {
      console.error('Error loading assignments:', error);
      Alert.alert('Error', 'Failed to load user assignments');
    }
  };

  const toggleUserAssignment = async (userId, isAssigned) => {
    try {
      if (isAssigned) {
        await axios.post(`${API_URL}/job-sites/${selectedJobSite.id}/assign-user`, {
          userId
        });
      } else {
        await axios.delete(`${API_URL}/job-sites/${selectedJobSite.id}/assign-user/${userId}`);
      }
      
      setAssignedUsers(prev =>
        prev.map(u => u.userId === userId ? { ...u, isAssigned } : u)
      );
    } catch (error) {
      console.error('Error toggling assignment:', error);
      Alert.alert('Error', 'Failed to update user assignment');
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setDescription('');
  };

  const JobSiteCard = ({ jobSite }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {jobSite.name}
          </Text>
          <View style={styles.cardActions}>
            <Button
              mode="text"
              onPress={() => openAssignModal(jobSite)}
              icon="account-group"
              compact
            >
              Assign
            </Button>
            <Button
              mode="text"
              onPress={() => openEditModal(jobSite)}
              icon="pencil"
              compact
            >
              Edit
            </Button>
            <Button
              mode="text"
              onPress={() => deleteJobSite(jobSite.id)}
              icon="delete"
              compact
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </View>
        </View>

        {jobSite.address && (
          <Text style={[styles.address, { color: theme.colors.text }]}>
            📍 {jobSite.address}
          </Text>
        )}

        {jobSite.description && (
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {jobSite.description}
          </Text>
        )}

        <Divider style={styles.divider} />
        
        <Text style={[styles.createdText, { color: theme.colors.text }]}>
          Created: {new Date(jobSite.created_at).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Job Sites Management
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text }]}>
            Create and manage your work locations
          </Text>
        </View>

        {jobSites.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No job sites yet. Create your first job site!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          jobSites.map(jobSite => (
            <JobSiteCard key={jobSite.id} jobSite={jobSite} />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        label="Create Job Site"
      />

      {/* Create Modal */}
      <Portal>
        <Modal
          visible={showCreateModal}
          onDismiss={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Create New Job Site
          </Text>

          <TextInput
            label="Job Site Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={createJobSite}>
              Create
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Edit Modal */}
      <Portal>
        <Modal
          visible={showEditModal}
          onDismiss={() => {
            setShowEditModal(false);
            resetForm();
            setSelectedJobSite(null);
          }}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Edit Job Site
          </Text>

          <TextInput
            label="Job Site Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={updateJobSite}>
              Update
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Assign Users Modal */}
      <Portal>
        <Modal
          visible={showAssignModal}
          onDismiss={() => {
            setShowAssignModal(false);
            setSelectedJobSite(null);
            setAssignedUsers([]);
          }}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Assign Users to {selectedJobSite?.name}
          </Text>

          <ScrollView style={styles.usersList}>
            {users.map(user => {
              const assignment = assignedUsers.find(u => u.userId === user.id);
              const isAssigned = assignment?.isAssigned || false;

              return (
                <View key={user.id} style={styles.userItem}>
                  <Text style={[styles.userName, { color: theme.colors.text }]}>
                    {user.username}
                  </Text>
                  <Button
                    mode={isAssigned ? "contained" : "outlined"}
                    onPress={() => toggleUserAssignment(user.id, !isAssigned)}
                    compact
                  >
                    {isAssigned ? 'Assigned' : 'Assign'}
                  </Button>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.modalButtons}>
            <Button mode="contained" onPress={() => setShowAssignModal(false)}>
              Done
            </Button>
          </View>
        </Modal>
      </Portal>
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
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  card: {
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 5,
  },
  address: {
    fontSize: 14,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  divider: {
    marginTop: 10,
    marginBottom: 5,
  },
  createdText: {
    fontSize: 12,
    opacity: 0.6,
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
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  usersList: {
    maxHeight: 300,
    marginBottom: 15,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default JobSitesScreen;
