import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Alert,
  Stack,
  alpha,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  PauseCircle as PauseCircleIcon,
  Cancel as CancelIcon,
  PlayCircle as PlayCircleIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarIcon,
  Folder as FolderIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, differenceInDays, isBefore, isAfter } from 'date-fns';
import { projectService } from '../../api/projectService';
import type { Project } from '../../api/projectService';
import type { SelectChangeEvent } from '@mui/material/Select';

// Enhanced Status configuration with descriptions
const statusConfig = {
  completed: {
    icon: <CheckCircleIcon fontSize="small" />,
    label: 'Completed',
    color: 'success',
    bgColor: '#d4edda',
  },
  in_progress: {
    icon: <PlayCircleIcon fontSize="small" />,
    label: 'In Progress',
    color: 'primary',
    bgColor: '#d1ecf1',
  },
  on_hold: {
    icon: <PauseCircleIcon fontSize="small" />,
    label: 'On Hold',
    color: 'warning',
    bgColor: '#fff3cd',
  },
  cancelled: {
    icon: <CancelIcon fontSize="small" />,
    label: 'Cancelled',
    color: 'error',
    bgColor: '#f8d7da',
  },
  planning: {
    icon: <PendingIcon fontSize="small" />,
    label: 'Planning',
    color: 'info',
    bgColor: '#e2e3e5',
  },
};

// Project statistics type
interface ProjectStats {
  total: number;
  totalBudget: number;
  averageProgress: number;
  activeProjects: number;
}

const Projects = () => {
  const theme = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    totalBudget: 0,
    averageProgress: 0,
    activeProjects: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
const [formData, setFormData] = useState<Partial<Project>>({
    code: 'PROJ',
    name: '',
    description: '',
    status: 'planning',
    budget: 0,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
});

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; projectId: number | null }>({
    open: false,
    projectId: null,
  });
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Calculate statistics when projects change
  useEffect(() => {
    if (projects.length > 0) {
      const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
      const totalProgress = projects.reduce((sum, project) => sum + (project.progress || 0), 0);
      const activeProjects = projects.filter(
        (p) => p.status === 'in_progress' || p.status === 'planning'
      ).length;

      setStats({
        total: projects.length,
        totalBudget,
        averageProgress: Math.round(totalProgress / projects.length),
        activeProjects,
      });
    }
  }, [projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await projectService.getProjects();
      const projectsData = Array.isArray(response.data) ? response.data : [];
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search and status filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDialog = (project: Project | null = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        ...project,
        start_date: project.start_date.split('T')[0],
        end_date: project.end_date.split('T')[0],
      });
    } else {
      setEditingProject(null);
      setFormData({
        code: 'PROJ',
        name: '',
        description: '',
        status: 'planning',
        budget: 0,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProject(null);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value as Project['status'],
    }));
  };

  const handleDateChange = (field: 'start_date' | 'end_date') => (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        [field]: format(date, 'yyyy-MM-dd'),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      if (editingProject) {
        await projectService.updateProject(editingProject.id, formData);
        setSuccessMessage('Project updated successfully!');
      } else {
        await projectService.createProject(formData as Omit<Project, 'id' | 'created_at' | 'updated_at'>);
        setSuccessMessage('Project created successfully!');
      }
      fetchProjects();
      handleCloseDialog();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project. Please try again.');
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteDialog({ open: true, projectId: id });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.projectId) {
      try {
        await projectService.deleteProject(deleteDialog.projectId);
        setSuccessMessage('Project deleted successfully!');
        fetchProjects();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting project:', error);
        setError('Failed to delete project. Please try again.');
      }
    }
    setDeleteDialog({ open: false, projectId: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, projectId: null });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'success';
    if (progress > 70) return 'primary';
    if (progress > 30) return 'warning';
    return 'error';
  };

  const getProjectStatus = (project: Project) => {
    const today = new Date();
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    
    if (isBefore(today, startDate)) return 'Upcoming';
    if (isAfter(today, endDate) && project.status !== 'completed') return 'Overdue';
    return 'Active';
  };

  const StatCard = ({ icon, title, value, color }: any) => (
    <Card
      sx={{
        height: '100%',
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight={600}>
              {title === 'Total Budget' ? formatCurrency(value) : value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Success Message */}
      {successMessage && (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage('')}
          sx={{ mb: 3 }}
        >
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Header Section */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Project Management
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Monitor and manage all your projects from a single dashboard
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilterStatus(filterStatus === 'all' ? 'in_progress' : 'all')}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
            >
              Export
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              New Project
            </Button>
          </Stack>
        </Box>

        {/* Statistics Cards - Using CSS Grid instead of MUI Grid */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 3,
            mb: 4
          }}
        >
          <Box>
            <StatCard
              icon={<FolderIcon />}
              title="Total Projects"
              value={stats.total}
              color={theme.palette.primary.main}
            />
          </Box>
          <Box>
            <StatCard
              icon={<AttachMoneyIcon />}
              title="Total Budget"
              value={stats.totalBudget}
              color={theme.palette.success.main}
            />
          </Box>
          <Box>
            <StatCard
              icon={<TrendingUpIcon />}
              title="Average Progress"
              value={`${stats.averageProgress}%`}
              color={theme.palette.info.main}
            />
          </Box>
          <Box>
            <StatCard
              icon={<CalendarIcon />}
              title="Active Projects"
              value={stats.activeProjects}
              color={theme.palette.warning.main}
            />
          </Box>
        </Box>

        {/* Search and Filter Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: 'center'
            }}
          >
            <Box sx={{ flex: 1, width: '100%' }}>
              <TextField
                fullWidth
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
                size="small"
              />
            </Box>
            <Box>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="on_hold">On Hold</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Projects Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Project Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Timeline</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Budget</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <TableRow
                    key={project.id}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      },
                    }}
                  >
                    
                    <TableCell>
                      <TextField
    fullWidth
    label="Project Code"
    name="code"
    value={formData.code || ''}
    onChange={handleInputChange}
    required
    size="small"
/>

                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {project.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {project.description || 'No description'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Chip
                          icon={statusConfig[project.status]?.icon}
                          label={statusConfig[project.status]?.label}
                          color={statusConfig[project.status]?.color as any}
                          variant="outlined"
                          size="small"
                          sx={{ width: 'fit-content' }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {getProjectStatus(project)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {format(parseISO(project.start_date), 'MMM d, yyyy')}
                        </Typography>
                        <Typography variant="body2">
                          to {format(parseISO(project.end_date), 'MMM d, yyyy')}
                        </Typography>
                        <Chip
                          label={`${differenceInDays(
                            new Date(project.end_date),
                            new Date(project.start_date)
                          )} days`}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {formatCurrency(project.budget)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Spent: {formatCurrency(project.spent || 0)}
                        </Typography>
                        {project.budget > 0 && (
                          <LinearProgress
                            variant="determinate"
                            value={((project.spent || 0) / project.budget) * 100}
                            sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box width={180}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption" color="textSecondary">
                            Progress
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {project.progress || 0}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={project.progress || 0}
                          color={getProgressColor(project.progress || 0) as any}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Project">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(project)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Project">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(project.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <IconButton size="small">
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Box sx={{ opacity: 0.5 }}>
                      <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No projects found
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {searchTerm || filterStatus !== 'all'
                          ? 'Try adjusting your search or filter'
                          : 'Create your first project to get started'}
                      </Typography>
                      {(!searchTerm && filterStatus === 'all') && (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenDialog()}
                          sx={{ mt: 2 }}
                        >
                          Create Project
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Project Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
                size="small"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                size="small"
              />
              <FormControl fullWidth required size="small">
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
              <Box 
                sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={formData.start_date ? new Date(formData.start_date) : null}
                      onChange={handleDateChange('start_date')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          required: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={formData.end_date ? new Date(formData.end_date) : null}
                      onChange={handleDateChange('end_date')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          required: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>
              <TextField
                fullWidth
                type="number"
                label="Budget ($)"
                name="budget"
                value={formData.budget || 0}
                onChange={handleInputChange}
                size="small"
                inputProps={{ min: 0, step: 1000 }}
                InputProps={{
                  startAdornment: (
                    <Typography color="textSecondary" sx={{ mr: 1 }}>
                      $
                    </Typography>
                  ),
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ minWidth: 120 }}
            >
              {editingProject ? 'Update' : 'Create'} Project
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600}>
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Projects;