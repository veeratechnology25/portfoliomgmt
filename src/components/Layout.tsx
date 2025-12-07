import { useState, useCallback, memo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as ProjectsIcon,
  BusinessCenter as CompanyIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  People as ResourcesIcon,
  Person as PersonIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

// Define User interface
interface AppUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar?: string;
  company?: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: AppUser | null;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading?: boolean;
}

const drawerWidth = 260;
const collapsedDrawerWidth = 90;

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon fontSize="small" />,
    path: '/dashboard',
    ariaLabel: 'Navigate to Dashboard'
  },
  {
    text: 'Analytics',
    icon: <AnalyticsIcon fontSize="small" />,
    path: '/analytics',
    ariaLabel: 'View Analytics'
  },
  {
    text: 'Projects',
    icon: <ProjectsIcon fontSize="small" />,
    path: '/projects',
    ariaLabel: 'Navigate to Projects'
  },
  {
    text: 'Resources',
    icon: <ResourcesIcon fontSize="small" />,
    path: '/resources',
    ariaLabel: 'Navigate to Resources'
  },
  {
    text: 'Finance',
    icon: <CompanyIcon fontSize="small" />,
    path: '/finance',
    ariaLabel: 'Navigate to Finance'
  },
];

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3, 4),
  backgroundColor: theme.palette.background.default,
  minHeight: 'calc(100vh - 64px)',
  marginTop: '64px',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2, 3),
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    padding: theme.spacing(2),
  },
}));

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2.5, 0, 3),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
  minHeight: '64px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

// Drawer Content Component (Memoized)
interface DrawerContentProps {
  userData: AppUser | null;
  onNavigate: (path: string) => void;
  onDrawerToggle: () => void;
  onLogout: () => void;
  isMobile?: boolean;
  location: any;
}

const DrawerContent = memo(({
  userData,
  onNavigate,
  onDrawerToggle,
  onLogout,
  location,
  isMobile = false
}: DrawerContentProps) => {
  const theme = useTheme();
  const fullName = userData?.first_name && userData?.last_name
    ? `${userData.first_name} ${userData.last_name}`
    : userData?.email?.split('@')[0] || 'User';
  const userRole = userData?.role || 'User';
  const userInitial = fullName.charAt(0).toUpperCase() || 'U';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh' }}>
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              boxShadow: theme.shadows[2],
            }}
          >
            <CompanyIcon />
          </Avatar>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(90deg, #4361ee 0%, #3f37c9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            PFMS
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Project Finance System
          </Typography>
        </Box>
        <IconButton
          onClick={onDrawerToggle}
          size="small"
          aria-label="Collapse sidebar"
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
      </DrawerHeader>
      <Divider sx={{ mx: 2 }} />
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2, display: 'flex', flexDirection: 'column', gap: 2, px: 2 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                <Tooltip title={item.text} placement="right">
                  <ListItemButton
                    aria-label={item.ariaLabel}
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => onNavigate(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: 'initial',
                      px: 3,
                      mx: 1,
                      borderRadius: 2,
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                      '&:hover': {
                        bgcolor: isActive
                          ? alpha(theme.palette.primary.main, 0.12)
                          : alpha(theme.palette.action.hover, 0.5),
                      },
                      transition: theme.transitions.create(['background-color', 'border'], {
                        duration: theme.transitions.duration.shorter,
                      }),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 2.5,
                        justifyContent: 'center',
                        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                        fontSize: '0.9rem',
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Divider sx={{ mx: 2 }} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          px: 1,
        }}>
          <Avatar
            alt={fullName}
            src={userData?.avatar}
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              boxShadow: theme.shadows[1],
            }}
          >
            {userInitial}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {fullName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {userRole}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          sx={{
            justifyContent: 'flex-start',
            px: 3,
            py: 1.2,
            borderRadius: 2,
            textTransform: 'none',
            color: theme.palette.error.main,
            borderColor: alpha(theme.palette.error.main, 0.3),
            '&:hover': {
              borderColor: theme.palette.error.main,
              backgroundColor: alpha(theme.palette.error.main, 0.04),
            },
            transition: theme.transitions.create(['width', 'justify-content'], {
              duration: theme.transitions.duration.standard,
            }),
            width: '100%',
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
});

DrawerContent.displayName = 'DrawerContent';

// Custom hook for responsive layout
const useLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return {
    isMobile,
    isDesktop,
    drawerWidth: {
      expanded: 280,
      collapsed: 72,
      mobile: 280,
    },
    appBarHeight: 64,
  };
};

export default function Layout() {
  const { user, logout } = useAuth() as AuthContextType;
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isMobile } = useLayout();
  const [open, setOpen] = useState(!isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDrawerToggle = useCallback(() => {
    if (isMobile) {
      setMobileOpen(prev => !prev);
    } else {
      setOpen(prev => !prev);
    }
  }, [isMobile]);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  }, [navigate, isMobile]);

  const handleLogout = useCallback(() => {
    handleMenuClose();
    logout();
    navigate('/login');
  }, [logout, navigate, handleMenuClose]);

  const userData = user as AppUser | null;

  return (
    <>

      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBarStyled position="fixed">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ ml: 2 }}>
                PFMS
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigate(item.path)}
                  sx={{ textTransform: 'none' }}
                >
                  {item.text}
                </Button>
              ))}
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <IconButton
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                >
                  <PersonIcon />
                </IconButton>
                <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}>
                  {user?.name || 'User'}
                </Typography>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </Box>
            </Box>
          </Toolbar>
        </AppBarStyled>

        <Box
          component="nav"
          sx={{
            width: {
              sm: open ? drawerWidth : collapsedDrawerWidth
            },
            flexShrink: { sm: 0 },
          }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            <DrawerContent
              userData={userData}
              onNavigate={handleNavigate}
              onDrawerToggle={handleDrawerToggle}
              onLogout={handleLogout}
              location={location}
              isMobile={isMobile}
            />
          </Drawer>

          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: open ? drawerWidth : collapsedDrawerWidth,
                borderRight: `1px solid ${theme.palette.divider}`,
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                overflowX: 'hidden',
                position: 'fixed',
                height: '100vh',
                top: 0,
                left: 0,
              },
            }}
            open={open}
          >
            <DrawerContent
              open={open}
              isMobile={isMobile}
              location={location}
              userData={userData}
              onNavigate={handleNavigate}
              onDrawerToggle={handleDrawerToggle}
              onLogout={handleLogout}
            />
          </Drawer>
        </Box>

        <Main>
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4, pt: 2 }}>
            <Outlet />
          </Container>
        </Main>
      </Box>
    </>
  );
}