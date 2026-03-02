import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import { Expense } from './types';
import { expenseService } from './services/expenseService';


// Main App Component (wrapped with AuthProvider)
function AppContent() {
  const { currentUser, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategorySetup, setShowCategorySetup] = useState(false);

  // Clave de localStorage para saber si el usuario ya vio el setup de categorías
  const getCategorySetupKey = (userId: string) => `categorySetupSeen_${userId}`;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadUserData = async () => {
      if (currentUser) {
        try {
          // Solo mostrar el setup de categorías si el usuario NUNCA lo ha visto antes
          // NO creamos categorías automáticamente — el usuario elige
          const setupKey = getCategorySetupKey(currentUser.id);
          const hasSeenSetup = localStorage.getItem(setupKey) === 'true';

          if (!hasSeenSetup) {
            setShowCategorySetup(true);
          }

          // Set up real-time listener for expenses
          unsubscribe = expenseService.subscribeToUserExpenses(currentUser.id, (userExpenses) => {
            setExpenses(userExpenses);
          });
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
      setIsLoading(false);
    };

    if (!loading) {
      loadUserData();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, loading]);

  const handleLogout = async () => {
    try {
      await signOut();
      setExpenses([]);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!currentUser) return;

    try {
      await expenseService.addExpense(currentUser.id, expenseData);
      // Expenses will be updated via real-time listener
      setActiveTab('dashboard'); // Navigate to dashboard after adding
    } catch (error) {
      console.error('Error adding expense:', error);
      // TODO: Show error message to user
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await expenseService.deleteExpense(id);
      // Expenses will be updated via real-time listener
    } catch (error) {
      console.error('Error deleting expense:', error);
      // TODO: Show error message to user
    }
  };

  const handleEditExpense = async (updatedExpense: Expense) => {
    try {
      const { id, ...updateData } = updatedExpense;
      await expenseService.updateExpense(id, updateData);
      // Expenses will be updated via real-time listener
    } catch (error) {
      console.error('Error updating expense:', error);
      // TODO: Show error message to user
    }
  };

  const handleCategorySetupComplete = async () => {
    if (!currentUser) return;

    // Marcar que el usuario ya completó el setup — no volver a mostrarlo nunca
    const setupKey = getCategorySetupKey(currentUser.id);
    localStorage.setItem(setupKey, 'true');

    setShowCategorySetup(false);
    // Categories are already created by the CategorySetup component
    // Expenses will be updated via real-time listener if any demo data was added
  };

  const handleCategorySetupSkip = () => {
    if (currentUser) {
      // Marcar que el usuario ya vio el setup (aunque lo omitió) — no volver a mostrarlo
      const setupKey = getCategorySetupKey(currentUser.id);
      localStorage.setItem(setupKey, 'true');
    }
    setShowCategorySetup(false);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
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
              // Note: CategoryManagement should use Firebase services directly
              // This is kept for backward compatibility
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
      <Header user={currentUser} onLogout={handleLogout} />

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

// Main App component with AuthProvider wrapper
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;