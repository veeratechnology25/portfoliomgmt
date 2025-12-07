import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme/theme';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/index';
import Projects from './pages/Projects';
import Finance from './pages/Finance';
import Resources from './pages/Resources';
import Analytics from './pages/Analytics';
import { Suspense } from 'react';
import LoadingScreen from './components/common/LoadingScreen';
import ProfilePage from "./pages/Profile";

// Create a client for React Query
const queryClient = new QueryClient();

// Protected Route component
type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

const ProtectedRoute = ({ children, redirectTo = "/dashboard" }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: redirectTo }} replace />;
  }

  console.log('User is authenticated, rendering protected content');
  return <>{children}</>;
};

// Main App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes - all routes under Layout */}
                <Route element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="projects/*" element={<Projects />} />
                  <Route path="finance/*" element={<Finance />} />
                  <Route path="resources/*" element={<Resources />} />
                  <Route path="analytics" element={<Analytics />} />

<Route path="/profile" element={<ProfilePage />} />

                  {/* 404 - Not Found - redirects to dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-left" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;