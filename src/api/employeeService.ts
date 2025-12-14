import { apiClient } from './apiClient';

export interface Employee {
  id: string;
  email: string;
  username: string | null;   // ✅ allow null
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  department?: string | null;
  phone?: string;
}


export const employeeService = {
  // ✅ Get all employees
  getEmployees: async (): Promise<{ results: Employee[] }> => {
    const response = await apiClient.get('/auth/users/');
    return response.data;
  },

  // ✅ Create new team member
  createUser: async (data: Partial<Employee>) => {
    const response = await apiClient.post('/auth/users/', data);
    return response.data;
  },

  // ✅ Update existing team member
  updateUser: async (id: string, data: Partial<Employee>) => {
    const response = await apiClient.put(`/auth/users/${id}/`, data);
    return response.data;
  },

  // ✅ Optional: delete (for later use)
  deleteUser: async (id: string) => {
    return apiClient.delete(`/auth/users/${id}/`);
  },
};
