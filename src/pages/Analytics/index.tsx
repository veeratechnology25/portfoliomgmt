import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Paper,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Button,
  IconButton,
  Stack,
  Avatar,
  alpha,
  Chip,
  LinearProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as FinanceIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  CalendarToday as CalendarIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

type TimeRange = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type ChartType = 'bar' | 'line' | 'area';

interface AnalyticsStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  activeProjects: number;
  teamMembers: number;
  resourceUtilization: number;
  budgetVariance: number;
}

interface PerformanceMetric {
  name: string;
  current: number;
  previous: number;
  growth: number;
}

const Analytics = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    activeProjects: 0,
    teamMembers: 0,
    resourceUtilization: 0,
    budgetVariance: 0,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats({
        totalRevenue: 125000,
        totalExpenses: 87500,
        netProfit: 37500,
        profitMargin: 30,
        activeProjects: 8,
        teamMembers: 24,
        resourceUtilization: 78,
        budgetVariance: -4.5,
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Sample data
  const financialData = [
    { name: 'Jan', revenue: 42000, expenses: 28000, profit: 14000, target: 15000 },
    { name: 'Feb', revenue: 38000, expenses: 24500, profit: 13500, target: 14000 },
    { name: 'Mar', revenue: 45000, expenses: 29500, profit: 15500, target: 14500 },
    { name: 'Apr', revenue: 52000, expenses: 32000, profit: 20000, target: 16500 },
    { name: 'May', revenue: 48000, expenses: 31000, profit: 17000, target: 15500 },
    { name: 'Jun', revenue: 55000, expenses: 35000, profit: 20000, target: 17000 },
    { name: 'Jul', revenue: 62000, expenses: 38000, profit: 24000, target: 19000 },
  ];

  const projectData = [
    { name: 'E-commerce Platform', value: 35, color: '#0088FE' },
    { name: 'Mobile App', value: 25, color: '#00C49F' },
    { name: 'CRM System', value: 20, color: '#FFBB28' },
    { name: 'Data Migration', value: 15, color: '#FF8042' },
    { name: 'API Development', value: 5, color: '#8884d8' },
  ];

  const performanceMetrics: PerformanceMetric[] = [
    { name: 'Revenue Growth', current: 25, previous: 18, growth: 7 },
    { name: 'Profit Margin', current: 30, previous: 28, growth: 2 },
    { name: 'Resource Utilization', current: 78, previous: 72, growth: 6 },
    { name: 'Project Completion', current: 92, previous: 85, growth: 7 },
    { name: 'Client Satisfaction', current: 88, previous: 82, growth: 6 },
    { name: 'Budget Adherence', current: 95.5, previous: 92, growth: 3.5 },
  ];

  const departmentPerformance = [
    { subject: 'Engineering', value: 85, fullMark: 100 },
    { subject: 'Sales', value: 92, fullMark: 100 },
    { subject: 'Marketing', value: 78, fullMark: 100 },
    { subject: 'Operations', value: 88, fullMark: 100 },
    { subject: 'Finance', value: 95, fullMark: 100 },
    { subject: 'HR', value: 82, fullMark: 100 },
  ];

  const handleTimeRangeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRange: TimeRange | null,
  ) => {
    if (newRange !== null) {
      setTimeRange(newRange);
      // Here you would typically refetch data based on the selected time range
    }
  };

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    subtext, 
    trend,
    percentage 
  }: any) => (
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
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography color="textSecondary" variant="subtitle2" gutterBottom>
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={24} color="inherit" />
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
                    icon={trend === 'up' ? <ArrowUpIcon /> : <ArrowDownIcon />}
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
        {trend && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={percentage || 0}
              color={trend === 'up' ? 'success' : 'error'}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const PerformanceMetricCard = ({ metric }: { metric: PerformanceMetric }) => (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" fontWeight={500}>
          {metric.name}
        </Typography>
        <Chip
          label={`${metric.growth > 0 ? '+' : ''}${metric.growth}%`}
          size="small"
          color={metric.growth > 0 ? 'success' : 'error'}
          icon={metric.growth > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
        />
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="baseline">
        <Typography variant="h5" fontWeight={700}>
          {metric.current}%
        </Typography>
        <Typography variant="caption" color="textSecondary">
          vs {metric.previous}% last period
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={metric.current}
        color={metric.growth > 0 ? 'success' : 'primary'}
        sx={{ mt: 2, height: 8, borderRadius: 4 }}
      />
    </Paper>
  );

  return (
    <Box sx={{ p: 4, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Comprehensive insights and performance metrics for your organization
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export Report
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Refresh Data</MenuItem>
              <MenuItem onClick={handleMenuClose}>Export All Data</MenuItem>
              <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            </Menu>
          </Stack>
        </Box>

        {/* Time Range and Filters */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              color="primary"
              size="small"
            >
              <ToggleButton value="weekly">
                <CalendarIcon sx={{ mr: 1 }} fontSize="small" />
                Weekly
              </ToggleButton>
              <ToggleButton value="monthly">
                <CalendarIcon sx={{ mr: 1 }} fontSize="small" />
                Monthly
              </ToggleButton>
              <ToggleButton value="quarterly">
                <CalendarIcon sx={{ mr: 1 }} fontSize="small" />
                Quarterly
              </ToggleButton>
              <ToggleButton value="yearly">
                <CalendarIcon sx={{ mr: 1 }} fontSize="small" />
                Yearly
              </ToggleButton>
            </ToggleButtonGroup>

            <Stack direction="row" spacing={2}>
              <Button
                variant={chartType === 'bar' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleChartTypeChange('bar')}
                startIcon={<BarChartIcon />}
              >
                Bar
              </Button>
              <Button
                variant={chartType === 'line' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleChartTypeChange('line')}
                startIcon={<LineChartIcon />}
              >
                Line
              </Button>
              <Button
                variant={chartType === 'area' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleChartTypeChange('area')}
                startIcon={<TimelineIcon />}
              >
                Area
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      {/* Stats Grid */}
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
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={<MoneyIcon />}
          color={theme.palette.primary.main}
          subtext={`${timeRange} performance`}
          trend="up"
          percentage={12.5}
        />
        <StatCard
          title="Net Profit"
          value={stats.netProfit}
          icon={<TrendingUpIcon />}
          color={theme.palette.success.main}
          subtext={`${stats.profitMargin}% margin`}
          trend="up"
          percentage={8.2}
        />
        <StatCard
          title="Total Expenses"
          value={stats.totalExpenses}
          icon={<FinanceIcon />}
          color={theme.palette.error.main}
          subtext={`${stats.budgetVariance}% variance`}
          trend="down"
          percentage={-4.5}
        />
        <StatCard
          title="Resource Utilization"
          value={`${stats.resourceUtilization}%`}
          icon={<PeopleIcon />}
          color={theme.palette.warning.main}
          subtext={`${stats.teamMembers} team members`}
          trend="up"
          percentage={6.3}
        />
      </Box>

      {/* Charts Row 1 */}
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
        {/* Financial Overview */}
        <Card sx={{ borderRadius: 2, height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Financial Overview
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Revenue, expenses, and profit trends
                </Typography>
              </Box>
              <Chip
                icon={<CalendarIcon />}
                label={`${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} View`}
                size="small"
                variant="outlined"
              />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart
                    data={financialData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.1)} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value / 1000}K`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, '']}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: theme.shadows[3] }}
                    />
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
                ) : chartType === 'line' ? (
                  <LineChart
                    data={financialData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.1)} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}K`} />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke={theme.palette.error.main}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Expenses"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke={theme.palette.success.main}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Profit"
                    />
                  </LineChart>
                ) : (
                  <AreaChart
                    data={financialData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.1)} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}K`} />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke={theme.palette.primary.main}
                      fill={alpha(theme.palette.primary.main, 0.3)}
                      name="Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="1"
                      stroke={theme.palette.error.main}
                      fill={alpha(theme.palette.error.main, 0.3)}
                      name="Expenses"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stackId="1"
                      stroke={theme.palette.success.main}
                      fill={alpha(theme.palette.success.main, 0.3)}
                      name="Profit"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Project Distribution */}
        <Card sx={{ borderRadius: 2, height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Project Distribution
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Resource allocation by project
                </Typography>
              </Box>
              <PieChartIcon color="action" />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => {
                      const total = projectData.reduce((sum, item) => sum + item.value, 0);
                      const percent = ((value / total) * 100).toFixed(0);
                      return `${name}: ${percent}%`;
                    }}
                  >
                    {projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box mt={2}>
              <Stack spacing={1}>
                {projectData.map((project) => {
                  const total = projectData.reduce((sum, item) => sum + item.value, 0);
                  const percent = ((project.value / total) * 100).toFixed(0);
                  return (
                    <Box key={project.name} display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: project.color,
                          }}
                        />
                        <Typography variant="body2">{project.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {percent}%
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Row 2 */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1fr 1fr'
          },
          gap: 3,
          mb: 4
        }}
      >
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
              <AssessmentIcon color="action" />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2
              }}
            >
              {performanceMetrics.map((metric) => (
                <PerformanceMetricCard key={metric.name} metric={metric} />
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card sx={{ borderRadius: 2, height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Department Performance
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Efficiency across departments
                </Typography>
              </Box>
              <PeopleIcon color="action" />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box height={350}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={departmentPerformance}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    fill={alpha(theme.palette.primary.main, 0.3)}
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Bottom Stats */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)'
          },
          gap: 3
        }}
      >
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Active Projects
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Current project status and progress
                </Typography>
              </Box>
              <Typography variant="h6" color="primary" fontWeight={700}>
                {stats.activeProjects}
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              {['E-commerce Platform', 'Mobile App', 'CRM System', 'Data Migration'].map((project) => (
                <Box key={project} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">{project}</Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box width={150}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.random() * 100}
                        color="primary"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {Math.floor(Math.random() * 100)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Insights
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Recent trends and observations
                </Typography>
              </Box>
              <TrendingUpIcon color="success" />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                  <ArrowUpIcon color="success" />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={500}>
                    Revenue growth accelerating
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    +12.5% compared to last month
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                  <ArrowDownIcon color="error" />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={500}>
                    Expense variance detected
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    -4.5% budget variance in operations
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                  <PeopleIcon color="warning" />
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={500}>
                    High resource utilization
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    78% utilization rate across teams
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Analytics;