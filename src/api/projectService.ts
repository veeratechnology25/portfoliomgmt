import { apiClient } from './apiClient';

export interface Project {
  id: number;
  code: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  budget: number;
  spent: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

export const projectService = {
  // Get all projects
  getProjects: async (): Promise<{ data: Project[] }> => {
    const response = await apiClient.get('/projects/projects/');
    return response.data;
  },

  // Get single project
  getProject: async (id: number): Promise<{ data: Project }> => {
    const response = await apiClient.get(`/projects/projects/${id}/`);
    return response.data;
  },

  // Create project
  createProject: async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await apiClient.post('/projects/projects/', projectData);
    return response.data;
  },

  // Update project
  updateProject: async (id: number, projectData: Partial<Project>) => {
    const response = await apiClient.patch(`/projects/projects/${id}/`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (id: number) => {
    await apiClient.delete(`/projects/projects/${id}/`);
  },

  // Get project statistics
  getProjectStats: async () => {
    const response = await apiClient.get('/projects/projects/stats/');
    return response.data;
  }
};
