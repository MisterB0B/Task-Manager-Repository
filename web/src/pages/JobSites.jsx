import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Layout from '../components/Layout';

const API_URL = 'http://localhost:3000/api';

const JobSites = ({ toggleTheme, mode }) => {
  const [jobSites, setJobSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedJobSite, setSelectedJobSite] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  
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
    } catch (err) {
      setError('Failed to load job sites');
      console.error('Error fetching job sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data.filter((u) => u.role !== 'admin'));
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const createJobSite = async () => {
    if (!name.trim()) {
      setError('Please enter a job site name');
      return;
    }

    try {
      await axios.post(`${API_URL}/job-sites`, { name, address, description });
      await fetchJobSites();
      setShowCreateDialog(false);
      resetForm();
      setError('');
    } catch (err) {
      setError('Failed to create job site');
      console.error('Error creating job site:', err);
    }
  };

  const updateJobSite = async () => {
    if (!name.trim()) {
      setError('Please enter a job site name');
      return;
    }

    try {
      await axios.put(`${API_URL}/job-sites/${selectedJobSite.id}`, {
        name,
        address,
        description,
      });
      await fetchJobSites();
      setShowEditDialog(false);
      resetForm();
      setSelectedJobSite(null);
      setError('');
    } catch (err) {
      setError('Failed to update job site');
      console.error('Error updating job site:', err);
    }
  };

  const deleteJobSite = async (jobSiteId) => {
    if (!window.confirm('Are you sure you want to delete this job site?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/job-sites/${jobSiteId}`);
      await fetchJobSites();
      setError('');
    } catch (err) {
      setError('Failed to delete job site');
      console.error('Error deleting job site:', err);
    }
  };

  const openEditDialog = (jobSite) => {
    setSelectedJobSite(jobSite);
    setName(jobSite.name);
    setAddress(jobSite.address || '');
    setDescription(jobSite.description || '');
    setShowEditDialog(true);
  };

  const openAssignDialog = async (jobSite) => {
    setSelectedJobSite(jobSite);
    
    try {
      const assignments = await Promise.all(
        users.map(async (u) => {
          try {
            const userSites = await axios.get(`${API_URL}/users/${u.id}/job-sites`);
            return {
              userId: u.id,
              isAssigned: userSites.data.some((s) => s.id === jobSite.id),
            };
          } catch {
            return { userId: u.id, isAssigned: false };
          }
        })
      );
      setAssignedUsers(assignments);
      setShowAssignDialog(true);
    } catch (err) {
      setError('Failed to load user assignments');
      console.error('Error loading assignments:', err);
    }
  };

  const toggleUserAssignment = async (userId, isAssigned) => {
    try {
      if (isAssigned) {
        await axios.post(`${API_URL}/job-sites/${selectedJobSite.id}/assign-user`, {
          userId,
        });
      } else {
        await axios.delete(
          `${API_URL}/job-sites/${selectedJobSite.id}/assign-user/${userId}`
        );
      }

      setAssignedUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, isAssigned } : u))
      );
    } catch (err) {
      setError('Failed to update user assignment');
      console.error('Error toggling assignment:', err);
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setDescription('');
  };

  if (loading) {
    return (
      <Layout toggleTheme={toggleTheme} mode={mode}>
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout toggleTheme={toggleTheme} mode={mode}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Job Sites Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage your work locations
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            size="large"
          >
            Create Job Site
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {jobSites.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No job sites yet. Create your first job site!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateDialog(true)}
                sx={{ mt: 2 }}
              >
                Create Job Site
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {jobSites.map((jobSite) => (
              <Grid item xs={12} md={6} lg={4} key={jobSite.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
                        {jobSite.name}
                      </Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => openAssignDialog(jobSite)}
                          color="primary"
                        >
                          <PeopleIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(jobSite)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteJobSite(jobSite.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {jobSite.address && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        📍 {jobSite.address}
                      </Typography>
                    )}

                    {jobSite.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {jobSite.description}
                      </Typography>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(jobSite.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Job Site</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Job Site Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={createJobSite}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Job Site</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Job Site Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={updateJobSite}>
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign Users Dialog */}
        <Dialog open={showAssignDialog} onClose={() => setShowAssignDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Users to {selectedJobSite?.name}</DialogTitle>
          <DialogContent>
            <List>
              {users.map((user) => {
                const assignment = assignedUsers.find((u) => u.userId === user.id);
                const isAssigned = assignment?.isAssigned || false;

                return (
                  <ListItem
                    key={user.id}
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={isAssigned}
                        onChange={(e) => toggleUserAssignment(user.id, e.target.checked)}
                      />
                    }
                  >
                    <ListItemText
                      primary={user.username}
                      secondary={user.email}
                    />
                  </ListItem>
                );
              })}
            </List>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={() => setShowAssignDialog(false)}>
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default JobSites;