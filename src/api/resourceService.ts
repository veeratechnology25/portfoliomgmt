import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://portfoliomgmt-backend.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ ALWAYS DO THIS
api.interceptors.request.use((config) => {
  const token = authService.getAuthToken(); // MUST be synchronous
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Ensure we NEVER send an empty Bearer header
    delete config.headers.Authorization;
  }
  return config;
});

export default api;


export interface ResourceAllocation {
  id: string;
  project: {
    id: string;
    name: string;
  };
  employee: {
    id: string;
    name: string;
    email: string;
  };
  allocation_percentage: number;
  start_date: string;
  end_date: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  hourly_rate: number;
  estimated_cost: number;
  actual_cost: number;
  created_at: string;
  updated_at: string;
}

export interface Timesheet {
  id: string;
  employee: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  week_start_date: string;
  week_end_date: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  employee: {
    id: string;
    name: string;
  };
  leave_type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid' | 'other';
  start_date: string;
  end_date: string;
  total_days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceRequest {
  id: string;
  project: {
    id: string;
    name: string;
  };
  requested_by: {
    id: string;
    name: string;
  };
  request_type: 'new' | 'replacement' | 'additional' | 'extension';
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export const resourceService = {
  // Resource Allocations
  getAllocations: async (): Promise<{ data: ResourceAllocation[] }> => {
    const response = await api.get('/resources/allocations/');
    return response.data;
  },

  createAllocation: async (data: Partial<ResourceAllocation>) => {
    const response = await api.post('/resources/allocations/', data);
    return response.data;
  },

  updateAllocation: async (id: string, data: Partial<ResourceAllocation>) => {
    const response = await api.put(`/resources/allocations/${id}/`, data);
    return response.data;
  },

  deleteAllocation: async (id: string) => {
    await api.delete(`/resources/allocations/${id}/`);
  },

  // Timesheets
  getTimesheets: async (): Promise<{ data: Timesheet[] }> => {
    const response = await api.get('/resources/timesheets/');
    return response.data;
  },

  createTimesheet: async (data: Partial<Timesheet>) => {
    const response = await api.post('/resources/timesheets/', data);
    return response.data;
  },

  updateTimesheet: async (id: string, data: Partial<Timesheet>) => {
    const response = await api.put(`/resources/timesheets/${id}/`, data);
    return response.data;
  },

  submitTimesheet: async (id: string) => {
    const response = await api.post(`/resources/timesheets/${id}/submit/`);
    return response.data;
  },

  approveTimesheet: async (id: string) => {
    const response = await api.post(`/resources/timesheets/${id}/approve/`);
    return response.data;
  },

  // Leave Requests
  getLeaveRequests: async (): Promise<{ data: LeaveRequest[] }> => {
    const response = await api.get('/resources/leaves/');
    return response.data;
  },

  createLeaveRequest: async (data: Partial<LeaveRequest>) => {
    const response = await api.post('/resources/leaves/', data);
    return response.data;
  },

  updateLeaveRequest: async (id: string, data: Partial<LeaveRequest>) => {
    const response = await api.put(`/resources/leaves/${id}/`, data);
    return response.data;
  },

  approveLeaveRequest: async (id: string) => {
    const response = await api.post(`/resources/leaves/${id}/approve/`);
    return response.data;
  },

  rejectLeaveRequest: async (id: string, reason: string) => {
    const response = await api.post(`/resources/leaves/${id}/reject/`, { reason });
    return response.data;
  },

  // Resource Requests
  getResourceRequests: async (): Promise<{ data: ResourceRequest[] }> => {
    const response = await api.get('/resources/requests/');
    return response.data;
  },

  createResourceRequest: async (data: Partial<ResourceRequest>) => {
    const response = await api.post('/resources/requests/', data);
    return response.data;
  },

  updateResourceRequest: async (id: string, data: Partial<ResourceRequest>) => {
    const response = await api.put(`/resources/requests/${id}/`, data);
    return response.data;
  },

  approveResourceRequest: async (id: string) => {
    const response = await api.post(`/resources/requests/${id}/approve/`);
    return response.data;
  },

  rejectResourceRequest: async (id: string, reason: string) => {
    const response = await api.post(`/resources/requests/${id}/reject/`, { reason });
    return response.data;
  },

  fulfillResourceRequest: async (id: string) => {
    const response = await api.post(`/resources/requests/${id}/fulfill/`);
    return response.data;
  },
};
