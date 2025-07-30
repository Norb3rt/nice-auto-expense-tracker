import React, { useState } from 'react';
import { Calendar, Filter, Download, FileText, BarChart3 } from 'lucide-react';

interface ReportFiltersProps {
  onGenerateReport: (options: ReportOptions) => void;
  onGenerateMonthlyComparison: () => void;
  onExportCSV: () => void;
  categories: string[];
}

export interface ReportOptions {
  period: 'monthly' | 'yearly' | 'custom';
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  includeCharts?: boolean;
  groupBy?: 'category' | 'date' | 'amount';
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  onGenerateReport,
  onGenerateMonthlyComparison,
  onExportCSV,
  categories
}) => {
  const [period, setPeriod] = useState<'monthly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [groupBy, setGroupBy] = useState<'category' | 'date' | 'amount'>('category');

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleGenerateReport = () => {
    const options: ReportOptions = {
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      includeCharts,
      groupBy
    };
    
    onGenerateReport(options);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
          <Filter className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Report Configuration</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Period Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Report Period
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'monthly', label: 'This Month' },
                { value: 'yearly', label: 'This Year' },
                { value: 'custom', label: 'Custom Range' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPeriod(option.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    period === option.value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {period === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Group By
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="category">Category</option>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Categories (Optional)
            </label>
            <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
              {categories.map((category) => (
                <label key={category} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {selectedCategories.length} categories selected
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Include Charts in PDF</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleGenerateReport}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
        >
          <FileText className="w-4 h-4" />
          <span>Generate PDF Report</span>
        </button>

        <button
          onClick={onExportCSV}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onGenerateMonthlyComparison}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Monthly Comparison</span>
        </button>
      </div>
    </div>
  );
};