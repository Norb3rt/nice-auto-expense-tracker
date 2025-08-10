import React from 'react';
import { TrendingUp, DollarSign, Calendar, PieChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Expense } from '../types';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface DashboardProps {
  expenses: Expense[];
  onTabChange: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ expenses, onTabChange }) => {
  const { t } = useTranslation();
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const thisMonthExpenses = expenses.filter(expense =>
    isWithinInterval(new Date(expense.date), { start: monthStart, end: monthEnd })
  );

  const totalThisMonth = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgPerDay = totalThisMonth / new Date().getDate();

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const recentExpenses = expenses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>
        <p className="text-gray-600">{format(currentMonth, 'MMMM yyyy')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">{t('dashboard.thisMonth')}</p>
              <p className="text-2xl font-bold text-blue-900">${totalThisMonth.toFixed(2)}</p>
            </div>
            <div className="bg-blue-600 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">{t('dashboard.dailyAverage')}</p>
              <p className="text-2xl font-bold text-green-900">${avgPerDay.toFixed(2)}</p>
            </div>
            <div className="bg-green-600 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm font-medium">{t('dashboard.totalExpenses')}</p>
              <p className="text-2xl font-bold text-purple-900">{expenses.length}</p>
            </div>
            <div className="bg-purple-600 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 text-sm font-medium">{t('dashboard.categories')}</p>
              <p className="text-2xl font-bold text-orange-900">{Object.keys(categoryTotals).length}</p>
            </div>
            <div className="bg-orange-600 p-3 rounded-xl">
              <PieChart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.topCategories')}</h3>
            <button
              onClick={() => onTabChange('reports')}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200"
            >
              {t('dashboard.viewReports')}
            </button>
          </div>
          <div className="space-y-3">
            {topCategories.map(([category, amount], index) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                    }`}></div>
                  <span className="text-gray-700 font-medium">{category}</span>
                </div>
                <span className="text-gray-900 font-semibold">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.recentExpenses')}</h3>
            <button
              onClick={() => onTabChange('expenses')}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors duration-200"
            >
              {t('dashboard.viewAll')}
            </button>
          </div>
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-medium">{expense.description}</p>
                  <p className="text-gray-500 text-sm">{expense.category} • {format(new Date(expense.date), 'MMM dd')}</p>
                </div>
                <span className="text-gray-900 font-semibold">${expense.amount.toFixed(2)}</span>
              </div>
            ))}
            {recentExpenses.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">{t('dashboard.noExpenses')}</p>
                <button
                  onClick={() => onTabChange('add-expense')}
                  className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200"
                >
                  {t('dashboard.addFirstExpense')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
