import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'user' or 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('user');
      const savedUserType = localStorage.getItem('userType');
      
      if (savedUser && savedUserType) {
        setUser(JSON.parse(savedUser));
        setUserType(savedUserType);
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password, type) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      let authenticatedUser = null;
      
      if (type === 'admin') {
        // Admin credentials
        if (username === 'admin' && password === 'admin123') {
          authenticatedUser = {
            id: 1,
            name: 'Admin User',
            email: 'admin@company.com',
            role: 'Administrator',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          };
        }
      } else {
        // User credentials
        if (username === 'user' && password === 'user123') {
          authenticatedUser = {
            id: 2,
            name: 'John Doe',
            email: 'john.doe@company.com',
            role: 'User',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          };
        }
      }
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        setUserType(type);
        setIsAuthenticated(true);
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
        localStorage.setItem('userType', type);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Invalid credentials. Please try again.' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  };

  const value = {
    user,
    userType,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
