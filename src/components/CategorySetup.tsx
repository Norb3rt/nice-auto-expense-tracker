import React, { useState } from 'react';
import { Plus, Tag, ArrowRight, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { categoryService } from '../services/categoryService';

interface CategorySetupProps {
  onComplete: (categories: string[]) => void;
  onSkip: () => void;
}

export const CategorySetup: React.FC<CategorySetupProps> = ({ onComplete, onSkip }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');


  // Suggested categories for quick setup
  const suggestedCategories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Housing'
  ];

  const handleAddCategory = (categoryName: string) => {
    const trimmedName = categoryName.trim();
    if (trimmedName && !categories.includes(trimmedName)) {
      setCategories([...categories, trimmedName]);
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(cat => cat !== categoryToRemove));
  };

  const handleAddCustomCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories([...categories, newCategoryName.trim()]);
      setNewCategoryName('');
    }
  };

  const handleComplete = async () => {
    if (!currentUser || categories.length === 0) return;

    try {
      // Create categories in Firebase
      for (const categoryName of categories) {
        await categoryService.addCategory(currentUser.id, {
          name: categoryName
        });
      }

      onComplete(categories);
    } catch (error) {
      console.error('Error creating categories:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Tag className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('categorySetup.title')}
          </h2>
          <p className="text-gray-600">
            {t('categorySetup.subtitle')}
          </p>
        </div>

        {/* Suggested Categories */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {t('categorySetup.suggestedCategories')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {suggestedCategories.map((suggested) => {
              const isSelected = categories.includes(suggested);
              return (
                <button
                  key={suggested}
                  onClick={() => isSelected ? handleRemoveCategory(suggested) : handleAddCategory(suggested)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{suggested}</span>
                    {isSelected && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Add Custom Category */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {t('categorySetup.addCustomCategory')}
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t('categorySetup.customCategoryPlaceholder')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomCategory()}
            />
            <button
              onClick={handleAddCustomCategory}
              disabled={!newCategoryName.trim() || categories.includes(newCategoryName.trim())}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('common.add')}
            </button>
          </div>
        </div>

        {/* Selected Categories */}
        {categories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('categorySetup.selectedCategories')} ({categories.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-full"
                >
                  {category}
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onSkip}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
          >
            {t('categorySetup.skipForNow')}
          </button>
          <button
            onClick={handleComplete}
            disabled={categories.length === 0}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {t('categorySetup.continue')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
