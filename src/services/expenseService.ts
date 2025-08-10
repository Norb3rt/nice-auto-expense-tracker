import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Expense } from '../types';

export interface FirestoreExpense extends Omit<Expense, 'id' | 'createdAt'> {
  userId: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

class ExpenseService {
  private collectionName = 'expenses';

  // Convert Firestore document to Expense type
  private convertToExpense(doc: any): Expense {
    const data = doc.data();
    return {
      id: doc.id,
      amount: data.amount,
      description: data.description,
      category: data.category,
      date: data.date,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
    };
  }

  // Add new expense
  async addExpense(userId: string, expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...expenseData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw new Error('Failed to add expense');
    }
  }

  // Update expense
  async updateExpense(expenseId: string, expenseData: Partial<Omit<Expense, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, expenseId);
      await updateDoc(docRef, {
        ...expenseData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      throw new Error('Failed to update expense');
    }
  }

  // Delete expense
  async deleteExpense(expenseId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, expenseId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw new Error('Failed to delete expense');
    }
  }

  // Get single expense
  async getExpense(expenseId: string): Promise<Expense | null> {
    try {
      const docRef = doc(db, this.collectionName, expenseId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.convertToExpense(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error getting expense:', error);
      throw new Error('Failed to get expense');
    }
  }

  // Get all expenses for a user
  async getUserExpenses(userId: string): Promise<Expense[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertToExpense(doc));
    } catch (error) {
      console.error('Error getting user expenses:', error);
      throw new Error('Failed to get expenses');
    }
  }

  // Get expenses by category
  async getExpensesByCategory(userId: string, category: string): Promise<Expense[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertToExpense(doc));
    } catch (error) {
      console.error('Error getting expenses by category:', error);
      throw new Error('Failed to get expenses by category');
    }
  }

  // Get expenses by date range
  async getExpensesByDateRange(userId: string, startDate: string, endDate: string): Promise<Expense[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertToExpense(doc));
    } catch (error) {
      console.error('Error getting expenses by date range:', error);
      throw new Error('Failed to get expenses by date range');
    }
  }

  // Get recent expenses (limited)
  async getRecentExpenses(userId: string, limitCount: number = 10): Promise<Expense[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertToExpense(doc));
    } catch (error) {
      console.error('Error getting recent expenses:', error);
      throw new Error('Failed to get recent expenses');
    }
  }

  // Real-time listener for user expenses
  subscribeToUserExpenses(userId: string, callback: (expenses: Expense[]) => void): () => void {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const expenses = querySnapshot.docs.map(doc => this.convertToExpense(doc));
      callback(expenses);
    }, (error) => {
      console.error('Error in expenses subscription:', error);
    });
  }

  // Get expense statistics
  async getExpenseStats(userId: string): Promise<{
    totalExpenses: number;
    totalAmount: number;
    averageAmount: number;
    expenseCount: number;
  }> {
    try {
      const expenses = await this.getUserExpenses(userId);
      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const expenseCount = expenses.length;
      const averageAmount = expenseCount > 0 ? totalAmount / expenseCount : 0;

      return {
        totalExpenses: expenseCount,
        totalAmount,
        averageAmount,
        expenseCount
      };
    } catch (error) {
      console.error('Error getting expense stats:', error);
      throw new Error('Failed to get expense statistics');
    }
  }
}

export const expenseService = new ExpenseService();
export default expenseService;
