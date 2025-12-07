import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Divider,
  Avatar,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Stack,
  Chip,
  alpha,
  Paper,
  AvatarGroup,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as FinanceIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Event as EventIcon,
  ChevronRight as ChevronRightIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, differenceInDays } from 'date-fns';

// Sample data
const recentProjects = [
  { 
    id: 1, 
    name: 'E-commerce Platform', 
    status: 'In Progress', 
    progress: 75, 
    dueDate: '2023-12-15',
    budget: 45000,
    spent: 38000,
    team: ['JD', 'SM', 'AL'],
    priority: 'high',
    category: 'Development'
  },
  { 
    id: 2, 
    name: 'Mobile App Redesign', 
    status: 'On Hold', 
    progress: 30, 
    dueDate: '2024-01-20',
    budget: 28500,
    spent: 12000,
    team: ['MJ', 'RK', 'TP'],
    priority: 'medium',
    category: 'Design'
  },
  { 
    id: 3, 
    name: 'Marketing Website', 
    status: 'Completed', 
    progress: 100, 
    dueDate: '2023-11-30',
    budget: 15000,
    spent: 14200,
    team: ['AB', 'CD'],
    priority: 'low',
    category: 'Marketing'
  },
  { 
    id: 4, 
    name: 'API Integration', 
    status: 'In Progress', 
    progress: 45, 
    dueDate: '2023-12-28',
    budget: 22000,
    spent: 9800,
    team: ['EF', 'GH', 'IJ'],
    priority: 'high',
    category: 'Development'
  },
  { 
    id: 5, 
    name: 'Data Migration', 
    status: 'Planning', 
    progress: 15, 
    dueDate: '2024-02-15',
    budget: 32000,
    spent: 2000,
    team: ['KL', 'MN'],
    priority: 'medium',
    category: 'Infrastructure'
  },
];

const financialData = [
  { month: 'Jan', revenue: 42000, expenses: 28000, profit: 14000 },
  { month: 'Feb', revenue: 38000, expenses: 24500, profit: 13500 },
  { month: 'Mar', revenue: 45000, expenses: 29500, profit: 15500 },
  { month: 'Apr', revenue: 52000, expenses: 32000, profit: 20000 },
  { month: 'May', revenue: 48000, expenses: 31000, profit: 17000 },
  { month: 'Jun', revenue: 55000, expenses: 35000, profit: 20000 },
];

const projectDistribution = [
  { name: 'Development', value: 40, color: '#0088FE' },
  { name: 'Design', value: 25, color: '#00C49F' },
  { name: 'Marketing', value: 20, color: '#FFBB28' },
  { name: 'Infrastructure', value: 15, color: '#FF8042' },
];

const performanceMetrics = [
  { metric: 'Project Completion Rate', value: 92, trend: 'up', change: 5 },
  { metric: 'Budget Adherence', value: 88, trend: 'down', change: 3 },
  { metric: 'Resource Utilization', value: 78, trend: 'up', change: 8 },
  { metric: 'Client Satisfaction', value: 94, trend: 'up', change: 6 },
];

const upcomingDeadlines = [
  { project: 'E-commerce Platform', date: '2023-12-15', tasks: 3, priority: 'high' },
  { project: 'Mobile App Redesign', date: '2024-01-20', tasks: 5, priority: 'medium' },
  { project: 'API Integration', date: '2023-12-28', tasks: 2, priority: 'high' },
  { project: 'Data Migration', date: '2024-02-15', tasks: 8, priority: 'medium' },
];

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [stats] = useState({
    totalProjects: 24,
    activeTasks: 18,
    teamMembers: 12,
    budgetSpent: 156800,
    totalRevenue: 280000,
    pendingApprovals: 3,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(projectId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleAction = (action: string) => {
    console.log(`${action} project ${selectedProject}`);
    handleMenuClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'On Hold': return 'warning';
      case 'Planning': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Project Name', 
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.row.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.category} • Due: {format(new Date(params.row.dueDate), 'MMM d')}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.status}
          color={getStatusColor(params.row.status) as any}
          variant="outlined"
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.priority.charAt(0).toUpperCase() + params.row.priority.slice(1)}
          color={getPriorityColor(params.row.priority) as any}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="textSecondary">
              Progress
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {params.row.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={params.row.progress}
            color={
              params.row.progress === 100
                ? 'success'
                : params.row.progress > 70
                ? 'primary'
                : params.row.progress > 30
                ? 'warning'
                : 'error'
            }
            sx={{
              height: 8,
              borderRadius: 4,
            }}
          />
        </Box>
      ),
    },
    {
      field: 'budget',
      headerName: 'Budget',
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {formatCurrency(params.row.budget)}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Spent: {formatCurrency(params.row.spent)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(params.row.spent / params.row.budget) * 100}
            color={(params.row.spent / params.row.budget) > 0.9 ? 'error' : 'primary'}
            sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
          />
        </Box>
      ),
    },
    {
      field: 'team',
      headerName: 'Team',
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => (
        <AvatarGroup max={3}>
          {params.row.team.map((member: string, index: number) => (
            <Avatar
              key={index}
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.75rem',
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                border: `2px solid ${theme.palette.background.paper}`,
              }}
            >
              {member}
            </Avatar>
          ))}
        </AvatarGroup>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <div>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, params.row.id)}
            aria-label="more"
            aria-controls={`project-menu-${params.row.id}`}
            aria-haspopup="true"
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id={`project-menu-${params.row.id}`}
            anchorEl={anchorEl}
            keepMounted
            open={selectedProject === params.row.id && Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <MenuItem onClick={() => handleAction('Edit')}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Project</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleAction('Share')}>
              <ListItemIcon>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Share</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleAction('Delete')}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ color: 'error' }}>
                Delete
              </ListItemText>
            </MenuItem>
          </Menu>
        </div>
      ),
    },
  ];

  const StatCard = ({ title, value, icon, color, subtext, trend, percentage }: any) => (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" variant="subtitle2" gutterBottom>
              {title}
            </Typography>
            {loading ? (
              <Box width={100}>
                <LinearProgress />
              </Box>
            ) : (
              <Box display="flex" alignItems="baseline" gap={1}>
                <Typography variant="h4" fontWeight={700}>
                  {typeof value === 'number' && title.includes('$')
                    ? formatCurrency(value)
                    : value}
                </Typography>
                {percentage && (
                  <Chip
                    label={`${percentage}%`}
                    size="small"
                    color={trend === 'up' ? 'success' : 'error'}
                    icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            )}
            {subtext && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtext}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: alpha(color, 0.1),
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { color } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 4, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Dashboard Overview
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Welcome back! Here's what's happening with your projects today.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export
            </Button>
            <Button variant="contained" color="primary" startIcon={<AddIcon />}>
              New Project
            </Button>
          </Stack>
        </Box>

        {/* Stats Grid */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(6, 1fr)'
            },
            gap: 3,
            mb: 4
          }}
        >
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={<AssignmentIcon />}
            color={theme.palette.primary.main}
            subtext="8 active • 3 on hold"
            trend="up"
            percentage={12}
          />
          <StatCard
            title="Active Tasks"
            value={stats.activeTasks}
            icon={<AssignmentIcon />}
            color={theme.palette.info.main}
            subtext="3 overdue"
            trend="down"
            percentage={-5}
          />
          <StatCard
            title="Team Members"
            value={stats.teamMembers}
            icon={<PeopleIcon />}
            color={theme.palette.warning.main}
            subtext="78% utilization"
            trend="up"
            percentage={8}
          />
          <StatCard
            title="Budget Spent"
            value={stats.budgetSpent}
            icon={<FinanceIcon />}
            color={theme.palette.success.main}
            subtext="92% of allocated"
            trend="up"
            percentage={4}
          />
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={<TrendingUpIcon />}
            color={theme.palette.error.main}
            subtext="This fiscal year"
            trend="up"
            percentage={18}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<NotificationsIcon />}
            color={theme.palette.secondary.main}
            subtext="Require attention"
            trend="same"
          />
        </Box>
      </Box>

      {/* Charts and Tables */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '2fr 1fr'
          },
          gap: 3,
          mb: 4
        }}
      >
        {/* Financial Chart */}
        <Card sx={{ borderRadius: 2, height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Financial Performance
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Revenue, expenses, and profit trends
                </Typography>
              </Box>
              <Button size="small" startIcon={<FilterIcon />}>
                Filter
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.1)} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}K`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    name="Revenue" 
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="expenses" 
                    name="Expenses" 
                    fill={theme.palette.error.main}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="profit" 
                    name="Profit" 
                    fill={theme.palette.success.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card sx={{ borderRadius: 2, height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Performance Metrics
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Key performance indicators
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              {performanceMetrics.map((item, index) => (
                <Box key={index}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight={500}>
                      {item.metric}
                    </Typography>
                    <Chip
                      label={`${item.trend === 'up' ? '+' : '-'}${item.change}%`}
                      size="small"
                      color={item.trend === 'up' ? 'success' : 'error'}
                      icon={item.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box flex={1}>
                      <LinearProgress
                        variant="determinate"
                        value={item.value}
                        color={item.value > 90 ? 'success' : item.value > 75 ? 'primary' : 'warning'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={600} minWidth={40}>
                      {item.value}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Projects Table */}
      <Card sx={{ borderRadius: 2, mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Projects
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Overview of all active and upcoming projects
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" startIcon={<FilterIcon />}>
                Filter
              </Button>
              <Button variant="contained" color="primary" startIcon={<AddIcon />}>
                New Project
              </Button>
            </Stack>
          </Box>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={recentProjects}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5,
                  },
                },
              }}
              pageSizeOptions={[5]}
              disableRowSelectionOnClick
              loading={loading}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 0,
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
            lg: '1fr 1fr 1fr'
          },
          gap: 3
        }}
      >
        {/* Project Distribution */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Project Distribution
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  By category and type
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {projectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Upcoming Deadlines
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Projects and tasks due soon
                </Typography>
              </Box>
              <CalendarIcon color="action" />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              {upcomingDeadlines.map((item, index) => {
                const daysLeft = differenceInDays(new Date(item.date), new Date());
                const isOverdue = daysLeft < 0;
                const isUrgent = daysLeft <= 3 && daysLeft >= 0;
                
                return (
                  <Paper key={index} sx={{ p: 2, borderRadius: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {item.project}
                      </Typography>
                      <Chip
                        label={item.priority}
                        size="small"
                        color={getPriorityColor(item.priority) as any}
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={1}>
                        <EventIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(item.date), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={isOverdue ? 'Overdue' : isUrgent ? 'Urgent' : `${daysLeft} days`}
                          size="small"
                          color={isOverdue ? 'error' : isUrgent ? 'warning' : 'default'}
                          variant="outlined"
                        />
                        <IconButton size="small">
                          <ChevronRightIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Actions
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Frequently used actions
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              {[
                { icon: <AddIcon />, label: 'Create Project', color: theme.palette.primary.main },
                { icon: <PeopleIcon />, label: 'Add Team Member', color: theme.palette.success.main },
                { icon: <AssignmentIcon />, label: 'New Task', color: theme.palette.warning.main },
                { icon: <ReceiptIcon />, label: 'Create Invoice', color: theme.palette.info.main },
              ].map((action, index) => (
                <Button
                  key={index}
                  fullWidth
                  variant="outlined"
                  startIcon={action.icon}
                  sx={{
                    p: 2,
                    justifyContent: 'flex-start',
                    height: 'auto',
                    borderStyle: 'dashed',
                    borderColor: alpha(action.color, 0.5),
                    color: action.color,
                    '&:hover': {
                      borderColor: action.color,
                      backgroundColor: alpha(action.color, 0.08),
                    },
                  }}
                  onClick={() => console.log(action.label)}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;