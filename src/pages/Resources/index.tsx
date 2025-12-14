import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Tooltip,
  LinearProgress,
  alpha,
  useTheme,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Laptop as LaptopIcon,
  Assignment as AssignmentIcon,
  RequestQuote as RequestIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Group as GroupIcon,
  Inventory as InventoryIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import { projectService } from '../../api/projectService';
import { employeeService } from '../../api/employeeService';
import { resourceService } from '../../api/resourceService';

type TabValue = 'team' | 'equipment' | 'allocations' | 'requests';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'on-leave' | 'inactive';
  utilization: number;
  projects: number;
}
const TEAM_ROLES = [
  'admin',
  'manager',
  'project_manager',
  'team_lead',
  'employee',
  'finance',
  'hr',
] as const;

interface Equipment {
  id: number;
  name: string;
  type: string;
  model: string;
  serial: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  assignedTo: string;
  purchaseDate: string;
  warranty: string;
}

interface ResourceAllocation {
  id: number;
  resource: string;
  project: string;
  allocatedBy: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
}

interface ResourceRequest {
  id: number;
  requester: string;
  resourceType: 'team' | 'equipment';
  resourceName: string;
  project: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
}

const Resources = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<TabValue>('team');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
const [deleteDialog, setDeleteDialog] = useState<{
  open: boolean;
  id: string | number | null;
  type: TabValue;
}>({
  open: false,
  id: null,
  type: 'team',
});


  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
const [editingTeamMember, setEditingTeamMember] = useState<any | null>(null);

  const DEFAULT_TEAM_FORM = {
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    role: 'employee',
    department: '',
    phone: '',
  };


  const DEFAULT_ALLOCATION = {
    allocation_percentage: 0,
    role: '',
    status: 'active',
    start_date: '',
    end_date: '',
    actual_start_date: null,
    actual_end_date: null,
    hourly_rate: '',
    estimated_cost: '',
    approved_date: null,
    project: '',
    employee: '',
    approved_by: null,
    created_by: null,
  };
  const [allocationForm, setAllocationForm] = useState<any>(DEFAULT_ALLOCATION);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [teamData, setTeamData] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [teamForm, setTeamForm] = useState(DEFAULT_TEAM_FORM);

  useEffect(() => {
    if (activeTab === 'team') {
      fetchTeamMembers();
    }
  }, [activeTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  // Sample data
  // const teamData: TeamMember[] = [
  //   { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Senior Developer', department: 'Engineering', status: 'active', utilization: 85, projects: 3 },
  //   { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'UX Designer', department: 'Design', status: 'active', utilization: 70, projects: 2 },
  //   { id: 3, name: 'Mike Johnson', email: 'mike@company.com', role: 'Project Manager', department: 'Management', status: 'on-leave', utilization: 40, projects: 1 },
  //   { id: 4, name: 'Sarah Wilson', email: 'sarah@company.com', role: 'DevOps Engineer', department: 'Engineering', status: 'active', utilization: 95, projects: 4 },
  //   { id: 5, name: 'Alex Brown', email: 'alex@company.com', role: 'QA Tester', department: 'Quality', status: 'inactive', utilization: 0, projects: 0 },
  // ];

  const equipmentData: Equipment[] = [
    { id: 1, name: 'MacBook Pro', type: 'Laptop', model: 'M2 Pro', serial: 'MP12345', status: 'in-use', assignedTo: 'John Doe', purchaseDate: '2023-01-15', warranty: '2025-01-15' },
    { id: 2, name: 'Dell Monitor', type: 'Monitor', model: 'U2720Q', serial: 'DM98765', status: 'available', assignedTo: '', purchaseDate: '2022-05-20', warranty: '2024-05-20' },
    { id: 3, name: 'Development Server', type: 'Server', model: 'Dell R740', serial: 'SR45678', status: 'in-use', assignedTo: 'Sarah Wilson', purchaseDate: '2021-03-10', warranty: '2024-03-10' },
    { id: 4, name: 'Conference System', type: 'AV Equipment', model: 'Poly Studio', serial: 'AV23456', status: 'maintenance', assignedTo: '', purchaseDate: '2022-08-05', warranty: '2024-08-05' },
  ];

  const allocationData: ResourceAllocation[] = [
    { id: 1, resource: 'John Doe', project: 'E-commerce Platform', allocatedBy: 'Project Manager', startDate: '2024-01-01', endDate: '2024-06-30', status: 'active' },
    { id: 2, resource: 'MacBook Pro', project: 'Mobile App Development', allocatedBy: 'IT Manager', startDate: '2024-02-01', endDate: '2024-12-31', status: 'active' },
    { id: 3, resource: 'Development Server', project: 'Data Migration', allocatedBy: 'Infrastructure Lead', startDate: '2024-03-01', endDate: '2024-04-30', status: 'upcoming' },
  ];

  const requestData: ResourceRequest[] = [
    { id: 1, requester: 'Jane Smith', resourceType: 'equipment', resourceName: 'Wacom Tablet', project: 'UI Redesign', requestedDate: '2024-03-15', status: 'pending', priority: 'medium' },
    { id: 2, requester: 'Mike Johnson', resourceType: 'team', resourceName: 'Additional Developer', project: 'Client Portal', requestedDate: '2024-03-10', status: 'approved', priority: 'high' },
    { id: 3, requester: 'Alex Brown', resourceType: 'equipment', resourceName: 'Test Automation License', project: 'QA Automation', requestedDate: '2024-03-12', status: 'rejected', priority: 'low' },
  ];

  const statusConfig = {
    active: { icon: <CheckCircleIcon fontSize="small" />, label: 'Active', color: 'success' as const },
    inactive: { icon: <CancelIcon fontSize="small" />, label: 'Inactive', color: 'error' as const },
    'on-leave': { icon: <PendingIcon fontSize="small" />, label: 'On Leave', color: 'warning' as const },
    available: { icon: <CheckCircleIcon fontSize="small" />, label: 'Available', color: 'success' as const },
    'in-use': { icon: <PendingIcon fontSize="small" />, label: 'In Use', color: 'primary' as const },
    maintenance: { icon: <WarningIcon fontSize="small" />, label: 'Maintenance', color: 'warning' as const },
    retired: { icon: <CancelIcon fontSize="small" />, label: 'Retired', color: 'error' as const },
    pending: { icon: <PendingIcon fontSize="small" />, label: 'Pending', color: 'warning' as const },
    approved: { icon: <CheckCircleIcon fontSize="small" />, label: 'Approved', color: 'success' as const },
    rejected: { icon: <CancelIcon fontSize="small" />, label: 'Rejected', color: 'error' as const },
    completed: { icon: <CheckCircleIcon fontSize="small" />, label: 'Completed', color: 'success' as const },
    upcoming: { icon: <ScheduleIcon fontSize="small" />, label: 'Upcoming', color: 'info' as const },
  };

  const priorityConfig = {
    low: { label: 'Low', color: 'info' as const },
    medium: { label: 'Medium', color: 'warning' as const },
    high: { label: 'High', color: 'error' as const },
  };

  const renderStatusChip = (status: keyof typeof statusConfig) => (
    <Chip
      icon={statusConfig[status]?.icon}
      label={statusConfig[status]?.label || status}
      color={statusConfig[status]?.color || 'default'}
      variant="outlined"
      size="small"
      sx={{ fontWeight: 500 }}
    />
  );

  const renderPriorityChip = (priority: keyof typeof priorityConfig) => (
    <Chip
      label={priorityConfig[priority]?.label || priority}
      color={priorityConfig[priority]?.color || 'default'}
      size="small"
      sx={{ fontWeight: 500 }}
    />
  );

  const filteredTeamData = teamData.filter((member) => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();

    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (member.is_active ? 'active' : 'inactive') === statusFilter;

    return matchesSearch && matchesStatus;
  });


  const filteredEquipmentData = equipmentData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAllocationData = allocationData.filter(allocation => {
    const matchesSearch = allocation.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allocation.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || allocation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRequestData = requestData.filter(request => {
    const matchesSearch = request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

const handleDeleteClick = (id: string | number, type: TabValue) => {
  setDeleteDialog({ open: true, id, type });
};


const handleDeleteConfirm = async () => {
  if (!deleteDialog.id) return;

  try {
    switch (deleteDialog.type) {
      case 'team':
        await employeeService.deleteUser(String(deleteDialog.id));
        fetchTeamMembers(); // refresh team list
        break;

      case 'allocations':
        await resourceService.deleteAllocation(String(deleteDialog.id));
        // fetchAllocations(); // refresh allocations list
        break;

      case 'equipment':
        // await equipmentService.deleteEquipment(String(deleteDialog.id));
        break;

      case 'requests':
        // await resourceService.deleteResourceRequest(String(deleteDialog.id));
        break;

      default:
        break;
    }
  } catch (error) {
    console.error('Delete failed', error);
  } finally {
    setDeleteDialog({ open: false, id: null, type: 'team' });
  }
};


  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, type: 'team' });
  };

  const StatCard = ({ title, value, icon, color, subtext }: any) => (
    <Card
      sx={{
        height: '100%',
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight={600}>
              {value}
            </Typography>
            {subtext && (
              <Typography variant="caption" color="textSecondary">
                {subtext}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusOptions = () => {
    switch (activeTab) {
      case 'team':
        return ['active', 'on-leave', 'inactive'];
      case 'equipment':
        return ['available', 'in-use', 'maintenance', 'retired'];
      case 'allocations':
        return ['active', 'completed', 'upcoming'];
      case 'requests':
        return ['pending', 'approved', 'rejected'];
      default:
        return [];
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setLoadingTeam(true);
      const res = await employeeService.getEmployees();

      // API response: { results: [...] }
      setTeamData(res.results || []);
    } catch (error) {
      console.error('Failed to load team members', error);
    } finally {
      setLoadingTeam(false);
    }
  };

  const loadAllocationDropdowns = async () => {
    try {
      const [projectsRes, employeesRes] = await Promise.all([
        projectService.getProjects(),
        employeeService.getEmployees(),
      ]);

      setProjectsList(projectsRes.results || []);
      setEmployeesList(employeesRes.results || []);
    } catch (error) {
      console.error('Failed to load allocation dropdown data', error);
    }
  };

  const handleSaveAllocation = async () => {
    try {
      const payload = {
        project: allocationForm.project,
        employee: allocationForm.employee,
        approved_by: allocationForm.approved_by || null,
        allocation_percentage: allocationForm.allocation_percentage,
        start_date: allocationForm.start_date,
        end_date: allocationForm.end_date,
        role: allocationForm.role,
        status: allocationForm.status,
        hourly_rate: allocationForm.hourly_rate
          ? Number(allocationForm.hourly_rate)
          : 0,
        estimated_cost: allocationForm.estimated_cost
          ? Number(allocationForm.estimated_cost)
          : 0,
      };

      await resourceService.createAllocation(payload);

      // ✅ Close dialog
      setAllocationDialogOpen(false);

      // ✅ Reset form
      setAllocationForm(DEFAULT_ALLOCATION);

      // ✅ Optional: refresh allocations list
      // loadAllocations();

    } catch (error) {
      console.error('Failed to create allocation', error);
    }
  };

const handleCreateTeamMember = async () => {
  try {
    const payload = {
      email: teamForm.email,
      username: teamForm.username || null,
      first_name: teamForm.first_name,
      last_name: teamForm.last_name,
      role: teamForm.role,
      department: teamForm.department || null,
      phone: teamForm.phone,
    };

    if (editingTeamMember) {
      // ✅ UPDATE
      await employeeService.updateUser(editingTeamMember.id, payload);
    } else {
      // ✅ CREATE
      await employeeService.createUser(payload);
    }

    setTeamDialogOpen(false);
    setEditingTeamMember(null);
    setTeamForm(DEFAULT_TEAM_FORM);

    fetchTeamMembers(); // refresh table
  } catch (error) {
    console.error('Failed to save team member', error);
  }
};



  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Resource Management
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage team members, equipment, allocations, and resource requests
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export
            </Button>
            <Button
  variant="contained"
  startIcon={<AddIcon />}
  onClick={() => {
    if (activeTab === 'team') {
      setEditingTeamMember(null);
      setTeamForm(DEFAULT_TEAM_FORM);
      setTeamDialogOpen(true);
    }

    if (activeTab === 'allocations') {
      setAllocationForm(DEFAULT_ALLOCATION);
      loadAllocationDropdowns();
      setAllocationDialogOpen(true);
    }
    else {
      setAllocationForm(DEFAULT_ALLOCATION);
                loadAllocationDropdowns();   // ✅ API CALLS
                setAllocationDialogOpen(true);
    }
  }}
>
  {activeTab === 'team'
    ? 'Add Team Member'
    : activeTab === 'allocations'
    ? 'Add Allocation'
    : 'Add Resource'}
</Button>


          </Stack>
        </Box>

        {/* Statistics Cards - Using CSS Grid */}
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
          <StatCard
            title="Total Team Members"
            value={teamData.length}
            icon={<GroupIcon />}
            color={theme.palette.primary.main}
            subtext={`${teamData.filter(m => m.status === 'active').length} active`}
          />
          <StatCard
            title="Available Equipment"
            value={equipmentData.filter(e => e.status === 'available').length}
            icon={<InventoryIcon />}
            color={theme.palette.success.main}
            subtext={`${equipmentData.length} total assets`}
          />
          <StatCard
            title="Active Allocations"
            value={allocationData.filter(a => a.status === 'active').length}
            icon={<AssignmentIcon />}
            color={theme.palette.info.main}
            subtext={`${allocationData.length} total allocations`}
          />
          <StatCard
            title="Pending Requests"
            value={requestData.filter(r => r.status === 'pending').length}
            icon={<RequestIcon />}
            color={theme.palette.warning.main}
            subtext={`${requestData.length} total requests`}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2,
              fontWeight: 600,
              textTransform: 'none',
            },
          }}
        >
          <Tab
            value="team"
            label="Team Members"
            icon={<PersonIcon />}
            iconPosition="start"
          />
          <Tab
            value="equipment"
            label="Equipment"
            icon={<LaptopIcon />}
            iconPosition="start"
          />
          <Tab
            value="allocations"
            label="Allocations"
            icon={<AssignmentIcon />}
            iconPosition="start"
          />
          <Tab
            value="requests"
            label="Requests"
            icon={<RequestIcon />}
            iconPosition="start"
          />
        </Tabs>

        {/* Filters */}
        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Box>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
              >
                <MenuItem value="all">All Status</MenuItem>
                {getStatusOptions().map((status) => (
                  <MenuItem key={status} value={status}>
                    {statusConfig[status as keyof typeof statusConfig]?.label || status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Content */}
        <Box>
          {/* Team Members Tab */}
          {activeTab === 'team' && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Team Member</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Utilization</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTeamData.length > 0 ? (
                    filteredTeamData.map((member) => (
                      <TableRow key={member.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                              {member.first_name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {member.first_name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {member.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">{member.role}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={member.department} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Box width={180}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="caption" color="textSecondary">
                                Utilization
                              </Typography>
                              <Typography variant="caption" fontWeight={600}>
                                {member.utilization}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={member.utilization}
                              color={
                                member.utilization > 90
                                  ? 'error'
                                  : member.utilization > 70
                                    ? 'warning'
                                    : 'success'
                              }
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              {member.projects} active projects
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {renderStatusChip(member.is_active ? 'active' : 'inactive')}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Edit">
                              <IconButton
  size="small"
  onClick={() => {
    setEditingTeamMember(member);

    setTeamForm({
      email: member.email || '',
      username: member.username || '',
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      role: member.role || 'employee',
      department: member.department || '',
      phone: member.phone || '',
    });

    setTeamDialogOpen(true);
  }}
>
  <EditIcon fontSize="small" />
</IconButton>

                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(member.id, 'team')}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Box sx={{ opacity: 0.5 }}>
                          <GroupIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            No team members found
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {searchTerm || statusFilter !== 'all'
                              ? 'Try adjusting your search or filter'
                              : 'Add your first team member to get started'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Serial Number</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEquipmentData.length > 0 ? (
                    filteredEquipmentData.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                              <LaptopIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {item.type}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">{item.model}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {item.serial}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {item.assignedTo ? (
                            <Chip
                              label={item.assignedTo}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Unassigned
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {renderStatusChip(item.status)}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Edit">
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(item.id, 'equipment')}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Box sx={{ opacity: 0.5 }}>
                          <LaptopIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            No equipment found
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {searchTerm || statusFilter !== 'all'
                              ? 'Try adjusting your search or filter'
                              : 'Add your first equipment item to get started'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Allocations Tab */}
          {activeTab === 'allocations' && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Resource</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Allocated By</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAllocationData.length > 0 ? (
                    filteredAllocationData.map((allocation) => (
                      <TableRow key={allocation.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                              {allocation.resource === 'John Doe' || allocation.resource === 'Sarah Wilson' ? (
                                <PersonIcon />
                              ) : (
                                <LaptopIcon />
                              )}
                            </Avatar>
                            <Typography variant="body1" fontWeight={500}>
                              {allocation.resource}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">{allocation.project}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{allocation.allocatedBy}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {allocation.startDate} to {allocation.endDate}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Active period
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {renderStatusChip(allocation.status)}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Edit">
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(allocation.id, 'allocations')}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Box sx={{ opacity: 0.5 }}>
                          <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            No allocations found
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {searchTerm || statusFilter !== 'all'
                              ? 'Try adjusting your search or filter'
                              : 'No resource allocations available'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Requester</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Resource Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Resource Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequestData.length > 0 ? (
                    filteredRequestData.map((request) => (
                      <TableRow key={request.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                              {request.requester.charAt(0)}
                            </Avatar>
                            <Typography variant="body1" fontWeight={500}>
                              {request.requester}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={request.resourceType}
                            size="small"
                            icon={request.resourceType === 'team' ? <PersonIcon /> : <LaptopIcon />}
                            color={request.resourceType === 'team' ? 'primary' : 'info'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">{request.resourceName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{request.project}</Typography>
                        </TableCell>
                        <TableCell>
                          {renderPriorityChip(request.priority)}
                        </TableCell>
                        <TableCell>
                          {renderStatusChip(request.status)}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Approve">
                              <IconButton size="small" color="success">
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" color="error">
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More">
                              <IconButton size="small">
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Box sx={{ opacity: 0.5 }}>
                          <RequestIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            No requests found
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {searchTerm || statusFilter !== 'all'
                              ? 'Try adjusting your search or filter'
                              : 'No resource requests available'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      <Dialog
        open={allocationDialogOpen}
        onClose={() => setAllocationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Resource Allocation</DialogTitle>

        <DialogContent sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

          <TextField
            label="Role"
            required
            value={allocationForm.role}
            inputProps={{ maxLength: 100 }}
            onChange={(e) =>
              setAllocationForm({ ...allocationForm, role: e.target.value })
            }
          />

          <TextField
            label="Allocation Percentage"
            type="number"
            required
            inputProps={{ min: 0, max: 100 }}
            value={allocationForm.allocation_percentage}
            onChange={(e) =>
              setAllocationForm({
                ...allocationForm,
                allocation_percentage: Number(e.target.value),
              })
            }
          />

          <TextField
            label="Start Date"
            type="date"
            required
            InputLabelProps={{ shrink: true }}
            value={allocationForm.start_date}
            onChange={(e) =>
              setAllocationForm({ ...allocationForm, start_date: e.target.value })
            }
          />

          <TextField
            label="End Date"
            type="date"
            required
            InputLabelProps={{ shrink: true }}
            value={allocationForm.end_date}
            onChange={(e) =>
              setAllocationForm({ ...allocationForm, end_date: e.target.value })
            }
          />

          <TextField
            label="Actual Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={allocationForm.actual_start_date || ''}
            onChange={(e) =>
              setAllocationForm({
                ...allocationForm,
                actual_start_date: e.target.value || null,
              })
            }
          />

          <TextField
            label="Actual End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={allocationForm.actual_end_date || ''}
            onChange={(e) =>
              setAllocationForm({
                ...allocationForm,
                actual_end_date: e.target.value || null,
              })
            }
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={allocationForm.status}
              label="Status"
              onChange={(e) =>
                setAllocationForm({ ...allocationForm, status: e.target.value })
              }
            >
              {['active', 'completed', 'upcoming', 'cancelled', 'on_hold', 'approved'].map(
                (s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                )
              )}
            </Select>
          </FormControl>

          <TextField
            label="Hourly Rate"
            value={allocationForm.hourly_rate}
            onChange={(e) =>
              setAllocationForm({ ...allocationForm, hourly_rate: e.target.value })
            }
          />

          <TextField
            label="Estimated Cost"
            value={allocationForm.estimated_cost}
            onChange={(e) =>
              setAllocationForm({ ...allocationForm, estimated_cost: e.target.value })
            }
          />

          <TextField
            label="Approved Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={allocationForm.approved_date || ''}
            onChange={(e) =>
              setAllocationForm({
                ...allocationForm,
                approved_date: e.target.value || null,
              })
            }
          />

          <FormControl fullWidth required>
            <InputLabel>Project</InputLabel>
            <Select
              label="Project"
              value={allocationForm.project}
              onChange={(e) =>
                setAllocationForm({ ...allocationForm, project: e.target.value })
              }
            >
              {projectsList.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


          <FormControl fullWidth required>
            <InputLabel>Employee</InputLabel>
            <Select
              label="Employee"
              value={allocationForm.employee}
              onChange={(e) =>
                setAllocationForm({ ...allocationForm, employee: e.target.value })
              }
            >
              {employeesList.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>



          <FormControl fullWidth>
            <InputLabel>Approved By</InputLabel>
            <Select
              label="Approved By"
              value={allocationForm.approved_by || ''}
              onChange={(e) =>
                setAllocationForm({
                  ...allocationForm,
                  approved_by: e.target.value || null,
                })
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>

              {employeesList.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>



        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAllocationDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAllocation}>
            Save Allocation
          </Button>
        </DialogActions>
      </Dialog>


      {/* team dialog  */}
      <Dialog
        open={teamDialogOpen}
        onClose={() => setTeamDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
<DialogTitle>
  {editingTeamMember ? 'Edit Team Member' : 'Add Team Member'}
</DialogTitle>

        <DialogContent
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            label="Email"
            required
            value={teamForm.email}
            onChange={(e) =>
              setTeamForm({ ...teamForm, email: e.target.value })
            }
          />

          <TextField
            label="Username"
            value={teamForm.username}
            onChange={(e) =>
              setTeamForm({ ...teamForm, username: e.target.value })
            }
          />

          <TextField
            label="First Name"
            value={teamForm.first_name}
            onChange={(e) =>
              setTeamForm({ ...teamForm, first_name: e.target.value })
            }
          />

          <TextField
            label="Last Name"
            value={teamForm.last_name}
            onChange={(e) =>
              setTeamForm({ ...teamForm, last_name: e.target.value })
            }
          />

          <FormControl fullWidth required>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={teamForm.role}
              onChange={(e) =>
                setTeamForm({ ...teamForm, role: e.target.value })
              }
            >
              {TEAM_ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.replace('_', ' ').toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Department (UUID)"
            value={teamForm.department}
            onChange={(e) =>
              setTeamForm({ ...teamForm, department: e.target.value })
            }
          />

          <TextField
            label="Phone"
            value={teamForm.phone}
            onChange={(e) =>
              setTeamForm({ ...teamForm, phone: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setTeamDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTeamMember}>
            Save
          </Button>
        </DialogActions>
      </Dialog>


      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600}>
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography>
            Are you sure you want to delete this resource? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Resources;