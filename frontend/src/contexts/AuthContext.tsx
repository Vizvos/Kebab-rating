import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../api/axios';

export interface DbUser {
  id: string;
  name: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  login: () => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  registerEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Načteme skutečné údaje uživatele z naší tabulky `users`
          const { data } = await api.get(`/users/${currentUser.uid}`);
          if (data && data.user) {
             setDbUser(data.user);
          }
        } catch (e) {
          console.error("Failed to fetch DB user data", e);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const token = await cred.user.getIdToken(true);
    // Nastavíme jméno v DB, Firebase updatovat nemusíme, backend bere to jméno
    await api.post('/users/register', { name: name || 'KebabLover' }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    // Přihlásí se automaticky
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, login: async () => {}, loginEmail, registerEmail, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
