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
// Type Declarations
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
  login: (email: string, password: string, role?: Role) => Promise<boolean>;
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
      // Check if the email already exists
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        alert('This email is already registered. Please log in instead.');
        return false;
      }

      // Create new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        uid: firebaseUser.uid,
        name,
        email,
        role,
        createdAt: new Date(),
      });

      // Create role-based document
      if (role === 'patient') {
        await setDoc(doc(db, 'patients', firebaseUser.uid), {
          uid: firebaseUser.uid,
          name,
          email,
          createdAt: new Date(),
        });
      } else if (role === 'doctor') {
        await setDoc(doc(db, 'doctors', firebaseUser.uid), {
          uid: firebaseUser.uid,
          name,
          email,
          createdAt: new Date(),
        });
      }

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role,
      });

      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      const code = error.code || error.message;
      if (code.includes('email-already-in-use')) {
        alert('Email already in use. Please log in instead.');
      } else {
        alert('Registration failed: ' + error.message);
      }
      return false;
    }
  };

  // -----------------------------
  // Login Function (Improved)
  // -----------------------------
  const login = async (email: string, password: string, role?: Role) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Determine role from Firestore
      let fetchedRole: Role = 'patient';
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        fetchedRole = userDoc.data().role as Role;
      } else if (email === 'admin@gmail.com') {
        fetchedRole = 'admin';
      } else if (role) {
        fetchedRole = role;
      }

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: fetchedRole,
      });

      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      const code = error.code || error.message;

      if (code.includes('auth/invalid-credential')) {
        alert('Invalid email or password.');
      } else if (code.includes('auth/user-not-found')) {
        alert('No user found with this email.');
      } else if (code.includes('auth/wrong-password')) {
        alert('Incorrect password.');
      } else {
        alert('Login failed: ' + error.message);
      }

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
  // Monitor Auth State Changes
  // -----------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const role = userDoc.exists()
            ? (userDoc.data().role as Role)
            : firebaseUser.email === 'admin@gmail.com'
            ? 'admin'
            : 'patient';

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role,
          });
        } catch (error) {
          console.error('Error fetching user role:', error);
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
