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
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Schedule as PendingIcon,
  PlayArrow as InProgressIcon,
  Warning as SuppliesIcon,
  CheckCircle as CompleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Layout from '../components/Layout';

const API_URL = 'http://localhost:3000/api';

const AdminDashboard = ({ toggleTheme, mode }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    needsSupplies: 0,
    complete: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        pending: tasksData.filter((t) => t.status === 'pending').length,
        inProgress: tasksData.filter((t) => t.status === 'in_progress').length,
        needsSupplies: tasksData.filter((t) => t.status === 'needs_supplies').length,
        complete: tasksData.filter((t) => t.status === 'complete').length,
      });
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
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

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', borderLeft: 4, borderColor: color }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" color={color}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: color, opacity: 0.3 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  const TaskCard = ({ task }) => (
    <Card
      sx={{
        cursor: 'pointer',
        '&:hover': { boxShadow: 6 },
        transition: 'box-shadow 0.3s',
      }}
      onClick={() => navigate(`/admin/task/${task.id}`)}
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

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          👤 {task.assigned_user_name || 'Unassigned'}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Overview of all tasks and team activity
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/create-task')}
            size="large"
          >
            Create Task
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Tasks"
              value={stats.total}
              icon={<TaskIcon sx={{ fontSize: 60 }} />}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Pending"
              value={stats.pending}
              icon={<PendingIcon sx={{ fontSize: 60 }} />}
              color="grey.500"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              icon={<InProgressIcon sx={{ fontSize: 60 }} />}
              color="info.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Needs Supplies"
              value={stats.needsSupplies}
              icon={<SuppliesIcon sx={{ fontSize: 60 }} />}
              color="error.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Complete"
              value={stats.complete}
              icon={<CompleteIcon sx={{ fontSize: 60 }} />}
              color="success.main"
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => navigate('/admin/job-sites')}>
              Manage Job Sites
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/users')}>
              Manage Team
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/create-task')}>
              Create New Task
            </Button>
          </Box>
        </Box>

        {/* Tasks List */}
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            All Tasks
          </Typography>
          {tasks.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary">
                  No tasks yet. Create your first task!
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin/create-task')}
                  sx={{ mt: 2 }}
                >
                  Create Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {tasks.map((task) => (
                <Grid item xs={12} sm={6} md={4} key={task.id}>
                  <TaskCard task={task} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Layout>
  );
};

export default AdminDashboard;