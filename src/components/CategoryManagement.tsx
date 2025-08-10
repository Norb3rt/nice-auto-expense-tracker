import React, { useState, useEffect } from 'react';
import { Plus, Tag, Edit3, Trash2, AlertTriangle, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Expense } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { categoryService, Category } from '../services/categoryService';
import { expenseService } from '../services/expenseService';

interface CategoryManagementProps {
  expenses: Expense[];
  onUpdateExpenses: (expenses: Expense[]) => void;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  expenses
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [replacementCategory, setReplacementCategory] = useState('');


  useEffect(() => {
    const loadCategories = async () => {
      if (currentUser) {
        try {
          const userCategories = await categoryService.getUserCategories(currentUser.id);
          setCategories(userCategories);
        } catch (error) {
          console.error('Error loading categories:', error);
        }
      }
    };

    loadCategories();
  }, [currentUser]);

  const getCategoryUsageCount = (categoryName: string) => {
    return expenses.filter(expense => expense.category === categoryName).length;
  };

  const handleAddCategory = async () => {
    if (!currentUser) return;

    const trimmedName = newCategoryName.trim();
    if (trimmedName && !categories.some(cat => cat.name === trimmedName)) {
      try {
        await categoryService.addCategory(currentUser.id, {
          name: trimmedName
        });

        // Reload categories
        const userCategories = await categoryService.getUserCategories(currentUser.id);
        setCategories(userCategories);
        setNewCategoryName('');
      } catch (error) {
        console.error('Error adding category:', error);
        // TODO: Show error message to user
      }
    }
  };

  const handleEditCategory = async (oldName: string, newName: string) => {
    if (!currentUser) return;

    const trimmedName = newName.trim();
    const categoryToEdit = categories.find(cat => cat.name === oldName);

    if (trimmedName && trimmedName !== oldName && !categories.some(cat => cat.name === trimmedName) && categoryToEdit) {
      try {
        // Update category in Firebase
        await categoryService.updateCategory(categoryToEdit.id, {
          name: trimmedName
        });

        // Update all expenses that use this category
        const expensesToUpdate = expenses.filter(expense => expense.category === oldName);
        for (const expense of expensesToUpdate) {
          await expenseService.updateExpense(expense.id, {
            ...expense,
            category: trimmedName
          });
        }

        // Reload categories
        const userCategories = await categoryService.getUserCategories(currentUser.id);
        setCategories(userCategories);

        setEditingCategory(null);
        setEditCategoryName('');
      } catch (error) {
        console.error('Error editing category:', error);
        // TODO: Show error message to user
      }
    }
  };

  const handleDeleteCategory = async (categoryToDelete: string) => {
    if (!currentUser) return;

    const usageCount = getCategoryUsageCount(categoryToDelete);
    const categoryToDeleteObj = categories.find(cat => cat.name === categoryToDelete);

    if (!categoryToDeleteObj) return;

    if (usageCount > 0) {
      // Show confirmation dialog for categories in use
      setShowDeleteConfirm(categoryToDelete);
      return;
    }

    try {
      // Delete category directly if not in use
      await categoryService.deleteCategory(categoryToDeleteObj.id);

      // Reload categories
      const userCategories = await categoryService.getUserCategories(currentUser.id);
      setCategories(userCategories);
    } catch (error) {
      console.error('Error deleting category:', error);
      // TODO: Show error message to user
    }
  };

  const confirmDeleteCategory = async () => {
    if (!showDeleteConfirm || !currentUser) return;

    const categoryToDelete = showDeleteConfirm;
    const categoryToDeleteObj = categories.find(cat => cat.name === categoryToDelete);

    if (!categoryToDeleteObj) return;

    try {
      // Handle expenses with this category
      const expensesToUpdate = expenses.filter(expense => expense.category === categoryToDelete);

      if (replacementCategory) {
        // Replace category in all expenses
        for (const expense of expensesToUpdate) {
          await expenseService.updateExpense(expense.id, {
            ...expense,
            category: replacementCategory
          });
        }
      } else {
        // Delete expenses with this category
        for (const expense of expensesToUpdate) {
          await expenseService.deleteExpense(expense.id);
        }
      }

      // Delete the category
      await categoryService.deleteCategory(categoryToDeleteObj.id);

      // Reload categories
      const userCategories = await categoryService.getUserCategories(currentUser.id);
      setCategories(userCategories);

      setShowDeleteConfirm(null);
      setReplacementCategory('');
    } catch (error) {
      console.error('Error confirming category deletion:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('categoryManagement.title')}</h2>
        <p className="text-gray-600">{t('categoryManagement.subtitle')}</p>
      </div>

      {/* Add New Category */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('categoryManagement.addNewCategory')}</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t('categoryManagement.categoryNamePlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
          </div>
          <button
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim() || categories.some(cat => cat.name === newCategoryName.trim())}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('common.add')}
          </button>
        </div>
        {newCategoryName.trim() && categories.some(cat => cat.name === newCategoryName.trim()) && (
          <p className="text-red-500 text-sm mt-2">{t('categoryManagement.categoryExists')}</p>
        )}
      </div>

      {/* Category List with Edit/Delete Functionality */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('categoryManagement.yourCategories')} ({categories.length})
        </h3>

        {categories.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">{t('categoryManagement.noCategories')}</p>
            <p className="text-gray-400 text-sm">{t('categoryManagement.addFirstCategory')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => {
              const usageCount = getCategoryUsageCount(category.name);
              return (
                <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Tag className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editingCategory === category.name ? (
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditCategory(category.name, editCategoryName);
                          if (e.key === 'Escape') {
                            setEditingCategory(null);
                            setEditCategoryName('');
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900 block truncate">{category.name}</span>
                        {usageCount > 0 && (
                          <span className="text-sm text-gray-500">
                            {usageCount} {usageCount === 1 ? t('categoryManagement.expense') : t('categoryManagement.expenses')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {editingCategory === category.name ? (
                      <>
                        <button
                          onClick={() => handleEditCategory(category.name, editCategoryName)}
                          disabled={!editCategoryName.trim() || (editCategoryName.trim() !== category.name && categories.some(cat => cat.name === editCategoryName.trim()))}
                          className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('common.save')}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(null);
                            setEditCategoryName('');
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title={t('common.cancel')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingCategory(category.name);
                            setEditCategoryName(category.name);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.name)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t('categoryManagement.deleteConfirmTitle')}
              </h3>
            </div>

            <p className="text-gray-600 mb-4">
              {t('categoryManagement.deleteConfirmMessage', {
                category: showDeleteConfirm,
                count: getCategoryUsageCount(showDeleteConfirm)
              })}
            </p>

            {getCategoryUsageCount(showDeleteConfirm) > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('categoryManagement.replacementCategory')}
                </label>
                <select
                  value={replacementCategory}
                  onChange={(e) => setReplacementCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{t('categoryManagement.removeFromExpenses')}</option>
                  {categories.filter(cat => cat.name !== showDeleteConfirm).map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={confirmDeleteCategory}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-xl hover:bg-red-700"
              >
                {t('common.delete')}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(null);
                  setReplacementCategory('');
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-xl hover:bg-gray-300"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
