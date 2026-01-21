import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  useTheme,
  TextInput,
  Chip,
  Divider
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const UserManagementScreen = ({ navigation }) => {
  const theme = useTheme();

  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
    }
  };

  const createUser = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
        role
      });

      await fetchUsers();
      setShowCreateModal(false);
      resetForm();
      Alert.alert('Success', 'User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('user');
  };

  const UserCard = ({ user: userItem }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {userItem.username}
          </Text>
          <Chip 
            mode="flat"
            style={[
              styles.roleChip,
              { backgroundColor: userItem.role === 'admin' ? theme.colors.primary + '20' : theme.colors.tertiary + '20' }
            ]}
            textStyle={{ color: userItem.role === 'admin' ? theme.colors.primary : theme.colors.tertiary }}
          >
            {userItem.role.toUpperCase()}
          </Chip>
        </View>

        <Text style={[styles.email, { color: theme.colors.text }]}>
          {userItem.email}
        </Text>

        <Divider style={styles.divider} />

        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: theme.colors.text }]}>
            Created:
          </Text>
          <Text style={[styles.metaValue, { color: theme.colors.text }]}>
            {new Date(userItem.created_at).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            User Management
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text }]}>
            Manage your team members
          </Text>
        </View>

        {users.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No users yet. Create your first team member!
              </Text>
            </Card.Content>
          </Card>
        ) : (
          users.map(userItem => (
            <UserCard key={userItem.id} user={userItem} />
          ))
        )}
      </ScrollView>

      <Button
        mode="contained"
        icon="account-plus"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        contentStyle={styles.fabContent}
      >
        Add User
      </Button>

      {/* Create User Modal */}
      <View style={styles.modalContainer}>
        {showCreateModal && (
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
            <Card style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Add New User
                </Text>

                <TextInput
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="none"
                />

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry
                />

                <Text style={[styles.roleLabel, { color: theme.colors.text }]}>
                  Role:
                </Text>
                <View style={styles.roleOptions}>
                  <Chip
                    selected={role === 'user'}
                    onPress={() => setRole('user')}
                    style={styles.roleOption}
                  >
                    Team Member
                  </Chip>
                  <Chip
                    selected={role === 'admin'}
                    onPress={() => setRole('admin')}
                    style={styles.roleOption}
                  >
                    Administrator
                  </Chip>
                </View>

                <View style={styles.modalButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    style={styles.modalButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={createUser}
                    loading={loading}
                    disabled={loading}
                    style={styles.modalButton}
                  >
                    Create
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </View>
        )}
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleChip: {
    height: 28,
  },
  email: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 10,
  },
  divider: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  metaValue: {
    fontSize: 12,
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
    borderRadius: 28,
  },
  fabContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
    width: '90%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    flex: 1,
  },
});

export default UserManagementScreen;