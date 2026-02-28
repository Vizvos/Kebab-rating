import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../api/axios';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  loginEmail: (email: string, pass: string) => Promise<void>;
  registerEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Pokaždé když se uživatel přihlásí, na backendu se automaticky spustí /users/register
// Tím se zaregistruje nebo obdrží svá oprávnění do DB
const registerUserInDb = async (currentUser: User) => {
    try {
        await api.post('/users/register', { name: currentUser.displayName || 'KebabLover' });
    } catch (e) {
        console.error("Registrace zlyhala na serveru:", e);
    }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      // Ihned vytvořit nebo syncnout profil v DB na Backendu
      if (currentUser) {
          await registerUserInDb(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerEmail = async (email: string, pass: string, name: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
    // Nastavíme jméno v DB, Firebase updatovat nemusíme, backend bere to jméno
    await api.post('/users/register', { name: name || 'KebabLover' });
    // Přihlásí se automaticky
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: async () => {}, loginEmail, registerEmail, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
