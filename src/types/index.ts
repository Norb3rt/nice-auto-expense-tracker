export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CategoryData {
  category: string;
  amount: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  amount: number;
}