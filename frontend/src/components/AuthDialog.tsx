import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onClose: () => void;
}

export default function AuthDialog({ onClose }: Props) {
  const { loginEmail, registerEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginEmail(email, password);
      } else {
        await registerEmail(email, password, name);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error', err);
      setError(err.message || 'Nastala chyba při autentizaci');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
      <div className="dialog-box">
        <h2>{isLogin ? 'Přihlášení' : 'Registrace'}</h2>
        {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Přezdívka</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Heslo</label>
            <input 
              required 
              type="password" 
              minLength={6}
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          <p 
            style={{ color: '#fca311', cursor: 'pointer', textAlign: 'right', fontSize: '0.9rem' }} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Nemáš účet? Zaregistruj se' : 'Už máš účet? Přihlas se'}
          </p>

          <div className="dialog-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>Zrušit</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Odesílám..." : (isLogin ? "Přihlásit" : "Zaregistrovat")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
