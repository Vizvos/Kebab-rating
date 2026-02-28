import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthDialog from './AuthDialog';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <nav className="navbar">
        <h1>Kebab Rating</h1>
        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span>Hi, {user.displayName || 'Kebab Hunter'}</span>
              <button onClick={logout}>Sign Out</button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)}>Přihlásit se</button>
          )}
        </div>
      </nav>

      {showAuth && <AuthDialog onClose={() => setShowAuth(false)} />}
    </>
  );
}
