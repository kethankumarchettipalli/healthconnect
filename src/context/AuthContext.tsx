// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  fetchSignInMethodsForEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// -----------------------------
// Types
// -----------------------------
type Role = 'patient' | 'doctor' | 'admin';

interface CustomUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role: Role;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  register: (name: string, email: string, password: string, role: Role) => Promise<boolean>;
  login: (email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => Promise<void>;
}

// -----------------------------
// Context Setup
// -----------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Register Function
  // -----------------------------
  const register = async (name: string, email: string, password: string, role: Role) => {
    try {
      const existingMethods = await fetchSignInMethodsForEmail(auth, email);
      if (existingMethods.length > 0) {
        alert('This email is already registered. Please log in instead.');
        return false;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });

      // Store base user data
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        uid: firebaseUser.uid,
        name,
        email,
        role,
        createdAt: new Date(),
      });

      // Store role-specific data
      const roleCollection = role === 'doctor' ? 'doctors' : role === 'patient' ? 'patients' : 'admins';
      await setDoc(doc(db, roleCollection, firebaseUser.uid), {
        uid: firebaseUser.uid,
        name,
        email,
        createdAt: new Date(),
      });

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role,
      });

      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(`Registration failed: ${error.message}`);
      return false;
    }
  };

  // -----------------------------
  // Login Function (Fixed)
  // -----------------------------
  const login = async (email: string, password: string, role: Role) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch role from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        alert('User record not found.');
        await signOut(auth);
        return false;
      }

      const storedRole = userDoc.data().role as Role;

      // ❌ Prevent logging in with wrong role
      if (storedRole !== role) {
        alert(`Access denied. This account is registered as a ${storedRole}.`);
        await signOut(auth);
        return false;
      }

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: storedRole,
      });

      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.message}`);
      return false;
    }
  };

  // -----------------------------
  // Logout Function
  // -----------------------------
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // -----------------------------
  // Auth State Listener
  // -----------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const role = userDoc.exists() ? (userDoc.data().role as Role) : 'patient';
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role,
          });
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// -----------------------------
// Custom Hook
// -----------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
