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
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  Savings as SavingsIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, differenceInDays, isAfter, isBefore } from 'date-fns';
import { financeService, type Transaction, type Budget } from '../../api/financeService';

type TransactionType = 'income' | 'expense';
type TabValue = 'transactions' | 'budgets' | 'overview';
type TimeFilter = 'all' | 'month' | 'quarter' | 'year';

interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  budgetUtilization: number;
  activeBudgets: number;
  upcomingBudgets: number;
}

const transactionTypeConfig = {
  income: {
    icon: <IncomeIcon />,
    label: 'Income',
    color: 'success' as const,
    bgColor: '#d4edda',
  },
  expense: {
    icon: <ExpenseIcon />,
    label: 'Expense',
    color: 'error' as const,
    bgColor: '#f8d7da',
  },
};

const categoryColors = [
  '#3f51b5', '#2196f3', '#00bcd4', '#4caf50', '#8bc34a', '#cddc39',
  '#ff9800', '#ff5722', '#e91e63', '#9c27b0', '#673ab7', '#795548'
];

const Finance = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('overview');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Transaction | Budget | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null; type: TabValue }>({
    open: false,
    id: null,
    type: 'transactions',
  });
  const [stats, setStats] = useState<FinanceStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    budgetUtilization: 0,
    activeBudgets: 0,
    upcomingBudgets: 0,
  });

  interface FormData {
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string;
    name: string;
    start_date: string;
    end_date: string;
    budget?: number;
    spent?: number;
  }

  const [formData, setFormData] = useState<FormData>({
    type: 'expense',
    amount: 0,
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    name: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [transactions, budgets]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, budgetsRes] = await Promise.all([
        financeService.getTransactions(),
        financeService.getBudgets(),
      ]);
      setTransactions(transactionsRes.data);
      setBudgets(budgetsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const now = new Date();
    const activeBudgets = budgets.filter(b => 
      isAfter(now, new Date(b.start_date)) && isBefore(now, new Date(b.end_date))
    ).length;

    const upcomingBudgets = budgets.filter(b => 
      isBefore(now, new Date(b.start_date))
    ).length;

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    setStats({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      budgetUtilization,
      activeBudgets,
      upcomingBudgets,
    });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | { name?: string; value: string };
    const name = target.name as keyof FormData;
    const value = target.value;

    setFormData((prev) => {
      if (['amount', 'budget', 'spent'].includes(name as string)) {
        return {
          ...prev,
          [name]: parseFloat(value) || 0,
        };
      }

      if (name === 'type') {
        return {
          ...prev,
          type: value as TransactionType,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'transactions' || editingItem && 'type' in editingItem) {
        if (editingItem && 'id' in editingItem) {
          await financeService.updateTransaction(editingItem.id, formData);
        } else {
          await financeService.createTransaction(formData);
        }
      } else {
        if (editingItem && 'id' in editingItem) {
          await financeService.updateBudget(editingItem.id, formData);
        } else {
          await financeService.createBudget(formData);
        }
      }
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleDeleteClick = (id: number, type: TabValue) => {
    setDeleteDialog({ open: true, id, type });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.id) {
      try {
        if (deleteDialog.type === 'transactions') {
          await financeService.deleteTransaction(deleteDialog.id);
        } else {
          await financeService.deleteBudget(deleteDialog.id);
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
    setDeleteDialog({ open: false, id: null, type: 'transactions' });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, id: null, type: 'transactions' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getBudgetProgress = (budget: Budget) => {
    const spent = budget.spent || 0;
    const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100);
    const remaining = Math.max(0, budget.amount - spent);
    const isOverBudget = spent > budget.amount;
    const daysLeft = differenceInDays(new Date(budget.end_date), new Date());

    return {
      percentage,
      remaining,
      isOverBudget,
      daysLeft,
      status: isOverBudget ? 'Over Budget' : daysLeft < 0 ? 'Expired' : 'Active',
    };
  };

  const getCategoryColor = (category: string) => {
    const index = Math.abs(category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % categoryColors.length;
    return categoryColors[index];
  };

  const handleOpenDialog = (item: Transaction | Budget | null = null) => {
    setEditingItem(item);
    if (item) {
      const baseData = {
        ...item,
        date: 'date' in item && item.date ? item.date.toString().split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
        start_date: 'start_date' in item && item.start_date ? item.start_date.toString().split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
        end_date: 'end_date' in item && item.end_date ? item.end_date.toString().split('T')[0] : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        type: 'type' in item ? (item as Transaction).type : 'expense',
        amount: 'amount' in item ? item.amount : 0,
        category: 'category' in item ? (item as Transaction).category : '',
        description: 'description' in item ? (item as Transaction).description : '',
        name: 'name' in item ? (item as Budget).name : '',
      };
      setFormData(baseData);
    } else {
      setFormData({
        type: 'expense',
        amount: 0,
        category: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        name: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  const StatCard = ({ title, value, icon, color, subtext }: any) => (
    <Card
      sx={{
        height: '100%',
        borderLeft: `4px solid ${color}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight={600}>
              {typeof value === 'number' && title.includes('$') ? formatCurrency(value) : value}
            </Typography>
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
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Financial Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Comprehensive overview of your finances, budgets, and transactions
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add {activeTab === 'transactions' ? 'Transaction' : 'Budget'}
            </Button>
          </Stack>
        </Box>

        {/* Stats Overview */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)' 
            }, 
            gap: 3, 
            mb: 4 
          }}
        >
          <StatCard
            title="Total Income"
            value={stats.totalIncome}
            icon={<ArrowUpIcon />}
            color={theme.palette.success.main}
            subtext={`${transactions.filter(t => t.type === 'income').length} transactions`}
          />
          <StatCard
            title="Total Expenses"
            value={stats.totalExpenses}
            icon={<ArrowDownIcon />}
            color={theme.palette.error.main}
            subtext={`${transactions.filter(t => t.type === 'expense').length} transactions`}
          />
          <StatCard
            title="Net Balance"
            value={stats.netBalance}
            icon={<MoneyIcon />}
            color={stats.netBalance >= 0 ? theme.palette.success.main : theme.palette.error.main}
            subtext={stats.netBalance >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
          />
          <StatCard
            title="Active Budgets"
            value={stats.activeBudgets}
            icon={<WalletIcon />}
            color={theme.palette.primary.main}
            subtext={`${stats.upcomingBudgets} upcoming`}
          />
          <StatCard
            title="Budget Utilization"
            value={`${stats.budgetUtilization.toFixed(1)}%`}
            icon={<SavingsIcon />}
            color={stats.budgetUtilization > 90 ? theme.palette.error.main : stats.budgetUtilization > 70 ? theme.palette.warning.main : theme.palette.success.main}
            subtext={stats.budgetUtilization > 90 ? 'High utilization' : stats.budgetUtilization > 70 ? 'Moderate utilization' : 'Good utilization'}
          />
          <StatCard
            title="Total Transactions"
            value={transactions.length}
            icon={<ReceiptIcon />}
            color={theme.palette.info.main}
            subtext={`${categories.length} categories`}
          />
        </Box>

        {/* Tabs and Content */}
        <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  py: 2,
                  fontWeight: 600,
                },
              }}
            >
              <Tab
                value="overview"
                label="Overview"
                icon={<MoneyIcon />}
                iconPosition="start"
              />
              <Tab
                value="transactions"
                label="Transactions"
                icon={<ReceiptIcon />}
                iconPosition="start"
              />
              <Tab
                value="budgets"
                label="Budgets"
                icon={<WalletIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Filters */}
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: 1, width: '100%' }}>
                <TextField
                  fullWidth
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <IncomeIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  size="small"
                />
              </Box>
              {(activeTab === 'transactions' || activeTab === 'overview') && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: getCategoryColor(category),
                            }}
                          />
                          {category}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                  label="Time Period"
                >
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="quarter">This Quarter</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    {/* Recent Transactions */}
                    <Box sx={{ flex: 1 }}>
                      <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          Recent Transactions
                        </Typography>
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                          {filteredTransactions.slice(0, 5).map((transaction) => (
                            <Box
                              key={transaction.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                py: 1.5,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                '&:last-child': { borderBottom: 'none' },
                              }}
                            >
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar
                                  sx={{
                                    bgcolor: alpha(
                                      transaction.type === 'income'
                                        ? theme.palette.success.main
                                        : theme.palette.error.main,
                                      0.1
                                    ),
                                    color:
                                      transaction.type === 'income'
                                        ? theme.palette.success.main
                                        : theme.palette.error.main,
                                    width: 40,
                                    height: 40,
                                  }}
                                >
                                  {transaction.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight={500}>
                                    {transaction.description || 'No description'}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {transaction.category} • {format(parseISO(transaction.date), 'MMM d')}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                color={
                                  transaction.type === 'income'
                                    ? 'success.main'
                                    : 'error.main'
                                }
                              >
                                {transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    </Box>

                    {/* Active Budgets */}
                    <Box sx={{ flex: 1 }}>
                      <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          Active Budgets
                        </Typography>
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                          {budgets
                            .filter((b) => {
                              const now = new Date();
                              return isAfter(now, new Date(b.start_date)) && isBefore(now, new Date(b.end_date));
                            })
                            .slice(0, 5)
                            .map((budget) => {
                              const progress = getBudgetProgress(budget);
                              return (
                                <Box
                                  key={budget.id}
                                  sx={{
                                    py: 2,
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                    '&:last-child': { borderBottom: 'none' },
                                  }}
                                >
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="body1" fontWeight={500}>
                                      {budget.name}
                                    </Typography>
                                    <Chip
                                      label={progress.status}
                                      size="small"
                                      color={
                                        progress.status === 'Over Budget'
                                          ? 'error'
                                          : progress.status === 'Expired'
                                          ? 'warning'
                                          : 'success'
                                      }
                                      variant="outlined"
                                    />
                                  </Box>
                                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                                    <Box flex={1}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={Math.min(progress.percentage, 100)}
                                        color={progress.isOverBudget ? 'error' : 'primary'}
                                        sx={{ height: 8, borderRadius: 4 }}
                                      />
                                    </Box>
                                    <Typography variant="body2" fontWeight={600} minWidth={40}>
                                      {progress.percentage}%
                                    </Typography>
                                  </Box>
                                  <Box display="flex" justifyContent="space-between">
                                    <Typography variant="caption" color="textSecondary">
                                      Spent: {formatCurrency(budget.spent || 0)}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      Remaining: {formatCurrency(progress.remaining)}
                                    </Typography>
                                  </Box>
                                </Box>
                              );
                            })}
                        </Box>
                      </Paper>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Transactions Tab */}
              {activeTab === 'transactions' && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar
                                  sx={{
                                    bgcolor: alpha(
                                      transaction.type === 'income'
                                        ? theme.palette.success.main
                                        : theme.palette.error.main,
                                      0.1
                                    ),
                                    color:
                                      transaction.type === 'income'
                                        ? theme.palette.success.main
                                        : theme.palette.error.main,
                                    width: 36,
                                    height: 36,
                                  }}
                                >
                                  {transaction.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight={500}>
                                    {transaction.description || 'No description'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={transaction.category}
                                size="small"
                                icon={<CategoryIcon />}
                                sx={{
                                  bgcolor: alpha(getCategoryColor(transaction.category), 0.1),
                                  color: getCategoryColor(transaction.category),
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={transaction.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
                                label={transactionTypeConfig[transaction.type].label}
                                color={transactionTypeConfig[transaction.type].color}
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                              >
                                {transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <CalendarIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {format(parseISO(transaction.date), 'MMM d, yyyy')}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDialog(transaction)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClick(transaction.id, 'transactions')}
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
                              <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                              <Typography variant="h6" gutterBottom>
                                No transactions found
                              </Typography>
                              <Typography variant="body2" color="textSecondary" mb={2}>
                                {searchTerm || categoryFilter !== 'all'
                                  ? 'Try adjusting your search or filter'
                                  : 'Add your first transaction to get started'}
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                              >
                                Add Transaction
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Budgets Tab */}
              {activeTab === 'budgets' && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Budget Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Remaining</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredBudgets.length > 0 ? (
                        filteredBudgets.map((budget) => {
                          const progress = getBudgetProgress(budget);
                          
                          return (
                            <TableRow key={budget.id} hover>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Avatar
                                    sx={{
                                      bgcolor: alpha(
                                        progress.isOverBudget
                                          ? theme.palette.error.main
                                          : theme.palette.success.main,
                                        0.1
                                      ),
                                      color: progress.isOverBudget
                                        ? theme.palette.error.main
                                        : theme.palette.success.main,
                                      width: 36,
                                      height: 36,
                                    }}
                                  >
                                    <WalletIcon />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body1" fontWeight={500}>
                                      {budget.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {formatCurrency(budget.spent || 0)} spent
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" fontWeight={600}>
                                  {formatCurrency(budget.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box width={180}>
                                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="caption" color="textSecondary">
                                      Progress
                                    </Typography>
                                    <Typography variant="caption" fontWeight={600}>
                                      {progress.percentage}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(progress.percentage, 100)}
                                    color={progress.isOverBudget ? 'error' : 'primary'}
                                    sx={{ height: 8, borderRadius: 4 }}
                                  />
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body1"
                                  fontWeight={600}
                                  color={progress.isOverBudget ? 'error.main' : 'text.primary'}
                                >
                                  {formatCurrency(progress.remaining)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={progress.status}
                                  size="small"
                                  color={
                                    progress.status === 'Over Budget'
                                      ? 'error'
                                      : progress.status === 'Expired'
                                      ? 'warning'
                                      : 'success'
                                  }
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2">
                                    {format(parseISO(budget.start_date), 'MMM d')} -{' '}
                                    {format(parseISO(budget.end_date), 'MMM d')}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {progress.daysLeft >= 0 ? `${progress.daysLeft} days left` : 'Expired'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenDialog(budget)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClick(budget.id, 'budgets')}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                            <Box sx={{ opacity: 0.5 }}>
                              <WalletIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                              <Typography variant="h6" gutterBottom>
                                No budgets found
                              </Typography>
                              <Typography variant="body2" color="textSecondary" mb={2}>
                                {searchTerm
                                  ? 'Try adjusting your search'
                                  : 'Create your first budget to get started'}
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                              >
                                Create Budget
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Paper>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {editingItem ? 'Edit' : 'Add New'}{' '}
              {editingItem && 'type' in editingItem ? 'Transaction' : 'Budget'}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {(!editingItem || 'type' in editingItem) ? (
              <>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    label="Type"
                  >
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <Typography color="textSecondary" sx={{ mr: 1 }}>
                        $
                      </Typography>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  margin="normal"
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    value={formData.date ? new Date(formData.date) : null}
                    onChange={(date) => {
                      const formattedDate = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
                      setFormData((prev) => ({ ...prev, date: formattedDate }));
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal',
                        required: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Budget Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <Typography color="textSecondary" sx={{ mr: 1 }}>
                        $
                      </Typography>
                    ),
                  }}
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <DatePicker
                      label="Start Date"
                      value={formData.start_date ? new Date(formData.start_date) : null}
                      onChange={(date) => {
                        const formattedDate = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
                        setFormData((prev) => ({ ...prev, start_date: formattedDate }));
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                        },
                      }}
                    />
                    <DatePicker
                      label="End Date"
                      value={formData.end_date ? new Date(formData.end_date) : null}
                      onChange={(date) => {
                        const formattedDate = date
                          ? format(date, 'yyyy-MM-dd')
                          : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
                        setFormData((prev) => ({ ...prev, end_date: formattedDate }));
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                        },
                      }}
                    />
                  </Box>
                </LocalizationProvider>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 120 }}>
              {editingItem ? 'Update' : 'Create'}
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
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={600}>
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography>
            Are you sure you want to delete this {deleteDialog.type === 'transactions' ? 'transaction' : 'budget'}?
            This action cannot be undone.
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

export default Finance;