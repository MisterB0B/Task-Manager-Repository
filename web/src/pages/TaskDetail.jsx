import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Note as NoteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3000/api';

const TaskDetail = ({ toggleTheme, mode }) => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [task, setTask] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showNoteDialog, setShowNoteDialog] = useState(false);
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
    } catch (err) {
      setError('Failed to load task details');
      console.error('Error fetching task:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskNotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks/${taskId}/notes`);
      setNotes(response.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const updateTaskStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus });
      await fetchTaskDetails();
      setError('');
    } catch (err) {
      setError('Failed to update task status');
      console.error('Error updating task:', err);
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) {
      setError('Please enter a note');
      return;
    }

    try {
      await axios.post(`${API_URL}/tasks/${taskId}/notes`, {
        note_text: noteText,
        note_type: noteType,
      });
      await fetchTaskNotes();
      setShowNoteDialog(false);
      setNoteText('');
      setError('');
    } catch (err) {
      setError('Failed to add note');
      console.error('Error adding note:', err);
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

  if (loading) {
    return (
      <Layout toggleTheme={toggleTheme} mode={mode}>
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout toggleTheme={toggleTheme} mode={mode}>
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">Task not found</Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout toggleTheme={toggleTheme} mode={mode}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Task Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Typography variant="h4" fontWeight="bold" sx={{ flex: 1 }}>
                {task.title}
              </Typography>
              <Chip
                label={task.priority}
                color={getPriorityColor(task.priority)}
              />
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong>
                </Typography>
                <Chip
                  label={task.status.replace('_', ' ').toUpperCase()}
                  color={getStatusColor(task.status)}
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Job Site:</strong>
                </Typography>
                <Typography variant="body1">
                  {task.job_site_name || 'Not assigned'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Assigned To:</strong>
                </Typography>
                <Typography variant="body1">
                  {task.assigned_user_name || 'Not assigned'}
                </Typography>
              </Grid>

              {task.due_date && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Due Date:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {new Date(task.due_date).toLocaleString()}
                  </Typography>
                </Grid>
              )}

              {task.estimated_hours && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Estimated Time:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {task.estimated_hours} hours
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Description */}
        {task.description && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1">{task.description}</Typography>
            </CardContent>
          </Card>
        )}

        {/* Status Update Actions (for users) */}
        {!isAdmin && task.status !== 'complete' && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Update Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="info"
                  onClick={() => updateTaskStatus('in_progress')}
                  disabled={updating || task.status === 'in_progress'}
                >
                  In Progress
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => updateTaskStatus('needs_supplies')}
                  disabled={updating || task.status === 'needs_supplies'}
                >
                  Needs Supplies
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => updateTaskStatus('complete')}
                  disabled={updating}
                >
                  Complete
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Notes Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Notes & Updates
              </Typography>
              <Button
                variant="contained"
                startIcon={<NoteIcon />}
                onClick={() => setShowNoteDialog(true)}
              >
                Add Note
              </Button>
            </Box>

            {notes.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No notes yet
              </Typography>
            ) : (
              notes.map((note, index) => (
                <Box key={note.id}>
                  {index > 0 && <Divider sx={{ my: 2 }} />}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {note.user_name}
                        </Typography>
                        <Chip
                          label={note.note_type.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(note.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{note.note_text}</Typography>
                  </Box>
                </Box>
              ))
            )}
          </CardContent>
        </Card>

        {/* Add Note Dialog */}
        <Dialog open={showNoteDialog} onClose={() => setShowNoteDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Note</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Note Type:
              </Typography>
              <ToggleButtonGroup
                value={noteType}
                exclusive
                onChange={(e, newValue) => newValue && setNoteType(newValue)}
                size="small"
                fullWidth
                sx={{ mb: 2 }}
              >
                <ToggleButton value="status_update">Status Update</ToggleButton>
                <ToggleButton value="supply_request">Supply Request</ToggleButton>
                <ToggleButton value="time_request">Time Request</ToggleButton>
              </ToggleButtonGroup>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Note"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter your note here..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNoteDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={addNote}>
              Add Note
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default TaskDetail;