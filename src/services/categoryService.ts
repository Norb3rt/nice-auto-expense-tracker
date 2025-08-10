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
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Category {
  id: string;
  userId: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: string;
  isDefault: boolean;
  isActive: boolean;
  expenseCount?: number;
}

export interface FirestoreCategory extends Omit<Category, 'id' | 'createdAt'> {
  createdAt: Timestamp;
}

class CategoryService {
  private collectionName = 'categories';

  // Default categories for new users
  private defaultCategories = [
    { name: 'Food & Dining', color: '#FF6B6B', icon: '🍽️' },
    { name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
    { name: 'Shopping', color: '#45B7D1', icon: '🛍️' },
    { name: 'Entertainment', color: '#96CEB4', icon: '🎬' },
    { name: 'Bills & Utilities', color: '#FFEAA7', icon: '💡' },
    { name: 'Healthcare', color: '#DDA0DD', icon: '🏥' },
    { name: 'Education', color: '#98D8C8', icon: '📚' },
    { name: 'Travel', color: '#F7DC6F', icon: '✈️' }
  ];

  // Convert Firestore document to Category type
  private convertToCategory(doc: any): Category {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      name: data.name,
      color: data.color,
      icon: data.icon,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      isDefault: data.isDefault || false,
      isActive: data.isActive !== false, // Default to true if not specified
      expenseCount: data.expenseCount || 0
    };
  }

  // Create default categories for new user
  async createDefaultCategories(userId: string): Promise<Category[]> {
    try {
      const categories: Category[] = [];
      
      for (const defaultCat of this.defaultCategories) {
        const docRef = await addDoc(collection(db, this.collectionName), {
          userId,
          name: defaultCat.name,
          color: defaultCat.color,
          icon: defaultCat.icon,
          createdAt: serverTimestamp(),
          isDefault: true,
          isActive: true,
          expenseCount: 0
        });

        categories.push({
          id: docRef.id,
          userId,
          name: defaultCat.name,
          color: defaultCat.color,
          icon: defaultCat.icon,
          createdAt: new Date().toISOString(),
          isDefault: true,
          isActive: true,
          expenseCount: 0
        });
      }

      return categories;
    } catch (error) {
      console.error('Error creating default categories:', error);
      throw new Error('Failed to create default categories');
    }
  }

  // Add new category
  async addCategory(userId: string, categoryData: {
    name: string;
    color?: string;
    icon?: string;
  }): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        userId,
        name: categoryData.name,
        color: categoryData.color || '#6B7280',
        icon: categoryData.icon || '📁',
        createdAt: serverTimestamp(),
        isDefault: false,
        isActive: true,
        expenseCount: 0
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw new Error('Failed to add category');
    }
  }

  // Update category
  async updateCategory(categoryId: string, categoryData: Partial<{
    name: string;
    color: string;
    icon: string;
    isActive: boolean;
  }>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, categoryId);
      await updateDoc(docRef, categoryData);
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  // Delete category (soft delete by setting isActive to false)
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, categoryId);
      await updateDoc(docRef, {
        isActive: false
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  // Hard delete category (permanent removal)
  async permanentlyDeleteCategory(categoryId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, categoryId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error permanently deleting category:', error);
      throw new Error('Failed to permanently delete category');
    }
  }

  // Get single category
  async getCategory(categoryId: string): Promise<Category | null> {
    try {
      const docRef = doc(db, this.collectionName, categoryId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.convertToCategory(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error getting category:', error);
      throw new Error('Failed to get category');
    }
  }

  // Get all categories for a user
  async getUserCategories(userId: string, includeInactive: boolean = false): Promise<Category[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'asc')
      );

      if (!includeInactive) {
        q = query(
          collection(db, this.collectionName),
          where('userId', '==', userId),
          where('isActive', '==', true),
          orderBy('createdAt', 'asc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertToCategory(doc));
    } catch (error) {
      console.error('Error getting user categories:', error);
      throw new Error('Failed to get categories');
    }
  }

  // Get active category names for a user (for dropdowns)
  async getUserCategoryNames(userId: string): Promise<string[]> {
    try {
      const categories = await this.getUserCategories(userId, false);
      return categories.map(cat => cat.name);
    } catch (error) {
      console.error('Error getting category names:', error);
      throw new Error('Failed to get category names');
    }
  }

  // Real-time listener for user categories
  subscribeToUserCategories(userId: string, callback: (categories: Category[]) => void): () => void {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const categories = querySnapshot.docs.map(doc => this.convertToCategory(doc));
      callback(categories);
    }, (error) => {
      console.error('Error in categories subscription:', error);
    });
  }

  // Update expense count for a category
  async updateCategoryExpenseCount(categoryId: string, count: number): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, categoryId);
      await updateDoc(docRef, {
        expenseCount: count
      });
    } catch (error) {
      console.error('Error updating category expense count:', error);
      // Don't throw error as this is not critical
    }
  }

  // Check if user has categories, if not create defaults
  async ensureUserHasCategories(userId: string): Promise<Category[]> {
    try {
      const existingCategories = await this.getUserCategories(userId);
      
      if (existingCategories.length === 0) {
        return await this.createDefaultCategories(userId);
      }
      
      return existingCategories;
    } catch (error) {
      console.error('Error ensuring user has categories:', error);
      throw new Error('Failed to ensure user has categories');
    }
  }
}

export const categoryService = new CategoryService();
export default categoryService;
