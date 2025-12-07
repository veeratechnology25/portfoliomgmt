import { 
  Box, 
  Container, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Button,
  CircularProgress,
  Paper,
  Fade
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: ReactNode;
}

interface PageWrapperProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  sx?: SxProps<Theme>;
  headerAction?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  backButtonText?: string;
  showFooter?: boolean;
  containerProps?: any;
  contentSx?: SxProps<Theme>;
}

const PageWrapper = ({
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  sx = {},
  headerAction,
  breadcrumbs,
  loading = false,
  error = null,
  onRetry,
  showBackButton = false,
  onBack,
  backButtonText = 'Back',
  showFooter = true,
  containerProps = {},
  contentSx = {},
}: PageWrapperProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: <HomeIcon fontSize="small" /> 
    },
    ...(location.pathname.split('/')
      .filter(Boolean)
      .filter(path => path !== 'dashboard')
      .map((path, index, arr) => ({
        label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
        path: '/' + arr.slice(0, index + 1).join('/'),
      }))),
  ];

  const crumbs = breadcrumbs || defaultBreadcrumbs;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Get app version from environment or use default
  const appVersion = import.meta.env?.VITE_APP_VERSION || 
                    (window as any).ENV?.APP_VERSION || 
                    '1.0.0';

  if (loading) {
    return (
      <Container
        maxWidth={maxWidth}
        sx={{
          py: 8,
          px: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          ...sx,
        }}
        {...containerProps}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Loading content...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth={maxWidth}
        sx={{
          py: 8,
          px: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          ...sx,
        }}
        {...containerProps}
      >
        <Typography variant="h4" color="error" gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
          {error.message || 'An unexpected error occurred while loading this page.'}
        </Typography>
        {onRetry && (
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2, ml: onRetry ? 2 : 0 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: 4,
        px: { xs: 2, sm: 3 },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)',
        animation: 'fadeIn 0.3s ease-in-out',
        ...sx,
      }}
      {...containerProps}
    >
      {/* Header Section */}
      <Fade in={true} timeout={300}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Breadcrumbs */}
          {(crumbs.length > 0 || showBackButton) && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              {showBackButton && (
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  sx={{ mr: 2, textTransform: 'none' }}
                  size="small"
                >
                  {backButtonText}
                </Button>
              )}
              
              <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
                sx={{ 
                  flexGrow: 1,
                  '& .MuiBreadcrumbs-ol': {
                    flexWrap: 'wrap',
                  },
                }}
              >
                {crumbs.map((crumb, index) => (
                  <Link
                    key={index}
                    component="button"
                    underline="hover"
                    color={index === crumbs.length - 1 ? 'primary.main' : 'text.secondary'}
                    onClick={() => crumb.path && navigate(crumb.path)}
                    sx={{ 
                      cursor: crumb.path ? 'pointer' : 'default',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontWeight: index === crumbs.length - 1 ? 600 : 400,
                    }}
                  >
                    {crumb.icon}
                    {crumb.label}
                  </Link>
                ))}
              </Breadcrumbs>
            </Box>
          )}

          {/* Title Section */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              {title && (
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ 
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: subtitle ? 0.5 : 0,
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="subtitle1"
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            {headerAction && (
              <Box sx={{ 
                width: { xs: '100%', sm: 'auto' },
                '& > *': { 
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                },
              }}>
                {headerAction}
              </Box>
            )}
          </Box>
        </Paper>
      </Fade>

      {/* Main Content */}
      <Fade in={true} timeout={500}>
        <Box 
          sx={{ 
            flex: 1, 
            width: '100%',
            animation: 'slideUp 0.4s ease-out',
            ...contentSx,
          }}
        >
          {children}
        </Box>
      </Fade>

      {/* Footer */}
      {showFooter && (
        <Fade in={true} timeout={700}>
          <Box sx={{ 
            mt: 6, 
            pt: 3, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            fontSize: '0.875rem',
            color: 'text.secondary'
          }}>
            <Typography variant="caption" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              © {new Date().getFullYear()} PFMS - Project Finance Management System v{appVersion}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                component="button"
                variant="caption"
                onClick={() => navigate('/privacy')}
                sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Privacy Policy
              </Link>
              <Link
                component="button"
                variant="caption"
                onClick={() => navigate('/terms')}
                sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Terms of Service
              </Link>
              <Link
                component="button"
                variant="caption"
                onClick={() => navigate('/help')}
                sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Help Center
              </Link>
              <Link
                component="button"
                variant="caption"
                onClick={() => window.open('mailto:support@pfms.com', '_blank')}
                sx={{ cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Contact Support
              </Link>
            </Box>
          </Box>
        </Fade>
      )}
    </Container>
  );
};

// Loading state wrapper component
const PageWrapperSkeleton = ({ 
  maxWidth = 'lg',
  sx = {},
  showHeader = true,
}: {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  sx?: SxProps<Theme>;
  showHeader?: boolean;
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: 4,
        px: { xs: 2, sm: 3 },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)',
        ...sx,
      }}
    >
      {showHeader && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Box sx={{ width: 100, height: 24, bgcolor: 'grey.200', borderRadius: 1 }} />
            <Box sx={{ width: 16, height: 16, bgcolor: 'grey.200', borderRadius: '50%' }} />
            <Box sx={{ width: 80, height: 24, bgcolor: 'grey.200', borderRadius: 1 }} />
          </Box>
          <Box sx={{ width: '60%', height: 40, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
          <Box sx={{ width: '40%', height: 24, bgcolor: 'grey.200', borderRadius: 1 }} />
        </Box>
      )}
      
      <Box sx={{ flex: 1 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4 
        }}>
          {[...Array(6)].map((_, index) => (
            <Box 
              key={index}
              sx={{ 
                height: 200, 
                bgcolor: 'grey.100', 
                borderRadius: 2,
                animation: 'pulse 2s infinite'
              }}
            />
          ))}
        </Box>
        
        <Box sx={{ height: 400, bgcolor: 'grey.100', borderRadius: 2 }} />
      </Box>
    </Container>
  );
};

// Error state wrapper component
const PageWrapperError = ({ 
  error, 
  onRetry,
  maxWidth = 'lg',
  sx = {},
}: {
  error: Error;
  onRetry?: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  sx?: SxProps<Theme>;
}) => {
  const navigate = useNavigate();
  
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: 8,
        px: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        ...sx,
      }}
    >
      <Typography variant="h4" color="error" gutterBottom>
        Unable to Load Page
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
        {error.message || 'There was a problem loading this page. Please try again.'}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {onRetry && (
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        
        <Button
          variant="text"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

// Export all components
export default PageWrapper;
export { PageWrapperSkeleton, PageWrapperError };