import React from 'react';
import { Home, Plus, List, BarChart3 } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'add-expense', label: 'Add', icon: Plus },
    { id: 'expenses', label: 'Expenses', icon: List },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};