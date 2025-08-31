'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faSignOutAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface HeaderProps {
  onAddDrill?: () => void;
}

export default function Header({ onAddDrill }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white border-b-2 border-gray-200 p-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="באח 35" className="h-10 w-auto" />
          <h1 className="text-2xl font-bold text-gray-900">מאגר תרגילי באח 35</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <button
              onClick={onAddDrill}
              className="btn-primary flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              הוסף תרגיל
            </button>
          )}
          
          {user ? (
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              התנתק
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSignInAlt} />
              התחבר
            </button>
          )}
        </div>
      </div>

      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleLogin}
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
          >
            <h2 className="text-xl font-bold mb-4 text-center">התחברות</h2>
            <input
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded mb-3 text-right"
              required
            />
            <input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded mb-4 text-right"
              required
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="btn-secondary"
              >
                ביטול
              </button>
              <button type="submit" className="btn-primary">
                התחבר
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}