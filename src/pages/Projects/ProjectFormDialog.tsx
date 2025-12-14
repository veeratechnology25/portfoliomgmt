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

/* ---------------- Status Config ---------------- */
const statusConfig: any = {
  planning: { label: 'Planning', icon: <Pending fontSize="small" />, color: 'info' },
  in_progress: { label: 'In Progress', icon: <PlayCircle fontSize="small" />, color: 'primary' },
  on_hold: { label: 'On Hold', icon: <PauseCircle fontSize="small" />, color: 'warning' },
  completed: { label: 'Completed', icon: <CheckCircle fontSize="small" />, color: 'success' },
  cancelled: { label: 'Cancelled', icon: <Cancel fontSize="small" />, color: 'error' },
};


interface ProjectFormDialogProps {
  open: boolean;
  initialData?: Partial<Project>;
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectFormDialog = ({
  open,
  initialData,
  onClose,
  onSuccess,
}: ProjectFormDialogProps) => {
  const DEFAULT_FORM_DATA: Partial<Project> = {
  name: '',
  description: '',
  status: 'planning',
  budget: 0,
  progress: 0,
  start_date: format(new Date(), 'yyyy-MM-dd'),
  end_date: format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'),
};
const [formData, setFormData] = useState<Partial<Project>>(DEFAULT_FORM_DATA);

  // const [formData, setFormData] = useState<Partial<Project>>({
  //   name: '',
  //   description: '',
  //   status: 'planning',
  //   budget: 0,
  //   start_date: format(new Date(), 'yyyy-MM-dd'),
  //   end_date: format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'),
  //   ...initialData,
  // });
useEffect(() => {
  if (initialData) {
    setFormData({
      ...DEFAULT_FORM_DATA,
      ...initialData,
      start_date: initialData.start_date
        ? initialData.start_date.split('T')[0]
        : DEFAULT_FORM_DATA.start_date,
      end_date: initialData.end_date
        ? initialData.end_date.split('T')[0]
        : DEFAULT_FORM_DATA.end_date,
    });
  } else {
    setFormData(DEFAULT_FORM_DATA);
  }
}, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await projectService.createProject({
      ...formData,
      code: generateProjectCode(),
    } as any);

  setFormData(DEFAULT_FORM_DATA); // ✅ RESET HERE

    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
  <form onSubmit={handleSubmit}>
    <DialogTitle>New Project</DialogTitle>

    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* Project Name */}
      <TextField
        label="Project Name"
        required
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
      />

      {/* Description */}
      <TextField
        label="Description"
        multiline
        rows={3}
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      {/* Status */}
      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={formData.status}
          onChange={(e: SelectChangeEvent) =>
            setFormData({ ...formData, status: e.target.value as any })
          }
        >
          {Object.keys(statusConfig).map((status) => (
            <MenuItem key={status} value={status}>
              {statusConfig[status].label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Start / End Dates */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Start Date"
          value={new Date(formData.start_date!)}
          onChange={(d) =>
            setFormData({
              ...formData,
              start_date: format(d!, 'yyyy-MM-dd'),
            })
          }
        />

        <DatePicker
          label="End Date"
          value={new Date(formData.end_date!)}
          onChange={(d) =>
            setFormData({
              ...formData,
              end_date: format(d!, 'yyyy-MM-dd'),
            })
          }
        />
      </LocalizationProvider>

      {/* Budget */}
      <TextField
        label="Budget"
        type="number"
        value={formData.budget}
        onChange={(e) =>
          setFormData({ ...formData, budget: +e.target.value })
        }
      />

      {/* Progress (Optional – Defaults to 0) */}
      <TextField
        label="Progress (%)"
        type="number"
        inputProps={{ min: 0, max: 100 }}
        value={formData.progress ?? 0}
        onChange={(e) =>
          setFormData({ ...formData, progress: +e.target.value })
        }
      />

    </DialogContent>

    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button type="submit" variant="contained">
        Create Project
      </Button>
    </DialogActions>
  </form>
</Dialog>

  );
};
export default ProjectFormDialog;

// Utility function to generate a unique project code
const generateProjectCode = (): string => {
  return 'PRJ-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};