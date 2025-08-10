import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  // Check if user email is in authorized users list
  async isAuthorizedUser(email: string): Promise<boolean> {
    try {
      const authorizedUserDoc = await getDoc(doc(db, 'authorizedUsers', email));
      return authorizedUserDoc.exists() && authorizedUserDoc.data()?.isActive === true;
    } catch (error) {
      console.error('Error checking authorized user:', error);
      return false;
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Attempt to sign in first
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Now check if user is authorized (after authentication)
      const isAuthorized = await this.isAuthorizedUser(email);
      if (!isAuthorized) {
        // Sign out the user if not authorized
        await signOut(auth);
        return {
          success: false,
          error: 'You are not authorized to access this application. Please contact your administrator.'
        };
      }

      // Create or update user document
      const user = await this.createOrUpdateUser(firebaseUser);

      return {
        success: true,
        user
      };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = 'An error occurred during sign in.';

      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = authError.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Create or update user document in Firestore
  private async createOrUpdateUser(firebaseUser: FirebaseUser): Promise<User> {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName || firebaseUser.email!.split('@')[0]
    };

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userRef, {
        ...userData,
        uid: firebaseUser.uid,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        isActive: true
      });
    } else {
      // Update last login time
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });
    }

    return userData;
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Auth state listener
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Check if current user is authorized (for real-time validation)
  async validateCurrentUser(): Promise<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.email) {
      return false;
    }
    return await this.isAuthorizedUser(currentUser.email);
  }

  // Get authorized users list (admin function)
  async getAuthorizedUsers(): Promise<string[]> {
    try {
      const authorizedUsersRef = collection(db, 'authorizedUsers');
      const q = query(authorizedUsersRef, where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error fetching authorized users:', error);
      return [];
    }
  }
}

export const authService = new AuthService();
export default authService;
