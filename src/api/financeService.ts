import { apiClient } from './apiClient';

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  project_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  name: string;
  amount: number;
  spent: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export const financeService = {
  // Transactions
  getTransactions: async (params?: any): Promise<{ data: Transaction[] }> => {
    const response = await apiClient.get('/finance/transactions/', { params });
    return response.data;
  },

  createTransaction: async (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await apiClient.post('/finance/transactions/', data);
    return response.data;
  },

  updateTransaction: async (id: number, data: Partial<Transaction>) => {
    const response = await apiClient.patch(`/finance/transactions/${id}/`, data);
    return response.data;
  },

  deleteTransaction: async (id: number) => {
    await apiClient.delete(`/finance/transactions/${id}/`);
  },

  // Budgets
  getBudgets: async (): Promise<{ data: Budget[] }> => {
    const response = await apiClient.get('/finance/budgets/');
    return response.data;
  },

  createBudget: async (data: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'spent'>) => {
    const response = await apiClient.post('/finance/budgets/', data);
    return response.data;
  },

  updateBudget: async (id: number, data: Partial<Budget>) => {
    const response = await apiClient.patch(`/finance/budgets/${id}/`, data);
    return response.data;
  },

  deleteBudget: async (id: number) => {
    await apiClient.delete(`/finance/budgets/${id}/`);
  },

  // Reports
  getFinancialReports: async (params: any) => {
    const response = await apiClient.get('/finance/reports/', { params });
    return response.data;
  },

  // Summary
  getFinancialSummary: async () => {
    const response = await apiClient.get('/finance/summary/');
    return response.data;
  }
};
