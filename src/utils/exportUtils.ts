import { Expense } from '../types';

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
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
