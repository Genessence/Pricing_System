import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'user', 'admin', or 'super_admin'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("user");
      const savedUserType = localStorage.getItem("userType");
      const savedToken = localStorage.getItem("access_token");

      if (savedUser && savedUserType && savedToken) {
        try {
          // Verify token is still valid by getting current user
          apiService.setToken(savedToken);
          const currentUser = await apiService.getCurrentUser();

          setUser(currentUser);
          setUserType(savedUserType);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token validation failed:", error);
          // Clear invalid session
          apiService.logout();
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password, type) => {
    console.log("🔐 Login attempt:", { username, password, type });
    setIsLoading(true);

    try {
      // Call real backend API
      const response = await apiService.login(username, password, type);

      console.log("✅ Authentication successful:", response);

      // Update state
      setUser(response.user);
      setUserType(type);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("❌ Login error:", error);
      return {
        success: false,
        error: error.message || "Login failed. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    userType,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
