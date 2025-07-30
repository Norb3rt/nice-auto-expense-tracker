import { Expense, User } from '../types';

const STORAGE_KEYS = {
  EXPENSES: 'niceauto_expenses',
  USER: 'niceauto_user',
  AUTH_TOKEN: 'niceauto_auth'
};

export const storage = {
  getExpenses: (): Expense[] => {
    const expenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return expenses ? JSON.parse(expenses) : [];
  },

  saveExpenses: (expenses: Expense[]): void => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  getUser: (): User | null => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  saveUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getAuthToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  saveAuthToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

export const exportToCSV = (expenses: Expense[]): void => {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Created At'];
  const csvContent = [
    headers.join(','),
    ...expenses.map(expense => [
      expense.date,
      `"${expense.description}"`,
      expense.category,
      expense.amount,
      expense.createdAt
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportToJSON = (expenses: Expense[]): void => {
  const jsonContent = JSON.stringify(expenses, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const importFromJSON = (file: File): Promise<Expense[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const expenses = JSON.parse(e.target?.result as string);
        resolve(expenses);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
export const generateDemoData = (): Expense[] => [
  {
    id: '1',
    amount: 45.50,
    description: 'Grocery shopping',
    category: 'Food & Dining',
    date: '2025-01-15',
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    amount: 120.00,
    description: 'Gas station',
    category: 'Transportation',
    date: '2025-01-14',
    createdAt: '2025-01-14T15:45:00Z'
  },
  {
    id: '3',
    amount: 89.99,
    description: 'Internet bill',
    category: 'Utilities',
    date: '2025-01-13',
    createdAt: '2025-01-13T09:15:00Z'
  },
  {
    id: '4',
    amount: 25.00,
    description: 'Coffee shop',
    category: 'Food & Dining',
    date: '2025-01-12',
    createdAt: '2025-01-12T08:20:00Z'
  },
  {
    id: '5',
    amount: 350.00,
    description: 'Monthly rent',
    category: 'Housing',
    date: '2025-01-01',
    createdAt: '2025-01-01T12:00:00Z'
  }
];