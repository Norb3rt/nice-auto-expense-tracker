import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, FileText } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Expense } from '../types';
import { format, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { exportToCSV } from '../utils/storage';
import { generatePDFReport, generateMonthlyComparison, ReportOptions } from '../utils/pdfGenerator';
import { ReportFilters } from './Reports/ReportFilters';
import { AdvancedAnalytics } from './Reports/AdvancedAnalytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ReportsProps {
  expenses: Expense[];
}

export const Reports: React.FC<ReportsProps> = ({ expenses }) => {
  const { t } = useTranslation();
  const categories = [...new Set(expenses.map(expense => expense.category))];

  const handleGenerateReport = (options: ReportOptions) => {
    generatePDFReport(expenses, options);
  };

  const handleGenerateMonthlyComparison = () => {
    generateMonthlyComparison(expenses);
  };

  const handleExportCSV = () => {
    exportToCSV(expenses);
  };

  const categoryData = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ];

    return {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: colors.slice(0, Object.keys(categoryTotals).length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    const monthlyTotals = last6Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthTotal = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= monthStart && expenseDate <= monthEnd;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      return {
        month: format(month, 'MMM'),
        amount: monthTotal
      };
    });

    return {
      labels: monthlyTotals.map(item => item.month),
      datasets: [{
        label: 'Monthly Expenses',
        data: monthlyTotals.map(item => item.amount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        borderRadius: 8,
      }]
    };
  }, [expenses]);

  const trendData = useMemo(() => {
    const last12Months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date()
    });

    const trendTotals = last12Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthTotal = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= monthStart && expenseDate <= monthEnd;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      return monthTotal;
    });

    return {
      labels: last12Months.map(month => format(month, 'MMM')),
      datasets: [{
        label: 'Spending Trend',
        data: trendTotals,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      }]
    };
  }, [expenses]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: string | number) {
            return '$' + value.toFixed(0);
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: { label: string; parsed: number; dataset: { data: number[] } }) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h2>
          <p className="text-gray-600 mt-1">{t('reports.subtitle')}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
          <FileText className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Report Filters */}
      <ReportFilters
        onGenerateReport={handleGenerateReport}
        onGenerateMonthlyComparison={handleGenerateMonthlyComparison}
        onExportCSV={handleExportCSV}
        categories={categories}
      />

      {/* Advanced Analytics */}
      <AdvancedAnalytics expenses={expenses} />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">{t('reports.totalExpenses')}</p>
              <p className="text-2xl font-bold text-blue-900">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-blue-600 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">{t('reports.averageExpense')}</p>
              <p className="text-2xl font-bold text-green-900">${avgExpense.toFixed(2)}</p>
            </div>
            <div className="bg-green-600 p-3 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm font-medium">{t('reports.categories')}</p>
              <p className="text-2xl font-bold text-purple-900">{categoryData.labels.length}</p>
            </div>
            <div className="bg-purple-600 p-3 rounded-xl">
              <PieChartIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div id="charts-container" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div id="pie-chart-container" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.spendingByCategory')}</h3>
          <div className="h-80">
            <Pie data={categoryData} options={pieOptions} />
          </div>
        </div>

        <div id="bar-chart-container" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.monthlyExpensesLast6')}</h3>
          <div className="h-80">
            <Bar data={monthlyData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div id="line-chart-container" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('reports.spendingTrendLast12')}</h3>
        <div className="h-80">
          <Line data={trendData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};