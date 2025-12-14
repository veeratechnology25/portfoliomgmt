import { apiClient } from './apiClient';

export interface Employee {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}



export const employeeService = {

      // Get all getEmployees
      getEmployees: async (): Promise<{ results: Employee[] }> => {
        const response = await apiClient.get('/auth/users/');
        return response.data;
      },

}