import type { LoginCredentials } from "../types/login";
import type { User } from "../types/auth";
import { apiUrl, enableMockAuth } from "../utils/env";

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${apiUrl}/auth`;
  }

  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> {
    try {
      // Use mock data if enabled, otherwise use real API
      if (enableMockAuth) {
        const { mockLogin } = await import("../utils/mockData");
        const result = mockLogin(credentials.email, credentials.password);

        if (!result) {
          throw new Error("Invalid email or password");
        }

        return result;
      }

      // Real API integration
      const response = await fetch(`${this.baseURL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem("pricing_system_auth_token");

      await fetch(`${this.baseURL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Don't throw error for logout - it should always succeed locally
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  }

  async refreshToken(): Promise<{ token: string }> {
    try {
      const token = localStorage.getItem("pricing_system_auth_token");

      const response = await fetch(`${this.baseURL}/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();
