import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem('role') || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Restore user role on refresh
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedToken = localStorage.getItem('token');

    if (storedToken && storedRole) {
      setUser(storedRole);
      setToken(storedToken);
    }
  }, []);

  const login = async (email, password, navigate) => {
    try {
      const res = await axios.post('/api/admin/login', {
        email,
        password
      });

      const { token, role } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      setToken(token);
      setUser(role);

      navigate('/dashbord');
    } catch (err) {
      alert('Login failed');
      console.error(err);
    }
  };

  const logout = (navigate) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    if (navigate) navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
