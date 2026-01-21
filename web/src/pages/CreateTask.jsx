import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import axios from 'axios';
import Layout from '../components/Layout';

const API_URL = 'http://localhost:3000/api';

const CreateTask = ({ toggleTheme, mode }) => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jobSiteId, setJobSiteId] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');

  const [jobSites, setJobSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    if (!jobSiteId) {
      setError('Please select a job site');
      return;
    }

    if (!assignedUserId) {
      setError('Please assign a user');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post(`${API_URL}/tasks`, {
        title,
        description,
        job_site_id: parseInt(jobSiteId),
        assigned_user_id: parseInt(assignedUserId),
        priority,
        due_date: dueDate || null,
        estimated_hours: estimatedHours ? parseInt(estimatedHours) : null,
      });

      navigate('/admin/dashboard');
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    } finally {
      setSubmitting(false);
    }
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
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Create New Task
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Fill in the details to create a new task
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Task Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Task Information
              </Typography>

              <TextField
                fullWidth
                label="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                multiline
                rows={4}
                placeholder="Enter task details..."
              />
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Assignment
              </Typography>

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Job Site</InputLabel>
                <Select
                  value={jobSiteId}
                  label="Job Site"
                  onChange={(e) => setJobSiteId(e.target.value)}
                >
                  {jobSites.length === 0 ? (
                    <MenuItem disabled>No job sites available</MenuItem>
                  ) : (
                    jobSites.map((site) => (
                      <MenuItem key={site.id} value={site.id}>
                        {site.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={assignedUserId}
                  label="Assign To"
                  onChange={(e) => setAssignedUserId(e.target.value)}
                >
                  {users.length === 0 ? (
                    <MenuItem disabled>No team members available</MenuItem>
                  ) : (
                    users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Priority */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Priority
              </Typography>

              <ToggleButtonGroup
                value={priority}
                exclusive
                onChange={(e, newValue) => newValue && setPriority(newValue)}
                fullWidth
              >
                <ToggleButton value="low" color="success">
                  Low
                </ToggleButton>
                <ToggleButton value="medium" color="warning">
                  Medium
                </ToggleButton>
                <ToggleButton value="high" color="error">
                  High
                </ToggleButton>
              </ToggleButtonGroup>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Scheduling
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Estimated Hours"
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="e.g., 4"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </Box>
        </form>
      </Container>
    </Layout>
  );
};

export default CreateTask;