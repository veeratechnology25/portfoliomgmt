import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon, Pending as PendingIcon,
  PauseCircle as PauseCircleIcon, Cancel as CancelIcon,
  PlayCircle as PlayCircleIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { projectService } from '../../api/projectService';
import type { Project } from '../../api/projectService';
import type { SelectChangeEvent } from '@mui/material/Select';

// Status configuration
const statusConfig = {
  completed: { icon: <CheckCircleIcon color="success" />, label: 'Completed', color: 'success' },
  in_progress: { icon: <PlayCircleIcon color="primary" />, label: 'In Progress', color: 'primary' },
  on_hold: { icon: <PauseCircleIcon color="warning" />, label: 'On Hold', color: 'warning' },
  cancelled: { icon: <CancelIcon color="error" />, label: 'Cancelled', color: 'error' },
  planning: { icon: <PendingIcon color="info" />, label: 'Planning', color: 'info' }
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    status: 'planning',
    budget: 0,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  });
  // Removed unused navigate import and hook

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects();
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (project: Project | null = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        ...project,
        start_date: project.start_date.split('T')[0],
        end_date: project.end_date.split('T')[0]
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        budget: 0,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProject(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value
    }));
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      status: e.target.value as Project['status']
    }));
  };

  const handleDateChange = (field: 'start_date' | 'end_date') => (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await projectService.updateProject(editingProject.id, formData);
      } else {
        await projectService.createProject(formData as Omit<Project, 'id' | 'created_at' | 'updated_at'>);
      }
      fetchProjects();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(id);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <div>
            <Typography variant="h4" component="h1" gutterBottom>
              Projects
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage all your projects from this dashboard
            </Typography>
          </div>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Project
          </Button>
        </Box>

        {loading ? (
          <LinearProgress />
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Timeline</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Typography variant="subtitle1">{project.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {project.description?.substring(0, 60)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={statusConfig[project.status]?.icon}
                          label={statusConfig[project.status]?.label}
                          color={statusConfig[project.status]?.color as any}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {format(parseISO(project.start_date), 'MMM d, yyyy')} -{' '}
                            {format(parseISO(project.end_date), 'MMM d, yyyy')}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {Math.ceil(
                              (new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{' '}
                            days
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">{formatCurrency(project.budget)}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Spent: {formatCurrency(project.spent || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" width={150}>
                          <Box width="100%" mr={1}>
                            <LinearProgress
                              variant="determinate"
                              value={project.progress || 0}
                              color={
                                project.progress === 100
                                  ? 'success'
                                  : project.progress > 70
                                  ? 'primary'
                                  : project.progress > 30
                                  ? 'warning'
                                  : 'error'
                              }
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {project.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(project)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(project.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        No projects found. Create your first project to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Add/Edit Project Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogContent>
            <Box my={2}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                margin="normal"
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status || 'planning'}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="on_hold">On Hold</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <Box display="flex" gap={2} mt={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={formData.start_date ? new Date(formData.start_date) : null}
                    onChange={handleDateChange('start_date')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal',
                        required: true
                      }
                    }}
                  />
                  <DatePicker
                    label="End Date"
                    value={formData.end_date ? new Date(formData.end_date) : null}
                    onChange={handleDateChange('end_date')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal',
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Box>
              <TextField
                fullWidth
                type="number"
                label="Budget ($)"
                name="budget"
                value={formData.budget || 0}
                onChange={handleInputChange}
                margin="normal"
                inputProps={{ min: 0, step: 1000 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingProject ? 'Update' : 'Create'} Project
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Projects;
