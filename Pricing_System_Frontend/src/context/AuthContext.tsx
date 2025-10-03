import React, { useReducer, useEffect } from "react";
import type { ReactNode } from "react";
import type {
  AuthState,
  AuthContextType,
  User,
  UserRole,
  LoginCredentials,
} from "../types";
import { storage } from "../utils/storage";
import { authService } from "../services/authService.js";
import { AuthContext } from "./AuthContextInstance.js";

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
};

// Action types
type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESTORE_SESSION"; payload: { user: User; token: string } };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        isLoading: true,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "RESTORE_SESSION":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = storage.getToken();
        const userData = storage.getUserData();

        if (token && userData) {
          // Verify token with backend (optional)
          // const isValid = await authService.verifyToken(token);
          // if (isValid) {
          dispatch({
            type: "RESTORE_SESSION",
            payload: { user: userData, token },
          });
          // } else {
          //   storage.clearAuthData();
          // }
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        storage.clearAuthData();
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    restoreSession();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: "LOGIN_START" });

      const response = await authService.login(credentials);

      // Store in localStorage
      storage.setToken(response.token);
      storage.setUserData(response.user);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: response.user, token: response.token },
      });
    } catch (error) {
      console.error("Login failed:", error);
      dispatch({ type: "LOGIN_FAILURE" });
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    storage.clearAuthData();
    dispatch({ type: "LOGOUT" });
  };

  // Permission checking functions
  const hasPermission = (permission: string): boolean => {
    if (!authState.user) return false;
    return authState.user.permissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    if (!authState.user) return false;
    return authState.user.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!authState.user) return false;
    return roles.includes(authState.user.role);
  };

  const contextValue: AuthContextType = {
    authState,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
