import React, { useState, useEffect } from 'react';
import { Login } from './components/Auth/Login';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Reports } from './components/Reports';
import { CategoryManagement } from './components/CategoryManagement';
import { CategorySetup } from './components/CategorySetup';
import { Expense, User } from './types';
import { storage, generateDemoData, getCustomCategories } from './utils/storage';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategorySetup, setShowCategorySetup] = useState(false);

  useEffect(() => {
    // Check for existing session
    const savedUser = storage.getUser();
    const authToken = storage.getAuthToken();

    if (savedUser && authToken) {
      setUser(savedUser);
      const savedExpenses = storage.getExpenses();
      const existingCategories = getCustomCategories();

      // Check if user needs category setup
      if (existingCategories.length === 0 && savedExpenses.length === 0) {
        setShowCategorySetup(true);
      } else if (savedExpenses.length === 0) {
        // If no expenses exist but categories exist, don't load demo data
        setExpenses([]);
      } else {
        setExpenses(savedExpenses);
      }
    }

    setIsLoading(false);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLogin = (email: string, _password: string) => {
    // Simulate authentication
    const newUser: User = {
      id: '1',
      name: email.split('@')[0],
      email
    };

    setUser(newUser);
    storage.saveUser(newUser);
    storage.saveAuthToken('demo-token-' + Date.now());

    // Check if new user needs category setup
    const existingCategories = getCustomCategories();
    const savedExpenses = storage.getExpenses();

    if (existingCategories.length === 0 && savedExpenses.length === 0) {
      setShowCategorySetup(true);
    } else if (savedExpenses.length === 0) {
      setExpenses([]);
    } else {
      setExpenses(savedExpenses);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setExpenses([]);
    storage.clearAll();
    setActiveTab('dashboard');
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    storage.saveExpenses(updatedExpenses);
    setActiveTab('dashboard'); // Navigate to dashboard after adding
  };

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    storage.saveExpenses(updatedExpenses);
  };

  const handleEditExpense = (updatedExpense: Expense) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === updatedExpense.id ? updatedExpense : expense
    );
    setExpenses(updatedExpenses);
    storage.saveExpenses(updatedExpenses);
  };

  const handleCategorySetupComplete = (categories: string[]) => {
    setShowCategorySetup(false);
    // Optionally load demo data with the new categories
    if (categories.length > 0) {
      const demoExpenses = generateDemoData();
      setExpenses(demoExpenses);
      storage.saveExpenses(demoExpenses);
    }
  };

  const handleCategorySetupSkip = () => {
    setShowCategorySetup(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (showCategorySetup) {
    return (
      <CategorySetup
        onComplete={handleCategorySetupComplete}
        onSkip={handleCategorySetupSkip}
      />
    );
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard expenses={expenses} onTabChange={setActiveTab} />;
      case 'add-expense':
        return <ExpenseForm onAddExpense={handleAddExpense} />;
      case 'expenses':
        return (
          <ExpenseList
            expenses={expenses}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={handleEditExpense}
          />
        );
      case 'categories':
        return (
          <CategoryManagement
            expenses={expenses}
            onUpdateExpenses={(updatedExpenses) => {
              setExpenses(updatedExpenses);
              storage.saveExpenses(updatedExpenses);
            }}
          />
        );
      case 'reports':
        return <Reports expenses={expenses} />;
      default:
        return <Dashboard expenses={expenses} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />

      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 pb-20 lg:pb-0">
          {renderActiveComponent()}
        </main>
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;