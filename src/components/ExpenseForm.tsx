import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Tag, Calendar, FileText, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Expense } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { categoryService } from '../services/categoryService';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');


  // Load user categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      if (currentUser) {
        try {
          const categoryNames = await categoryService.getUserCategoryNames(currentUser.id);
          setCustomCategories(categoryNames);
        } catch (error) {
          console.error('Error loading categories:', error);
        }
      }
    };

    loadCategories();
  }, [currentUser]);

  // Get all available categories (user-defined only)
  const getAllCategories = () => {
    return customCategories;
  };

  const handleAddCustomCategory = async () => {
    if (!currentUser || !newCategoryName.trim() || getAllCategories().includes(newCategoryName.trim())) {
      return;
    }

    try {
      await categoryService.addCategory(currentUser.id, {
        name: newCategoryName.trim()
      });

      // Reload categories
      const categoryNames = await categoryService.getUserCategoryNames(currentUser.id);
      setCustomCategories(categoryNames);
      setCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
      // TODO: Show error message to user
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      onAddExpense({
        amount: parseFloat(amount),
        description,
        category,
        date
      });

      // Reset form
      setAmount('');
      setDescription('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('expenseForm.title')}</h2>
          <p className="text-sm sm:text-base text-gray-600">{t('expenseForm.subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('expenseForm.amount')}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="responsive-input w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t('expenseForm.amountPlaceholder')}
                    inputMode="decimal"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('expenseForm.date')}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="responsive-input w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('expenseForm.description')}
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="responsive-input w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={t('expenseForm.descriptionPlaceholder')}
                  required
                />
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('expenseForm.category')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(true)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium self-start sm:self-auto"
                >
                  {t('expenseForm.addCustomCategory')}
                </button>
              </div>

              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                {customCategories.length === 0 ? (
                  <div className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
                    <div className="text-gray-500 text-sm">
                      {t('expenseForm.noCategoriesMessage')}
                    </div>
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="responsive-select w-full pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none bg-white cursor-pointer hover:border-gray-400"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.25em 1.25em',
                      minHeight: '3rem'
                    }}
                    required
                  >
                    <option value="">{t('expenseForm.selectCategory')}</option>
                    {/* User-defined categories only */}
                    {customCategories.map((customCat) => (
                      <option key={customCat} value={customCat}>{customCat}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* No categories help message */}
              {customCategories.length === 0 && (
                <div className="mt-3 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-800 text-sm font-medium mb-1">
                    {t('expenseForm.noCategoriesTitle')}
                  </p>
                  <p className="text-blue-700 text-xs sm:text-sm">
                    {t('expenseForm.noCategoriesHelp')}
                  </p>
                </div>
              )}

              {/* Add custom category modal */}
              {showAddCategory && (
                <div className="responsive-modal bg-black bg-opacity-50">
                  <div className="responsive-modal-content bg-white rounded-xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 pr-2">
                        {t('expenseForm.addCustomCategoryTitle')}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategoryName('');
                        }}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder={t('expenseForm.categoryNamePlaceholder')}
                        className="responsive-input w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                        autoFocus
                      />

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={handleAddCustomCategory}
                          disabled={!newCategoryName.trim() || getAllCategories().includes(newCategoryName.trim())}
                          className="w-full sm:flex-1 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {t('common.add')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddCategory(false);
                            setNewCategoryName('');
                          }}
                          className="w-full sm:flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 font-medium"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}


            </div>

            <div className="col-span-1 lg:col-span-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !amount || !description || !category || customCategories.length === 0}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 sm:py-4 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t('expenseForm.adding')}
                  </div>
                ) : (
                  t('expenseForm.addButton')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};