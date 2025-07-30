import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, PieChart } from 'lucide-react';
import { Expense } from '../../types';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, startOfYear, endOfYear } from 'date-fns';

interface AdvancedAnalyticsProps {
  expenses: Expense[];
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ expenses }) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const currentYear = startOfYear(now);
    const currentYearEnd = endOfYear(now);

    // Current month expenses
    const currentMonthExpenses = expenses.filter(expense =>
      isWithinInterval(new Date(expense.date), { start: currentMonth, end: currentMonthEnd })
    );

    // Last month expenses
    const lastMonthExpenses = expenses.filter(expense =>
      isWithinInterval(new Date(expense.date), { start: lastMonth, end: lastMonthEnd })
    );

    // Current year expenses
    const currentYearExpenses = expenses.filter(expense =>
      isWithinInterval(new Date(expense.date), { start: currentYear, end: currentYearEnd })
    );

    const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const currentYearTotal = currentYearExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const monthlyChange = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    const dailyAverage = currentMonthTotal / now.getDate();
    const yearlyAverage = currentYearTotal / (now.getMonth() + 1);

    // Category analysis
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];
    const categoryCount = Object.keys(categoryTotals).length;

    // Spending patterns
    const weekdaySpending = expenses.reduce((acc, expense) => {
      const day = new Date(expense.date).getDay();
      acc[day] = (acc[day] || 0) + expense.amount;
      return acc;
    }, {} as Record<number, number>);

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const topSpendingDay = Object.entries(weekdaySpending)
      .sort(([,a], [,b]) => b - a)[0];

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthExpenses = expenses.filter(expense =>
        isWithinInterval(new Date(expense.date), { start: monthStart, end: monthEnd })
      );
      
      monthlyTrend.push({
        month: format(month, 'MMM'),
        total: monthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        count: monthExpenses.length
      });
    }

    return {
      currentMonthTotal,
      lastMonthTotal,
      currentYearTotal,
      monthlyChange,
      dailyAverage,
      yearlyAverage,
      topCategory,
      categoryCount,
      topSpendingDay: topSpendingDay ? {
        day: weekdays[parseInt(topSpendingDay[0])],
        amount: topSpendingDay[1]
      } : null,
      monthlyTrend,
      totalTransactions: expenses.length,
      averageTransaction: expenses.length > 0 ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length : 0
    };
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">This Month</p>
              <p className="text-2xl font-bold text-blue-900">${analytics.currentMonthTotal.toFixed(2)}</p>
              <div className="flex items-center mt-2">
                {analytics.monthlyChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  analytics.monthlyChange >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {Math.abs(analytics.monthlyChange).toFixed(1)}% vs last month
                </span>
              </div>
            </div>
            <div className="bg-blue-600 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">Daily Average</p>
              <p className="text-2xl font-bold text-green-900">${analytics.dailyAverage.toFixed(2)}</p>
              <p className="text-green-600 text-sm mt-2">This month</p>
            </div>
            <div className="bg-green-600 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm font-medium">Top Category</p>
              <p className="text-lg font-bold text-purple-900">
                {analytics.topCategory ? analytics.topCategory[0] : 'N/A'}
              </p>
              <p className="text-purple-600 text-sm mt-2">
                ${analytics.topCategory ? analytics.topCategory[1].toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-purple-600 p-3 rounded-xl">
              <PieChart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 text-sm font-medium">Avg Transaction</p>
              <p className="text-2xl font-bold text-orange-900">${analytics.averageTransaction.toFixed(2)}</p>
              <p className="text-orange-600 text-sm mt-2">{analytics.totalTransactions} total</p>
            </div>
            <div className="bg-orange-600 p-3 rounded-xl">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">6-Month Spending Trend</h3>
          <div className="space-y-3">
            {analytics.monthlyTrend.map((month, index) => {
              const maxAmount = Math.max(...analytics.monthlyTrend.map(m => m.total));
              const percentage = maxAmount > 0 ? (month.total / maxAmount) * 100 : 0;
              
              return (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-sm font-medium text-gray-700 w-8">{month.month}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-sm font-semibold text-gray-900">${month.total.toFixed(2)}</span>
                    <p className="text-xs text-gray-500">{month.count} transactions</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Monthly Comparison</p>
                <p className="text-xs text-gray-600">
                  You spent ${Math.abs(analytics.currentMonthTotal - analytics.lastMonthTotal).toFixed(2)} {' '}
                  {analytics.currentMonthTotal > analytics.lastMonthTotal ? 'more' : 'less'} than last month
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Spending Pattern</p>
                <p className="text-xs text-gray-600">
                  {analytics.topSpendingDay ? 
                    `You spend most on ${analytics.topSpendingDay.day}s ($${analytics.topSpendingDay.amount.toFixed(2)} avg)` :
                    'No clear spending pattern detected'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <PieChart className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Category Diversity</p>
                <p className="text-xs text-gray-600">
                  You're tracking expenses across {analytics.categoryCount} different categories
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Target className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Yearly Projection</p>
                <p className="text-xs text-gray-600">
                  At current rate, you'll spend ~${(analytics.yearlyAverage * 12).toFixed(2)} this year
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};