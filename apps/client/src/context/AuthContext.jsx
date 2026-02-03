import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getUserByTokenApi } from '../api/authApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 자동 로그인 (토큰이 있으면)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const userData = await getUserByTokenApi(token);
          setUser(userData);
        } catch (error) {
          console.error('자동 로그인 실패:', error);
          localStorage.removeItem(TOKEN_KEY);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // 로그인
  const login = async (username, password) => {
    const { user, token } = await loginApi(username, password);
    setUser(user);
    localStorage.setItem(TOKEN_KEY, token);
  };

  // 회원가입
  const register = async (userData) => {
    const { user } = await registerApi(userData);
    // 회원가입 후 자동 로그인은 하지 않음 (로그인 페이지로 이동)
    return user;
  };

  // 로그아웃
  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  // 사용자 정보 업데이트 (마이페이지 수정 후 등)
  const updateUser = (updatedData) => {
    setUser(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
