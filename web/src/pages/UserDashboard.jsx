import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import Layout from '../components/Layout';

const API_URL = 'http://localhost:3000/api';

const UserDashboard = ({ toggleTheme, mode }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [jobSites, setJobSites] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobSiteFilter, setJobSiteFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobSites = async () => {
    try {
      const response = await axios.get(`${API_URL}/job-sites`);
      setJobSites(response.data);
    } catch (err) {
      console.error('Error fetching job sites:', err);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (jobSiteFilter !== 'all') {
      filtered = filtered.filter((task) => task.job_site_id === parseInt(jobSiteFilter));
    }

    setFilteredTasks(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'in_progress':
        return 'info';
      case 'needs_supplies':
        return 'error';
      case 'complete':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const TaskCard = ({ task }) => (
    <Card
      sx={{
        cursor: 'pointer',
        '&:hover': { boxShadow: 6 },
        transition: 'box-shadow 0.3s',
      }}
      onClick={() => navigate(`/user/task/${task.id}`)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ flex: 1 }}>
            {task.title}
          </Typography>
          <Chip
            label={task.priority}
            color={getPriorityColor(task.priority)}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          📍 {task.job_site_name || 'Unassigned'}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
          noWrap
        >
          {task.description || 'No description'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={task.status.replace('_', ' ').toUpperCase()}
            color={getStatusColor(task.status)}
            size="small"
          />
          {task.due_date && (
            <Typography variant="caption" color="text.secondary">
              Due: {new Date(task.due_date).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            My Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your assigned tasks
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Filter by Status:
                </Typography>
                <ToggleButtonGroup
                  value={statusFilter}
                  exclusive
                  onChange={(e, newValue) => newValue && setStatusFilter(newValue)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="pending">Pending</ToggleButton>
                  <ToggleButton value="in_progress">In Progress</ToggleButton>
                  <ToggleButton value="complete">Complete</ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              {jobSites.length > 0 && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter by Job Site</InputLabel>
                    <Select
                      value={jobSiteFilter}
                      label="Filter by Job Site"
                      onChange={(e) => setJobSiteFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Sites</MenuItem>
                      {jobSites.map((site) => (
                        <MenuItem key={site.id} value={site.id}>
                          {site.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                {statusFilter === 'all' && jobSiteFilter === 'all'
                  ? 'No tasks assigned to you yet.'
                  : 'No tasks match your filters.'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {filteredTasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <TaskCard task={task} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
};

export default UserDashboard;