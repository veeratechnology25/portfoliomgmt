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
  CheckCircle,
  Pending,
  PauseCircle,
  Cancel,
  PlayCircle,
  TrendingUp,
  AttachMoney,
  CalendarToday,
  Folder,
  Visibility,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, differenceInDays, isBefore, isAfter } from 'date-fns';
import { projectService } from '../../api/projectService';
import type { Project } from '../../api/projectService';
import type { SelectChangeEvent } from '@mui/material/Select';
import ProjectFormDialog from './ProjectFormDialog';
import { useSearchParams } from 'react-router-dom';

/* ---------------- Status Config ---------------- */
const statusConfig: any = {
  planning: { label: 'Planning', icon: <Pending fontSize="small" />, color: 'info' },
  in_progress: { label: 'In Progress', icon: <PlayCircle fontSize="small" />, color: 'primary' },
  on_hold: { label: 'On Hold', icon: <PauseCircle fontSize="small" />, color: 'warning' },
  completed: { label: 'Completed', icon: <CheckCircle fontSize="small" />, color: 'success' },
  cancelled: { label: 'Cancelled', icon: <Cancel fontSize="small" />, color: 'error' },
};

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
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);


  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    totalBudget: 0,
    averageProgress: 0,
    activeProjects: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    fetchProjects();
  }, []);

  const [params] = useSearchParams();

useEffect(() => {
  if (params.get('create') === 'true') {
    handleOpenDialog();
  }
}, [params]);


useEffect(() => {
  debugger
  setStats({
    total: projects.length,
    totalBudget: projects.reduce((s, p) => s + p.budget, 0),
    averageProgress: projects.length
      ? Math.round(
          projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length
        )
      : 0,
    activeProjects: projects.filter(
      (p) => p.status === 'planning' || p.status === 'in_progress'
    ).length,
  });
}, [projects]);


  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjects();
      setProjects(res.results || []);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (project?: Project) => {
    setEditingProject(project ?? null);
    setOpenDialog(true);
  };


  const filteredProjects = projects.filter(
    (p) =>
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'all' || p.status === filterStatus)
  );

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  const getProjectStatus = (p: Project) => {
    if (isBefore(new Date(), new Date(p.start_date))) return 'Upcoming';
    if (isAfter(new Date(), new Date(p.end_date)) && p.status !== 'completed') return 'Overdue';
    return 'Active';
  };

  /* ---------------- Render ---------------- */
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>Project Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          New Project
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{p.name}</Typography>
                    <Typography variant="caption">{p.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" icon={statusConfig[p.status].icon}
                      label={statusConfig[p.status].label}
                      color={statusConfig[p.status].color} />
                    <Typography variant="caption">{getProjectStatus(p)}</Typography>
                  </TableCell>
                  <TableCell>
                    {format(parseISO(p.start_date), 'MMM dd')} - {format(parseISO(p.end_date), 'MMM dd')}
                    <Typography variant="caption">
                      {differenceInDays(new Date(p.end_date), new Date(p.start_date))} days
                    </Typography>
                  </TableCell>
                  <TableCell>{formatCurrency(p.budget)}</TableCell>
                  <TableCell>
                    <LinearProgress value={p.progress || 0} variant="determinate" />
                    <Typography variant="caption">{p.progress || 0}%</Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(p)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => projectService.deleteProject(p.id).then(fetchProjects)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog */}
      <ProjectFormDialog
        open={openDialog}
        initialData={editingProject || undefined}
        onClose={() => {
          setOpenDialog(false);
          setEditingProject(null); // ✅ REQUIRED
        }}
        onSuccess={fetchProjects}
      />


    </Container>
  );
};

export default Projects;
