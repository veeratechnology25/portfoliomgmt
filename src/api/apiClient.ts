import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Extend the AxiosRequestConfig interface to include our custom _retry property
declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Function to get CSRF token
export const getCSRFToken = async (): Promise<string> => {
  try {
    // First try to get from cookies
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (csrfToken) return csrfToken;
    
    // If not in cookies, fetch from server
    const response = await axios.get(`${API_BASE_URL}/csrf/`, {
      withCredentials: true,
    });
    
    // The token might be in the response data or headers
    return response.data.csrfToken || response.headers['x-csrftoken'] || '';
  } catch (error) {
    console.error('Failed to get CSRF token', error);
    return '';
  }
};

// Request interceptor to add auth token and CSRF token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add auth token if exists
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for non-GET requests and non-token endpoints
    // if (config.method?.toUpperCase() !== 'GET' && 
    //     config.url !== '/token/' && 
    //     config.url !== '/token/refresh/') {
    //   const csrfToken = await getCSRFToken();
    //   if (csrfToken && config.headers) {
    //     config.headers['X-CSRFToken'] = csrfToken;
    //   }
    // }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await axios.post<{ access: string; refresh?: string }>(
          `${API_BASE_URL}/token/refresh/`,
          { refresh: refreshToken }
        );
        
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        if (refresh) {
          localStorage.setItem('refresh_token', refresh);
        }
        
        // Update the authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (error) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// Project type

export const authAPI = {
  login: async (email: string, password: string) => {
    // Get CSRF token first
    // await getCSRFToken();
    // Then make the login request
    return apiClient.post<{ 
      access: string; 
      refresh: string;
      user: any;
    }>('/auth/login/', { email, password });
  },
  
  register: async <T = any>(userData: any) => {
    // Get CSRF token first
    // await getCSRFToken();
    return apiClient.post<T>('/auth/register/', userData);
  },
    
  getProfile: <T = any>() =>
    apiClient.get<T>('/auth/profile/'),
    
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// Project type
type Project = {
  id: string;
  name: string;
  description?: string;
  // Add other project fields as needed
};

export const projectsAPI = {
  getProjects: () => apiClient.get<Project[]>('/projects/'),
  getProject: (id: string) => apiClient.get<Project>(`/projects/${id}/`),
  createProject: (data: Omit<Project, 'id'>) => apiClient.post<Project>('/projects/', data),
  updateProject: (id: string, data: Partial<Omit<Project, 'id'>>) => 
    apiClient.put<Project>(`/projects/${id}/`, data),
  deleteProject: (id: string) => apiClient.delete(`/projects/${id}/`),
};

// Add more API modules for other resources (finance, resources, etc.) as needed
